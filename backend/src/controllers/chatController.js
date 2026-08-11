import prisma from '../utils/prisma.js';

// Helper function to delete messages older than 24 hours
const deleteOldMessages = async () => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    await prisma.chatMessage.deleteMany({
      where: {
        createdAt: {
          lt: twentyFourHoursAgo
        }
      }
    });
  } catch (error) {
    console.error('Error auto-deleting old messages:', error);
  }
};

export const sendMessage = async (req, res) => {
  try {
    // Jalankan auto delete setiap ada request masuk
    deleteOldMessages().catch(console.error);

    const { receiverId, content } = req.body;
    const senderId = req.user?.id;

    if (!receiverId || !content) {
      return res.status(400).json({ message: 'receiverId and content are required' });
    }

    const message = await prisma.chatMessage.create({
      data: {
        senderId: parseInt(senderId),
        receiverId: parseInt(receiverId),
        content
      }
    });

    res.json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const currentUserId = req.user?.id;
    if (!currentUserId) return res.status(401).json({ message: 'Unauthorized' });

    const count = await prisma.chatMessage.count({
      where: {
        receiverId: parseInt(currentUserId),
        isRead: false
      }
    });

    const unreadGroup = await prisma.chatMessage.groupBy({
      by: ['senderId'],
      where: {
        receiverId: parseInt(currentUserId),
        isRead: false
      },
      _count: {
        id: true
      }
    });

    const details = {};
    unreadGroup.forEach(g => {
      details[g.senderId] = g._count.id;
    });

    res.json({ count, details });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getConversation = async (req, res) => {
  try {
    // Jalankan auto delete setiap ada request masuk
    deleteOldMessages().catch(console.error);

    const { userId } = req.params; // The other user
    const currentUserId = req.user?.id;

    if (!userId) {
      return res.status(400).json({ message: 'userId parameter is required' });
    }

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const messages = await prisma.chatMessage.findMany({
      where: {
        createdAt: {
          gte: twentyFourHoursAgo
        },
        OR: [
          { senderId: parseInt(currentUserId), receiverId: parseInt(userId) },
          { senderId: parseInt(userId), receiverId: parseInt(currentUserId) }
        ]
      },
      orderBy: {
        createdAt: 'asc' // Oldest to newest for chatting UI
      }
    });

    // Mark messages as read
    await prisma.chatMessage.updateMany({
      where: {
        senderId: parseInt(userId),
        receiverId: parseInt(currentUserId),
        isRead: false
      },
      data: {
        isRead: true
      }
    });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
