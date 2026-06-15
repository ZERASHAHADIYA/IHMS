const prisma = require("../config/prisma");

const createConversation = async (req, res) => {

  try {

    const {
      name,
      participantIds,
      isGroup
    } = req.body;

    const conversation =
      await prisma.conversation.create({

        data: {

          name,

          isGroup,

          createdById:
            req.user.userId,

          participants: {

            create: [

              {
                userId:
                  req.user.userId,

                isAdmin: true
              },

              ...participantIds.map(
                id => ({
                  userId: id
                })
              )

            ]

          }

        },

        include: {
                
          participants: {
          
            include: {
            
              user: {
              
                select: {
                  id: true,
                  name: true,
                  email: true,
                  profileImage: true
                }
              
              }
            
            }
          
          }
        
        }
        
      });

    res.status(201).json(
      conversation
    );

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server Error"
    });

  }

};

const getConversations = async (req, res) => {

  try {

    const conversations =
      await prisma.conversation.findMany({

        where: {

          participants: {

            some: {
              userId: req.user.userId
            }

          }

        },

        include: {

          participants: {

            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  profileImage: true
                }
              }
            }

          }

        }

      });

    res.json(conversations);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server Error"
    });

  }

};

const addParticipant = async (req, res) => {

  try {

    const { id } = req.params;

    const { userId } = req.body;

    const conversation =
      await prisma.conversation.findUnique({

        where: { id }

      });

    if (!conversation) {

      return res.status(404).json({
        message: "Conversation not found"
      });

    }

    const participant =
      await prisma.conversationParticipant.create({

        data: {

          conversationId: id,

          userId

        }

      });

    res.status(201).json(participant);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server Error"
    });

  }

};

const removeParticipant = async (req, res) => {

  try {

    const { id, userId } = req.params;

    const participant =
      await prisma.conversationParticipant.findFirst({

        where: {

          conversationId: id,

          userId

        }

      });

    if (!participant) {

      return res.status(404).json({
        message: "Participant not found"
      });

    }

    await prisma.conversationParticipant.delete({

      where: {

        id: participant.id

      }

    });

    res.json({

      message:
        "Participant removed successfully"

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server Error"
    });

  }

};

module.exports = {
  createConversation,
  getConversations,
  addParticipant,
  removeParticipant
};