const prisma = require("../config/prisma");


const {
  getIO
} =
require("../socket/socketInstance");

const {
  encrypt,
  decrypt
} = require("../services/encryptionService");


// ======================================
// SEND MESSAGE
// ======================================

const sendMessage = async (req, res) => {

  try {

    const {
      conversationId,
      content
    } = req.body;

    // Check if sender belongs to conversation

    const participant =
      await prisma.conversationParticipant.findFirst({

        where: {

          conversationId,

          userId: req.user.userId

        }

      });

    if (!participant) {

      return res.status(403).json({

        message:
          "Not a member of this conversation"

      });

    }

    const encryptedMessage =
      encrypt(content);

    const message =
      await prisma.message.create({

        data: {

          conversationId,

          senderId:
            req.user.userId,

          encryptedContent:
            encryptedMessage

        },

        include: {

          sender: {

            select: {

              id: true,

              name: true,

              role: true

            }

          }

        }

      });

      // Get all participants in the conversation
const participants =
  await prisma.conversationParticipant.findMany({

    where: {
      conversationId
    }

  });

// Create receipt for every participant
await prisma.messageReceipt.createMany({

  data: participants.map((participant) => ({

    messageId: message.id,

    userId: participant.userId,

    deliveredAt:
      participant.userId === req.user.userId
        ? new Date()
        : null,

    seenAt:
      participant.userId === req.user.userId
        ? new Date()
        : null

  }))

});

    // Update conversation activity

    await prisma.conversation.update({

      where: {
        id: conversationId
      },

      data: {
        lastMessageAt: new Date()
      }

    });

    const io = getIO();

io.to(conversationId).emit(

  "newMessage",

  {

    ...message,

    encryptedContent:
      content

  }

);

    res.status(201).json({

      ...message,

      encryptedContent: content

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      message:
        "Server Error"

    });

  }

};


// ======================================
// GET MESSAGES
// ======================================

const getMessages = async (req, res) => {

  try {

    const {
      conversationId
    } = req.params;

    // Verify membership

    const participant =
      await prisma.conversationParticipant.findFirst({

        where: {

          conversationId,

          userId:
            req.user.userId

        }

      });

    if (!participant) {

      return res.status(403).json({

        message:
          "Not a member of this conversation"

      });

    }

    const messages =
      await prisma.message.findMany({

        where: {

          conversationId

        },

        include: {

  sender: {

    select: {

      id: true,

      name: true,

      role: true

    }

  },

  receipts: {

    include: {

      user: {

        select: {

          id: true,

          name: true

        }

      }

    }

  }

},

        orderBy: {

          createdAt: "asc"

        }

      });

    const decryptedMessages =
      messages.map((msg) => ({

        ...msg,

        encryptedContent:

          msg.isDeleted

            ? "This message was deleted"

            : decrypt(
                msg.encryptedContent
              )

      }));

    res.json(
      decryptedMessages
    );

  } catch (error) {

    console.log(error);

    res.status(500).json({

      message:
        "Server Error"

    });

  }

};


// ======================================
// EDIT MESSAGE
// ======================================

const editMessage = async (req, res) => {

  try {

    const {
      id
    } = req.params;

    const {
      content
    } = req.body;

    const message =
      await prisma.message.findUnique({

        where: {
          id
        }

      });

    if (!message) {

      return res.status(404).json({

        message:
          "Message not found"

      });

    }

    if (
      message.senderId !==
      req.user.userId
    ) {

      return res.status(403).json({

        message:
          "Not allowed"

      });

    }

    const sentTime =
      new Date(
        message.createdAt
      );

    const now =
      new Date();

    const diffMinutes =
      (now - sentTime) /
      (1000 * 60);

    if (
      diffMinutes > 15
    ) {

      return res.status(400).json({

        message:
          "Edit window expired"

      });

    }

    const updatedMessage =
      await prisma.message.update({

        where: {
          id
        },

        data: {

          encryptedContent:
            encrypt(content),

          isEdited: true

        }

      });

    res.json({

      ...updatedMessage,

      encryptedContent:
        content

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      message:
        "Server Error"

    });

  }

};


// ======================================
// DELETE MESSAGE
// ======================================

const deleteMessage = async (req, res) => {

  try {

    const {
      id
    } = req.params;

    const message =
      await prisma.message.findUnique({

        where: {
          id
        }

      });

    if (!message) {

      return res.status(404).json({

        message:
          "Message not found"

      });

    }

    if (
      message.senderId !==
      req.user.userId
    ) {

      return res.status(403).json({

        message:
          "Not allowed"

      });

    }

    const deletedMessage =
      await prisma.message.update({

        where: {
          id
        },

        data: {

          isDeleted: true,

          encryptedContent:
            encrypt(
              "This message was deleted"
            )

        }

      });

    res.json({

      ...deletedMessage,

      encryptedContent:
        "This message was deleted"

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      message:
        "Server Error"

    });

  }

};
const markDelivered = async (req, res) => {

  try {

    const { conversationId } = req.params;

    await prisma.messageReceipt.updateMany({

      where: {

        userId: req.user.userId,

        deliveredAt: null,

        message: {

          conversationId

        }

      },

      data: {

        deliveredAt: new Date()

      }

    });

    const io = getIO();

io.to(conversationId).emit(
  "messagesDelivered",
  {
    conversationId,
    userId: req.user.userId
  }
);

    res.json({

      message: "Messages marked as delivered"

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      message: "Server Error"

    });

  }

};


const markSeen = async (req, res) => {

  try {

    const { conversationId } = req.params;

    await prisma.messageReceipt.updateMany({

      where: {

        userId: req.user.userId,

        seenAt: null,

        message: {

          conversationId

        }

      },

      data: {

        seenAt: new Date()

      }

    });
  
    const io = getIO();

io.to(conversationId).emit(
  "messagesSeen",
  {
    conversationId,
    userId: req.user.userId
  }
);

    res.json({

      message: "Messages marked as seen"

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      message: "Server Error"

    });

  }

};

module.exports = {

  sendMessage,
  getMessages,
  editMessage,
  deleteMessage,
  markDelivered,
  markSeen
};


  