import prisma from '../utils/prisma.js';

export const getPlans = async (req, res) => {
  try {
    const plans = await prisma.manpowerPlan.findMany({
      include: {
        createdBy: {
          select: { id: true, name: true, role: true }
        },
        approvals: {
          include: {
            approver: {
              select: { id: true, name: true, role: true }
            }
          }
        },
        members: {
          include: {
            manPower: {
              select: { name: true, position: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(plans);
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPlanById = async (req, res) => {
  try {
    const plan = await prisma.manpowerPlan.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        createdBy: {
          select: { id: true, name: true, role: true }
        },
        approvals: {
          include: {
            approver: {
              select: { id: true, name: true, role: true }
            }
          }
        },
        members: {
          include: {
            manPower: true
          }
        },
        audits: {
          include: {
            user: { select: { id: true, name: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!plan) return res.status(404).json({ error: 'Plan not found' });
    res.json(plan);
  } catch (error) {
    console.error('Error fetching plan:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createPlan = async (req, res) => {
  try {
    const { title, startDate, endDate, department, area, members, approvers, isUrgentBypass } = req.body;
    const userId = req.user.id;

    let initialStatus = isUrgentBypass ? 'Waiting VP Approval' : 'Waiting AVP Approval';

    // Using transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Plan
      const newPlan = await tx.manpowerPlan.create({
        data: {
          title,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          department,
          area,
          status: initialStatus,
          createdById: userId,
        }
      });

      // 2. Add members
      if (members && members.length > 0) {
        await tx.manpowerPlanMember.createMany({
          data: members.map(m => ({
            planId: newPlan.id,
            manPowerId: m.manPowerId,
            role: m.role || '',
            notes: m.notes || ''
          }))
        });
      }

      // 3. Add approvers
      if (approvers && approvers.length > 0) {
        await tx.manpowerPlanApproval.createMany({
          data: approvers.map(a => ({
            planId: newPlan.id,
            approverId: a.userId,
            role: a.role, // 'AVP' or 'VP'
            status: 'Pending'
          }))
        });
      }

      // 4. Audit Trail
      await tx.manpowerPlanAudit.create({
        data: {
          planId: newPlan.id,
          userId: userId,
          action: isUrgentBypass ? 'Bypass' : 'Created',
          details: `Plan created with ${members?.length || 0} members.`
        }
      });

      return newPlan;
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating plan:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const processApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body; // status: 'Approved', 'Rejected', 'Revision'
    const userId = req.user.id;

    await prisma.$transaction(async (tx) => {
      // 1. Find the approval record for this user
      const approval = await tx.manpowerPlanApproval.findFirst({
        where: { planId: parseInt(id), approverId: userId, status: 'Pending' }
      });

      if (!approval) {
        throw new Error('No pending approval found for this user');
      }

      // 2. Update the approval status
      await tx.manpowerPlanApproval.update({
        where: { id: approval.id },
        data: {
          status,
          notes: notes || null,
          actionDate: new Date()
        }
      });

      // 3. Determine the new plan status
      const plan = await tx.manpowerPlan.findUnique({
        where: { id: parseInt(id) },
        include: { approvals: true }
      });

      let newPlanStatus = plan.status;
      if (status === 'Rejected') {
        newPlanStatus = 'Rejected';
      } else if (status === 'Revision') {
        newPlanStatus = 'Revision Requested';
      } else if (status === 'Approved') {
        // Check if all AVPs have approved, if so move to Waiting VP Approval
        const pendingAvps = plan.approvals.filter(a => a.role === 'AVP' && (a.status === 'Pending' || a.id === approval.id && status !== 'Approved'));
        
        if (approval.role === 'AVP' && pendingAvps.length === 0) {
           newPlanStatus = 'Waiting VP Approval';
        } else if (approval.role === 'VP') {
           newPlanStatus = 'Approved';
        }
      }

      // 4. Update plan status if changed
      if (newPlanStatus !== plan.status) {
        await tx.manpowerPlan.update({
          where: { id: parseInt(id) },
          data: { status: newPlanStatus }
        });
      }

      // 5. Create Audit Trail
      await tx.manpowerPlanAudit.create({
        data: {
          planId: parseInt(id),
          userId: userId,
          action: status,
          details: notes || `Document ${status.toLowerCase()}`
        }
      });
    });

    res.json({ message: 'Approval processed successfully' });
  } catch (error) {
    console.error('Error processing approval:', error);
    res.status(400).json({ error: error.message || 'Internal server error' });
  }
};

export const checkAvailability = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
       return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Get all manpower
    const manpowerList = await prisma.manPower.findMany({
      where: { is_active: true },
      include: {
        divisi: true,
        // include absensi overlaps
        absensi: {
          where: {
            AND: [
              { tanggal_mulai: { lte: end } },
              { tanggal_selesai: { gte: start } }
            ]
          }
        },
        // include active plan conflicts
        plan_members: {
          where: {
            plan: {
              status: { notIn: ['Rejected', 'Cancelled'] },
              AND: [
                { startDate: { lte: end } },
                { endDate: { gte: start } }
              ]
            }
          },
          include: {
            plan: {
              select: { title: true, status: true, startDate: true, endDate: true }
            }
          }
        }
      }
    });

    res.json(manpowerList);
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getApprovers = async (req, res) => {
  try {
    const approvers = await prisma.user.findMany({
      include: {
        man_power: true
      },
      orderBy: { name: 'asc' }
    });
    
    // Format the response to include the explicit ManPower position if available
    const formattedApprovers = approvers.map(u => ({
      id: u.id,
      name: u.name,
      role: u.role,
      position: u.man_power ? u.man_power.position : u.role
    }));
    
    res.json(formattedApprovers);
  } catch (error) {
    console.error('Error fetching approvers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
