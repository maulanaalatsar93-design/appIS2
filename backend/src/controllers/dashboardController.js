import prisma from '../utils/prisma.js';

export const getDashboardSummary = async (req, res) => {
  try {
    const { year, month, workCenter } = req.query;
    let selectedYear = null;
    if (year && year !== 'undefined' && year !== 'Semua' && year !== 'ALL') {
      const parsed = parseInt(year);
      if (!isNaN(parsed)) selectedYear = parsed;
    }

    let woWhere = {};
    if (workCenter && workCenter !== 'Semua Bagian') {
      woWhere.work_center = { contains: workCenter, mode: 'insensitive' };
    }

    let rekWhere = {};

    const activeMonth = (month && month !== 'undefined' && month !== 'Semua Bulan' && month !== 'ALL' && month !== 'Semua') ? month : null;

    if (activeMonth) {
      const monthNum = parseInt(activeMonth);
      const targetYear = selectedYear || new Date().getFullYear();
      const startDate = new Date(Date.UTC(targetYear, monthNum - 1, 1, 0, 0, 0));
      const endDate = new Date(Date.UTC(targetYear, monthNum, 0, 23, 59, 59, 999));

      woWhere.OR = [
        { tanggal_dibuat: { gte: startDate, lte: endDate } },
        { tanggal_dibuat: null, createdAt: { gte: startDate, lte: endDate } }
      ];

      rekWhere.OR = [
        { created_on: { gte: startDate, lte: endDate } },
        { created_on: null, createdAt: { gte: startDate, lte: endDate } }
      ];
    } else if (selectedYear) {
      const startOfYear = new Date(Date.UTC(selectedYear, 0, 1, 0, 0, 0));
      const endOfYear = new Date(Date.UTC(selectedYear, 11, 31, 23, 59, 59, 999));

      woWhere.OR = [
        { tanggal_dibuat: { gte: startOfYear, lte: endOfYear } },
        { tanggal_dibuat: null, createdAt: { gte: startOfYear, lte: endOfYear } }
      ];

      rekWhere.OR = [
        { created_on: { gte: startOfYear, lte: endOfYear } },
        { created_on: null, createdAt: { gte: startOfYear, lte: endOfYear } }
      ];
    }

    const now = new Date();
    const todayStart = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0));
    const todayEnd = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999));

    const manPowerWhere = { is_active: true };
    const absentWhere = {
      tanggal_mulai: { lte: todayEnd },
      tanggal_selesai: { gte: todayStart }
    };

    if (workCenter && workCenter !== 'Semua Bagian') {
      manPowerWhere.divisi = {
        work_center_sap: { contains: workCenter, mode: 'insensitive' }
      };
      absentWhere.man_power = {
        divisi: {
          work_center_sap: { contains: workCenter, mode: 'insensitive' }
        }
      };
    }

    const todayHoliday = await prisma.hariLibur.findFirst({
      where: {
        tanggal: { gte: todayStart, lte: todayEnd }
      }
    });
    const dayOfWeek = now.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isOffdayDefault = isWeekend || !!todayHoliday;

    // Concurrent batch query
    const [
      woGroupByTipe,
      rekGroupByNotif,
      woGroupByPabrik,
      rekGroupByPabrik,
      pabriksList,
      woTrendData,
      rekTrendData,
      totalPersonilList,
      absentRecords,
      expiredCertifications
    ] = await Promise.all([
      prisma.workOrder.groupBy({
        by: ['tipe_pm'],
        where: woWhere,
        _count: { id: true }
      }),
      prisma.rekomendasi.groupBy({
        by: ['notification_type'],
        where: rekWhere,
        _count: { id: true }
      }),
      prisma.workOrder.groupBy({
        by: ['pabrik_id'],
        where: woWhere,
        _count: { id: true }
      }),
      prisma.rekomendasi.groupBy({
        by: ['pabrik_id'],
        where: rekWhere,
        _count: { id: true }
      }),
      prisma.pabrik.findMany({ orderBy: { id: 'asc' } }),
      prisma.workOrder.findMany({
        where: woWhere,
        select: { 
          tanggal_dibuat: true, createdAt: true, tipe_pm: true, pabrik_id: true, 
          work_center: true, status: true, 
          nomor_wo: true, operation_activity: true, description: true, equipment: true 
        }
      }),
      prisma.rekomendasi.findMany({
        where: rekWhere,
        select: { created_on: true, createdAt: true, notification_type: true, pabrik_id: true }
      }),
      prisma.manPower.findMany({
        where: manPowerWhere,
        select: { 
          id: true, 
          employee_type: true,
          wp_memberships: {
            include: { program: true }
          },
          plan_members: {
            include: { plan: true }
          }
        }
      }),
      prisma.statusKehadiran.findMany({
        where: absentWhere,
        include: { man_power: { select: { id: true, employee_type: true, name: true, npk: true, position: true } } },
        distinct: ['man_power_id']
      }),
      prisma.sertifikasi.findMany({
        where: {
          is_rencana: false,
          tanggal_berakhir: {
            lt: todayStart
          }
        },
        include: { man_power: { select: { name: true, npk: true } } },
        orderBy: { tanggal_berakhir: 'desc' }
      })
    ]);

    let totalWO = 0;
    let pm04Count = 0;
    let pm02PlusCount = 0;
    let pm02PlusCountNonCNF = 0;
    const pmTypes = ['PM01', 'PM02', 'PM03', 'PM04', 'PM05', 'PM06', 'PM07', 'PM08', 'PM09', 'PM10'];
    const pmBreakdown = {};
    const pmBreakdownNonCNF = {};
    pmTypes.forEach(t => { 
      pmBreakdown[t] = 0; 
      pmBreakdownNonCNF[t] = 0; 
    });

    woGroupByTipe.forEach(item => {
      const cnt = item._count.id;
      totalWO += cnt;
      if (item.tipe_pm === 'PM04') {
        pm04Count += cnt;
      } else {
        pm02PlusCount += cnt;
      }
      if (item.tipe_pm && pmBreakdown[item.tipe_pm] !== undefined) {
        pmBreakdown[item.tipe_pm] += cnt;
      }
    });

    woTrendData.forEach(item => {
      const st = (item.status || '').toUpperCase();
      const isCnf = (st.includes('CNF') || st.includes('TECO')) && !st.includes('PCNF');
      
      if (!isCnf) {
        if (item.tipe_pm && pmBreakdownNonCNF[item.tipe_pm] !== undefined) {
          pmBreakdownNonCNF[item.tipe_pm]++;
        }
        if (item.tipe_pm !== 'PM04') {
          pm02PlusCountNonCNF++;
        }
      }
    });

    let totalRek = 0;
    let m04Count = 0;
    let m07Count = 0;
    rekGroupByNotif.forEach(item => {
      const cnt = item._count.id;
      totalRek += cnt;
      const type = item.notification_type ? String(item.notification_type).toUpperCase() : '';
      if (type === 'M4' || type === 'M04') m04Count += cnt;
      if (type === 'M7' || type === 'M07') m07Count += cnt;
    });

    const pabriks = (pabriksList && pabriksList.length > 0) ? pabriksList : [
      { id: 1, nama_pabrik: 'P1A' }, { id: 2, nama_pabrik: 'P2' },
      { id: 3, nama_pabrik: 'P3' }, { id: 4, nama_pabrik: 'P4' },
      { id: 5, nama_pabrik: 'P5' }, { id: 6, nama_pabrik: 'P6' },
      { id: 7, nama_pabrik: 'P7' }
    ];

    const factoryCategories = pabriks.map(p => p.nama_pabrik);
    const woPabrikMap = {};
    woGroupByPabrik.forEach(item => { woPabrikMap[item.pabrik_id] = item._count.id; });
    const rekPabrikMap = {};
    rekGroupByPabrik.forEach(item => { rekPabrikMap[item.pabrik_id] = item._count.id; });

    const woPerFactory = pabriks.map(p => woPabrikMap[p.id] || 0);
    const rekPerFactory = pabriks.map(p => rekPabrikMap[p.id] || 0);

    const targetTrendYear = selectedYear || (woTrendData.length > 0 ? new Date(woTrendData[0].tanggal_dibuat || woTrendData[0].createdAt).getUTCFullYear() : 2026);

    const monthlyWoTrend = [];
    const monthlyPm04Trend = [];
    const monthlyPm02PlusTrend = [];
    const monthlyRekTrend = [];
    const monthlyM04Trend = [];
    const monthlyM07Trend = [];

    for (let m = 0; m < 12; m++) {
      const wData = woTrendData.filter(w => {
        const d = w.tanggal_dibuat || w.createdAt;
        return d && new Date(d).getUTCFullYear() === targetTrendYear && new Date(d).getUTCMonth() === m;
      });
      const rData = rekTrendData.filter(r => {
        const d = r.created_on || r.createdAt;
        return d && new Date(d).getUTCFullYear() === targetTrendYear && new Date(d).getUTCMonth() === m;
      });

      monthlyWoTrend.push(wData.length);
      monthlyPm04Trend.push(wData.filter(w => w.tipe_pm === 'PM04').length);
      monthlyPm02PlusTrend.push(wData.filter(w => w.tipe_pm !== 'PM04').length);

      monthlyRekTrend.push(rData.length);
      monthlyM04Trend.push(rData.filter(r => r.notification_type === 'M4' || r.notification_type === 'M04').length);
      monthlyM07Trend.push(rData.filter(r => r.notification_type === 'M7' || r.notification_type === 'M07').length);
    }

    const allPersonil = totalPersonilList || [];
    const totalPersonil = allPersonil.length;
    let organikTotal = 0;
    let nonOrganikTotal = 0;

    allPersonil.forEach(p => {
      const empType = (p.employee_type || '').toLowerCase();
      if (empType.includes('non')) {
        nonOrganikTotal++;
      } else {
        organikTotal++;
      }
    });

    let cuti = 0, izin = 0, dinas = 0, sakit = 0, lainnya = 0;
    let organikAbsen = 0;
    let nonOrganikAbsen = 0;

    const manpowerDetailed = {
      absen: 0,
      cuti: 0,
      izin: 0,
      sakit: 0,
      referal: 0,
      dinasDalamNegeri: 0,
      dinasLuarNegeri: 0,
      training: 0,
      lists: {
        absen: [],
        cuti: [],
        izin: [],
        sakit: [],
        referal: [],
        dinasDalamNegeri: [],
        dinasLuarNegeri: [],
        training: []
      }
    };

    absentRecords.forEach(record => {
      const jenis = (record.jenis || '').toLowerCase().trim();
      const personil = record.man_power
        ? { id: record.man_power.id, name: record.man_power.name, npk: record.man_power.npk, position: record.man_power.position, employee_type: record.man_power.employee_type }
        : {};

      // Cek luar negeri dulu (lebih spesifik) sebelum dalam negeri
      if (
        jenis.includes('luar negeri') || jenis.includes('luar negri') ||
        jenis.includes('keluar negri') || jenis === 'dln' || jenis === 'dinas luar negeri' ||
        jenis.includes('overseas') || jenis.includes('abroad')
      ) {
        dinas++; manpowerDetailed.dinasLuarNegeri++; manpowerDetailed.lists.dinasLuarNegeri.push(personil);
      } else if (
        jenis.includes('training') || jenis.includes('pelatihan') ||
        jenis.includes('workshop') || jenis.includes('seminar') || jenis.includes('bimtek')
      ) {
        dinas++; manpowerDetailed.training++; manpowerDetailed.lists.training.push(personil);
      } else if (
        jenis.includes('dinas') || jenis.includes('dalam negeri') ||
        jenis.includes('luar kota') || jenis === 'dn' || jenis.includes('tugas luar') ||
        jenis.includes('penugasan')
      ) {
        dinas++; manpowerDetailed.dinasDalamNegeri++; manpowerDetailed.lists.dinasDalamNegeri.push(personil);
      } else if (jenis.includes('cuti') || jenis.includes('annual leave') || jenis.includes('libur')) {
        cuti++; manpowerDetailed.cuti++; manpowerDetailed.lists.cuti.push(personil);
      } else if (jenis.includes('sakit') || jenis.includes('sick') || jenis.includes('rs') || jenis.includes('rawat')) {
        sakit++; manpowerDetailed.sakit++; manpowerDetailed.lists.sakit.push(personil);
      } else if (jenis.includes('referal') || jenis.includes('referral')) {
        sakit++; manpowerDetailed.referal++; manpowerDetailed.lists.referal.push(personil);
      } else if (jenis.includes('izin') || jenis.includes('ijin') || jenis.includes('permit') || jenis.includes('keperluan')) {
        izin++; manpowerDetailed.izin++; manpowerDetailed.lists.izin.push(personil);
      } else if (jenis.includes('absen') || jenis.includes('alpa') || jenis.includes('alpha') || jenis.includes('tanpa keterangan')) {
        lainnya++; manpowerDetailed.absen++; manpowerDetailed.lists.absen.push(personil);
      } else {
        // Fallback: semua jenis lain dianggap absen tanpa keterangan
        lainnya++; manpowerDetailed.absen++; manpowerDetailed.lists.absen.push(personil);
      }

      const empType = (record.man_power?.employee_type || '').toLowerCase();
      if (empType.includes('non')) {
        nonOrganikAbsen++;
      } else {
        organikAbsen++;
      }
    });

    const totalAbsen = cuti + izin + dinas + sakit + lainnya;
    let hadir = 0;
    let organikHadir = 0;
    let nonOrganikHadir = 0;

    if (isOffdayDefault) {
      allPersonil.forEach(p => {
        const empType = (p.employee_type || '').toLowerCase();
        const isOrganik = !empType.includes('non');
        
        const hasActiveWorkProgram = p.wp_memberships?.some(m => {
          const prog = m.program;
          if (prog && prog.start_date && prog.end_date) {
             const pStart = new Date(prog.start_date);
             const pEnd = new Date(prog.end_date);
             return pStart <= todayEnd && pEnd >= todayStart && ['Approved', 'Active', 'Team Ready'].includes(prog.status);
          }
          return false;
        });

        const hasActiveManpowerPlan = p.plan_members?.some(m => {
          const plan = m.plan;
          if (plan && plan.startDate && plan.endDate) {
             const pStart = new Date(plan.startDate);
             const pEnd = new Date(plan.endDate);
             return pStart <= todayEnd && pEnd >= todayStart && plan.status === 'Approved';
          }
          return false;
        });

        const isInProgram = hasActiveWorkProgram || hasActiveManpowerPlan;
        const hasAbsenRecord = absentRecords.some(r => r.man_power_id === p.id);

        if (isInProgram && !hasAbsenRecord) {
          hadir++;
          if (isOrganik) organikHadir++;
          else nonOrganikHadir++;
        }
      });
    } else {
      hadir = totalPersonil - totalAbsen;
      organikHadir = Math.max(0, organikTotal - organikAbsen);
      nonOrganikHadir = Math.max(0, nonOrganikTotal - nonOrganikAbsen);
    }

    // ==========================================
    // AGGREGATE REKOMENDASI M4 & M7 per Bagian
    // ==========================================
    const rekomendasiM4M7 = await prisma.rekomendasi.findMany({
      where: {
        ...rekWhere,
        notification_type: { in: ['M4', 'M7', 'M04', 'M07'] }
      },
      select: { id: true, notification: true, status: true, user_status: true, order: true, work_center: true }
    });

    const orderNumbers = rekomendasiM4M7.map(r => r.order).filter(Boolean);
    const relatedWOs = await prisma.workOrder.findMany({
      where: { nomor_wo: { in: orderNumbers } },
      select: { nomor_wo: true, work_center: true }
    });
    const orderToWorkCenter = {};
    relatedWOs.forEach(wo => { orderToWorkCenter[wo.nomor_wo] = wo.work_center; });

    const mappingWorkCenter = {
      'D0169': 'Inspeksi Bengkel',
      'D0171': 'Inspeksi Metalurgi',
      'D0179': 'Inspeksi Rotating 1',
      'D0180': 'Inspeksi Rotating 2',
      'D0225': 'Inspeksi PPHS & OSBL'
    };

    const rekMetrics = {};
    Object.keys(mappingWorkCenter).forEach(code => {
      rekMetrics[code] = { name: mappingWorkCenter[code], total: 0, userStatusCount: 0, selesai: 0, ip: 0, pending: 0 };
    });
    rekMetrics['UNASSIGNED'] = { name: 'Lainnya / Unassigned', total: 0, userStatusCount: 0, selesai: 0, ip: 0, pending: 0 };

    rekomendasiM4M7.forEach(rek => {
      let wcCode = 'UNASSIGNED';

      // Prioritaskan work_center dari tabel Rekomendasi (jika di-upload dari CSV)
      let fullWc = rek.work_center;

      // Fallback: Jika tidak ada, cari dari Work Order (via Order number)
      if (!fullWc && rek.order && orderToWorkCenter[rek.order]) {
        fullWc = orderToWorkCenter[rek.order];
      }

      if (fullWc) {
        const codeMatch = fullWc.substring(0, 5).toUpperCase();
        if (mappingWorkCenter[codeMatch]) {
          wcCode = codeMatch;
        }
      }

      const sys = (rek.status || '').toUpperCase();       // System Status
      const usr = (rek.user_status || '').toUpperCase(); // User Status

      // === Rumus User ===
      // User Status: COUNTIF(User status, "MGR") + COUNTIF(User status, "NOPR") + COUNTIF(User status, "ORAS")
      // Cocokkan per kata (bukan substring) agar "NOCO" tidak terhitung sebagai "ORAS"
      const usrWords = usr.split(/\s+/);
      const isUserStatus = usrWords.includes('MGR') || usrWords.includes('NOPR') || usrWords.includes('ORAS');

      // Tindak Lanjut Rekomendasi (System Status)
      // Pending: COUNTIF(System Status, "OSNO") + COUNTIF(System Status, "NOPR")
      // → System Status contains "OSNO" OR contains "NOPR" (tapi BUKAN "NOPR ORAS" - I/P lebih spesifik)
      const sysWords = sys.split(/\s+/);
      const isPending = (sysWords.includes('OSNO') || sysWords.includes('NOPR')) && !sys.includes('NOPR ORAS') && !sys.includes('NOCO ORAS');

      // I/P: COUNTIF(System Status, "NOPR ORAS") → exact phrase dalam System Status
      const isIP = sys.includes('NOPR ORAS');

      // Selesai: COUNTIF(System Status, "NOCO ORAS") → exact phrase dalam System Status
      const isSelesai = sys.includes('NOCO ORAS');


      rekMetrics[wcCode].total++;
      if (isUserStatus) { rekMetrics[wcCode].userStatusCount++; }
      if (isPending) { rekMetrics[wcCode].pending++; }
      if (isIP) { rekMetrics[wcCode].ip++; }
      if (isSelesai) { rekMetrics[wcCode].selesai++; }
    });

    const rekomendasiTindakLanjut = Object.values(rekMetrics).filter(item =>
      item.total > 0 || (item.name !== 'Lainnya / Unassigned')
    );


    // Calculate Dynamic Job Load Details matching user's exact formula:
    // Numerator: (status contains 'CNF' OR status contains 'TECO') AND NOT (status contains 'PCNF')
    // Denominator: NOT (status contains 'CRTD')
    const isCnfWO = (w) => {
      const st = (w.status || '').toUpperCase();
      return (st.includes('CNF') || st.includes('TECO')) && !st.includes('PCNF');
    };
    const isValidWO = (w) => {
      const st = (w.status || '').toUpperCase();
      return !st.includes('CRTD');
    };

    const validWOs = woTrendData.filter(isValidWO);
    const cnfWOs = validWOs.filter(isCnfWO);
    const allWOCnfRate = validWOs.length > 0 ? Number(((cnfWOs.length / validWOs.length) * 100).toFixed(2)) : 0;

    const pm04WOs = woTrendData.filter(w => (w.tipe_pm || '').toUpperCase() === 'PM04');
    const pm04Valid = pm04WOs.filter(isValidWO);
    const pm04Cnf = pm04Valid.filter(isCnfWO);
    const pm04CnfRate = pm04Valid.length > 0 ? Number(((pm04Cnf.length / pm04Valid.length) * 100).toFixed(2)) : 0;

    const pm02PlusWOs = woTrendData.filter(w => (w.tipe_pm || '').toUpperCase() !== 'PM04');
    const pm02PlusValid = pm02PlusWOs.filter(isValidWO);
    const pm02PlusCnf = pm02PlusValid.filter(isCnfWO);
    const pm02PlusCnfRate = pm02PlusValid.length > 0 ? Number(((pm02PlusCnf.length / pm02PlusValid.length) * 100).toFixed(2)) : 0;

    const WORK_CENTER_MAP = [
      { code: 'D0179', name: 'Inspeksi Rotating 1' },
      { code: 'D0180', name: 'Inspeksi Rotating 2' },
      { code: 'D0169', name: 'Inspeksi Bengkel' },
      { code: 'D0171', name: 'Inspeksi Metalurgi' },
      { code: 'D0225', name: 'Inspeksi PPHS & OSBL' },
      { code: 'D0170', name: 'Inspeksi QC' },
    ];

    const matchWC = (w, wcItem) => {
      const wcVal = (w.work_center || '').toUpperCase();
      const codeVal = wcItem.code.toUpperCase();
      const nameVal = wcItem.name.toUpperCase().replace('INSPEKSI ', '');
      return wcVal.includes(codeVal) || wcVal.includes(nameVal) || (codeVal === 'D0225' && (wcVal.includes('PPHS') || wcVal.includes('OSBL') || wcVal.includes('P&O')));
    };

    // Filter out Work Centers that have 0 Work Orders in woTrendData (Hide empty Work Centers like QC)
    const activeWorkCenters = WORK_CENTER_MAP.filter(wc => {
      return woTrendData.some(w => matchWC(w, wc));
    });

    const targetWCs = activeWorkCenters.length > 0 ? activeWorkCenters : WORK_CENTER_MAP;

    const pm04Progress = targetWCs.map(wc => {
      const wos = pm04WOs.filter(w => matchWC(w, wc));
      const valid = wos.filter(isValidWO);
      const cnf = valid.filter(isCnfWO);
      const capaianCNF = valid.length > 0 ? Number(((cnf.length / valid.length) * 100).toFixed(2)) : 0;
      return {
        code: wc.code,
        name: wc.name,
        tipe: 'PM04',
        totalWO: wos.length,
        capaianCNF
      };
    }).filter(row => row.totalWO > 0);

    const pm02PlusProgress = targetWCs.map(wc => {
      const wos = pm02PlusWOs.filter(w => matchWC(w, wc));
      const valid = wos.filter(isValidWO);
      const cnf = valid.filter(isCnfWO);
      const capaianCNF = valid.length > 0 ? Number(((cnf.length / valid.length) * 100).toFixed(2)) : 0;
      
      const pabrikBreakdown = {};
      wos.forEach(w => {
        const pName = pabriks.find(p => p.id === w.pabrik_id)?.nama_pabrik || 'Lainnya';
        pabrikBreakdown[pName] = (pabrikBreakdown[pName] || 0) + 1;
      });
      const pabrikInfo = Object.entries(pabrikBreakdown)
        .sort((a,b) => a[0].localeCompare(b[0]))
        .map(([k, v]) => `${k}: ${v} WO`);

      const mappedWos = wos.map(w => ({
        nomor_wo: w.nomor_wo,
        operation_activity: w.operation_activity,
        description: w.description,
        tanggal_dibuat: w.tanggal_dibuat,
        status: w.status,
        equipment: w.equipment
      }));

      return {
        code: wc.code,
        name: wc.name,
        tipe: 'PM02+',
        totalWO: wos.length,
        capaianCNF,
        pabrikInfo,
        list: mappedWos
      };
    }).filter(row => row.totalWO > 0);

    // Distribution by Status per Work Center
    const statusCategories = targetWCs.map(wc => wc.name);
    const statuses = ['CNF TECO', 'CNF REL', 'TECO', 'CRTD', 'REL'];

    const getMappedStatus = (rawStatus) => {
      const st = (rawStatus || '').toUpperCase();
      if (st.includes('CRTD')) return 'CRTD';
      if ((st.includes('CNF') || st.includes('TECO')) && !st.includes('PCNF')) {
        if (st.includes('CNF') && st.includes('REL')) return 'CNF REL';
        if (st.includes('CNF') && st.includes('TECO')) return 'CNF TECO';
        if (st.includes('TECO') && !st.includes('CNF')) return 'TECO';
        return 'CNF TECO'; // fallback for just CNF
      }
      if (st.includes('REL')) return 'REL';
      return 'CRTD';
    };

    const statusDistributionSeries = statuses.map(st => {
      return {
        name: st,
        data: targetWCs.map(wc => {
          return woTrendData.filter(w => matchWC(w, wc) && getMappedStatus(w.status) === st).length;
        })
      };
    });

    // Distribution by PM Type per Work Center
    const targetPmTypes = ['PM04', 'PM02', 'PM03', 'PM09', 'PM01', 'PM05'];
    const pmTypeDistributionSeries = targetPmTypes.map(pt => {
      return {
        name: pt,
        data: targetWCs.map(wc => {
          return woTrendData.filter(w => matchWC(w, wc) && (w.tipe_pm || '').toUpperCase() === pt).length;
        })
      };
    });

    // Calculate Dynamic Available Filter Options
    const yearSet = new Set();
    const monthSet = new Set();
    const wcSet = new Set();

    woTrendData.forEach(w => {
      const d = w.tanggal_dibuat || w.createdAt;
      if (d) {
        const dateObj = new Date(d);
        yearSet.add(dateObj.getUTCFullYear());
        monthSet.add(dateObj.getUTCMonth() + 1);
      }
      if (w.work_center) {
        wcSet.add(w.work_center);
      }
    });

    rekTrendData.forEach(r => {
      const d = r.created_on || r.createdAt;
      if (d) {
        const dateObj = new Date(d);
        yearSet.add(dateObj.getUTCFullYear());
        monthSet.add(dateObj.getUTCMonth() + 1);
      }
    });

    const availableYears = Array.from(yearSet).sort((a, b) => b - a);
    const availableMonths = Array.from(monthSet).sort((a, b) => a - b);
    const availableWorkCenters = Array.from(wcSet).sort();

    return res.status(200).json({
      kpi: {
        totalWO,
        pm04Count,
        pm02PlusCount,
        pm02PlusCountNonCNF,
        totalRek,
        m04Count,
        m07Count,
        pmBreakdown,
        pmBreakdownNonCNF,
        rekomendasiTindakLanjut,
      },
      manPower: {
        total: totalPersonil,
        hadir,
        cuti,
        izin,
        dinas,
        sakit,
        lainnya,
        organikHadir,
        organikTotal,
        nonOrganikHadir,
        nonOrganikTotal,
        detailed: manpowerDetailed,
        organik: {
          total: organikTotal,
          hadir: organikHadir,
          absen: organikAbsen,
        },
        nonOrganik: {
          total: nonOrganikTotal,
          hadir: nonOrganikHadir,
          absen: nonOrganikAbsen,
        },
      },
      sparklines: {
        totalWo: monthlyWoTrend,
        pm04: monthlyPm04Trend,
        pm02Plus: monthlyPm02PlusTrend,
        totalRek: monthlyRekTrend,
        m04: monthlyM04Trend,
        m07: monthlyM07Trend,
      },
      factoryComparison: {
        categories: factoryCategories,
        woData: woPerFactory,
        rekData: rekPerFactory,
      },
      jobLoadTrend: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'],
        woSeries: monthlyWoTrend,
        rekSeries: monthlyRekTrend,
      },
      jobLoadDetails: {
        gauges: {
          allWOCnfRate,
          pm04CnfRate,
          pm02PlusCnfRate,
          cnfCount: cnfWOs.length,
          pm04CnfCount: pm04Cnf.length,
          pm02PlusCnfCount: pm02PlusCnf.length,
        },
        pm04Progress,
        pm02PlusProgress,
        statusDistribution: {
          categories: statusCategories,
          series: statusDistributionSeries,
        },
        pmTypeDistribution: {
          categories: statusCategories,
          series: pmTypeDistributionSeries,
        }
      },
      availableFilters: {
        years: availableYears.length > 0 ? availableYears : [new Date().getFullYear()],
        months: availableMonths.length > 0 ? availableMonths : Array.from({ length: 12 }, (_, i) => i + 1),
        workCenters: availableWorkCenters,
      },
      expiredCertifications: expiredCertifications.map(c => ({
        id: c.id,
        nama_sertifikat: c.nama_sertifikat,
        tanggal_berakhir: c.tanggal_berakhir,
        man_power_name: c.man_power?.name || 'Unknown',
        man_power_npk: c.man_power?.npk || '-'
      })),
    });
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const getManpowerList = async (req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0));
    const todayEnd = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999));

    const todayHoliday = await prisma.hariLibur.findFirst({
      where: {
        tanggal: { gte: todayStart, lte: todayEnd }
      }
    });
    const dayOfWeek = now.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isOffdayDefault = isWeekend || !!todayHoliday;

    const rawList = await prisma.manPower.findMany({
      where: { is_active: true },
      include: {
        divisi: true,
        absensi: {
          where: {
            tanggal_mulai: { lte: todayEnd },
            tanggal_selesai: { gte: todayStart }
          }
        },
        wp_memberships: {
          include: { program: true }
        },
        plan_members: {
          include: { plan: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    const formatted = rawList.map(p => {
      const activeAbsensi = p.absensi && p.absensi.length > 0 ? p.absensi[0] : null;
      
      const hasActiveWorkProgram = p.wp_memberships?.some(m => {
        const prog = m.program;
        if (prog && prog.start_date && prog.end_date) {
           const pStart = new Date(prog.start_date);
           const pEnd = new Date(prog.end_date);
           return pStart <= todayEnd && pEnd >= todayStart && ['Approved', 'Active', 'Team Ready'].includes(prog.status);
        }
        return false;
      });

      const hasActiveManpowerPlan = p.plan_members?.some(m => {
        const plan = m.plan;
        if (plan && plan.startDate && plan.endDate) {
           const pStart = new Date(plan.startDate);
           const pEnd = new Date(plan.endDate);
           return pStart <= todayEnd && pEnd >= todayStart && plan.status === 'Approved';
        }
        return false;
      });

      const isInProgram = hasActiveWorkProgram || hasActiveManpowerPlan;

      let statusToday = 'Hadir';
      if (isOffdayDefault) {
         statusToday = isInProgram ? 'Hadir' : 'Offday';
      }

      let keterangan = '';
      if (activeAbsensi) {
        statusToday = activeAbsensi.jenis || 'Absen';
        keterangan = activeAbsensi.keterangan || '';
      }
      return {
        id: p.id,
        npk: p.npk,
        name: p.name,
        employee_type: p.employee_type,
        position: p.position,
        nama_divisi: p.divisi?.nama_divisi || 'N/A',
        work_center_sap: p.divisi?.work_center_sap || '',
        statusToday,
        keterangan
      };
    });

    return res.status(200).json(formatted);
  } catch (error) {
    console.error('Error fetching manpower list:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const user = req.user; // from authenticateToken middleware
    if (!user || !user.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const notifications = [];
    
    // Get full user with man_power_id
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { man_power: true }
    });

    if (fullUser?.man_power_id) {
      const expiredCerts = await prisma.sertifikasi.findMany({
        where: {
          man_power_id: fullUser.man_power_id,
          tanggal_berakhir: { lt: new Date() }
        }
      });

      expiredCerts.forEach(cert => {
        notifications.push({
          id: `cert-${cert.id}`,
          title: 'Sertifikat Kedaluwarsa',
          desc: `Sertifikat "${cert.nama_sertifikat}" Anda telah kedaluwarsa sejak ${cert.tanggal_berakhir ? new Date(cert.tanggal_berakhir).toLocaleDateString('id-ID') : 'lama'}.`,
          time: 'Baru',
          type: 'warning'
        });
      });
    }

    // Add generic system connection notification
    notifications.push({
      id: 'sys-1',
      title: 'Sistem Terhubung',
      desc: 'Database PostgreSQL aktif dan tersinkronisasi.',
      time: 'Hari ini',
      type: 'success'
    });

    return res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
