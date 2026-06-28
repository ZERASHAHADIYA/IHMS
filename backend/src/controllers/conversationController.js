const prisma = require("../config/prisma");
const logAudit = require("../utils/auditLogger");
const createConversation = async (req, res) => {

  try {

    const {
      name,
      participantIds,
      isGroup
    } = req.body;

    let uniqueKey = null;

if (!isGroup) {

  const otherUserId = participantIds[0];

  uniqueKey = [
    req.user.userId,
    otherUserId
  ].sort().join("_");

}

    // const conversation =
    //   await prisma.conversation.create({

    let conversation;

    try {
    
      conversation =
        await prisma.conversation.create({

        data: {

          name,

          isGroup,

          uniqueKey,

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

    } catch (error) {

  if (
    error.code === "P2002" &&
    uniqueKey
  ) {

    conversation =
      await prisma.conversation.findUnique({

        where: {
          uniqueKey
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

  } else {
    throw error;
  }

}

      const { getIO } =
      require("../socket/socketInstance");

      const io = getIO();
          
      conversation.participants.forEach(
        (p) => {
        
          io.to(
            `user:${p.user.id}`
          ).emit(
            "newConversation",
            conversation
          );
        
        }
      );

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
    if (!conversation.isGroup) {

  return res.status(400).json({

    message: "Cannot add participants to a personal conversation"

  });

}
   const admin =
  await prisma.conversationParticipant.findFirst({

    where: {

      conversationId: id,

      userId: req.user.userId,

      isAdmin: true

    }

  });

if (!admin) {

  return res.status(403).json({

    message: "Only group admins can add participants"

  });

}
    const existingParticipant =
  await prisma.conversationParticipant.findFirst({

    where: {

      conversationId: id,

      userId

    }

  });

if (existingParticipant) {

  return res.status(400).json({

    message: "User is already a participant"

  });

}

    const participant =
await prisma.conversationParticipant.create({

    data:{

        conversationId:id,

        userId

    }

});

await logAudit({

    action:"ADD_MEMBER",

    performedBy:req.user.userId,

    targetUser:userId,

    metadata:{

        conversationId:id

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
   
    const conversation =
  await prisma.conversation.findUnique({

    where: { id }

  });

if (!conversation) {

  return res.status(404).json({

    message: "Conversation not found"

  });

}

if (!conversation.isGroup) {

  return res.status(400).json({

    message: "Cannot remove participants from a personal conversation"

  });

}

    const participant =
      await prisma.conversationParticipant.findFirst({

        where: {

          conversationId: id,

          userId

        }

      });
  
  if (conversation.createdById === userId) {

  return res.status(400).json({

    message: "Group creator cannot be removed"

  });

}


    const admin =
  await prisma.conversationParticipant.findFirst({

    where: {

      conversationId: id,

      userId: req.user.userId,

      isAdmin: true

    }

  });

if (!admin) {

  return res.status(403).json({

    message: "Only group admins can remove participants"

  });

}


    if (!participant) {

      return res.status(404).json({
        message: "Participant not found"
      });

    }
    
    if (userId === req.user.userId) {

  return res.status(400).json({

    message: "Use Leave Group instead of removing yourself"

  });

}
await prisma.conversationParticipant.delete({

  where: {

    id: participant.id

  }

});

await logAudit({

  action: "REMOVE_MEMBER",

  performedBy: req.user.userId,

  targetUser: userId,

  metadata: {

    conversationId: id

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

const promoteToAdmin = async (req, res) => {

  try {

    const { id, userId } = req.params;

    const conversation =
      await prisma.conversation.findUnique({

        where: { id }

      });

    if (!conversation) {

      return res.status(404).json({

        message: "Conversation not found"

      });

    }

    if (!conversation.isGroup) {

      return res.status(400).json({

        message: "Only groups have admins"

      });

    }

    const requester =
      await prisma.conversationParticipant.findFirst({

        where: {

          conversationId: id,

          userId: req.user.userId,

          isAdmin: true

        }

      });

    if (!requester) {

      return res.status(403).json({

        message: "Only admins can promote members"

      });

    }

    const member =
      await prisma.conversationParticipant.findFirst({

        where: {

          conversationId: id,

          userId

        }

      });

    if (!member) {

      return res.status(404).json({

        message: "Member not found"

      });

    }

    if (member.isAdmin) {

      return res.status(400).json({

        message: "User is already an admin"

      });

    }

    const updated =
      await prisma.conversationParticipant.update({

        where: {

          id: member.id

        },

        data: {

          isAdmin: true

        }

      });
      await logAudit({

  action: "PROMOTE_ADMIN",

  performedBy: req.user.userId,

  targetUser: userId,

  metadata: {

    conversationId: id

  }

});

    res.json({

      message: "Member promoted to admin",

      participant: updated

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      message: "Server Error"

    });

  }

};

const demoteAdmin = async (req, res) => {

  try {

    const { id, userId } = req.params;

    const conversation =
      await prisma.conversation.findUnique({

        where: { id }

      });

    if (!conversation) {

      return res.status(404).json({

        message: "Conversation not found"

      });

    }

    if (!conversation.isGroup) {

      return res.status(400).json({

        message: "Only groups have admins"

      });

    }

    const requester =
      await prisma.conversationParticipant.findFirst({

        where: {

          conversationId: id,

          userId: req.user.userId,

          isAdmin: true

        }

      });

    if (!requester) {

      return res.status(403).json({

        message: "Only admins can demote admins"

      });

    }

    const target =
      await prisma.conversationParticipant.findFirst({

        where: {

          conversationId: id,

          userId

        }

      });

    if (!target) {

      return res.status(404).json({

        message: "Member not found"

      });

    }

    if (!target.isAdmin) {

      return res.status(400).json({

        message: "User is not an admin"

      });

    }

    // 👑 Owner cannot be demoted
    if (conversation.createdById === userId) {

      return res.status(400).json({

        message: "Group owner cannot be demoted"

      });

    }

    // ⭐ Keep at least one admin
    const adminCount =
      await prisma.conversationParticipant.count({

        where: {

          conversationId: id,

          isAdmin: true

        }

      });

    if (adminCount === 1) {

      return res.status(400).json({

        message: "At least one admin must remain"

      });

    }

    const updated =
      await prisma.conversationParticipant.update({

        where: {

          id: target.id

        },

        data: {

          isAdmin: false

        }

      });
      await logAudit({

  action: "DEMOTE_ADMIN",

  performedBy: req.user.userId,

  targetUser: userId,

  metadata: {

    conversationId: id

  }

});

    res.json({

      message: "Admin demoted successfully",

      participant: updated

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      message: "Server Error"

    });

  }

};

const transferOwnership = async (req, res) => {

  try {

    const { id, userId } = req.params;

    const conversation =
      await prisma.conversation.findUnique({

        where: { id }

      });

    if (!conversation) {

      return res.status(404).json({

        message: "Conversation not found"

      });

    }

    if (!conversation.isGroup) {

      return res.status(400).json({

        message: "Only groups have an owner"

      });

    }

    // Only owner can transfer ownership

    if (conversation.createdById !== req.user.userId) {

      return res.status(403).json({

        message: "Only the owner can transfer ownership"

      });

    }

    const newOwner =
      await prisma.conversationParticipant.findFirst({

        where: {

          conversationId: id,

          userId

        }

      });

    if (!newOwner) {

      return res.status(404).json({

        message: "User is not a member"

      });

    }

    // New owner must be admin

    if (!newOwner.isAdmin) {

      return res.status(400).json({

        message: "Promote the member to admin before transferring ownership"

      });

    }

    const updatedConversation =
      await prisma.conversation.update({

        where: {

          id

        },

        data: {

          createdById: userId

        }

      });
      await logAudit({

  action: "TRANSFER_OWNERSHIP",

  performedBy: req.user.userId,

  targetUser: userId,

  metadata: {

    conversationId: id

  }

});

    res.json({

      message: "Ownership transferred successfully",

      conversation: updatedConversation

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      message: "Server Error"

    });

  }

};

const updateGroup = async (req, res) => {

  try {

    const { id } = req.params;

    const { name, description } = req.body;

    const conversation =
      await prisma.conversation.findUnique({

        where: { id }

      });

    if (!conversation) {

      return res.status(404).json({

        message: "Conversation not found"

      });

    }

    if (!conversation.isGroup) {

      return res.status(400).json({

        message: "Only groups can be updated"

      });

    }

    const admin =
      await prisma.conversationParticipant.findFirst({

        where: {

          conversationId: id,

          userId: req.user.userId,

          isAdmin: true

        }

      });

    if (!admin) {

      return res.status(403).json({

        message: "Only admins can update group details"

      });

    }

    const updatedConversation =
      await prisma.conversation.update({

        where: {

          id

        },

        data: {

          ...(name !== undefined && { name }),

          ...(description !== undefined && { description })

        }

      });

      await logAudit({

  action: "UPDATE_GROUP",

  performedBy: req.user.userId,

  metadata: {

    conversationId: id

  }

});
    res.json({

      message: "Group updated successfully",

      conversation: updatedConversation

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      message: "Server Error"

    });

  }

};

const leaveGroup = async (req, res) => {

  try {

    const { id } = req.params;

    const conversation =
      await prisma.conversation.findUnique({

        where: { id }

      });

    if (!conversation) {

      return res.status(404).json({

        message: "Conversation not found"

      });

    }

    if (!conversation.isGroup) {

      return res.status(400).json({

        message: "Cannot leave a personal conversation"

      });

    }

    if (conversation.createdById === req.user.userId) {

      return res.status(400).json({

        message: "Transfer ownership before leaving"

      });

    }

    const participant =
      await prisma.conversationParticipant.findFirst({

        where: {

          conversationId: id,

          userId: req.user.userId

        }

      });

    if (!participant) {

      return res.status(404).json({

        message: "You are not a member"

      });

    }

    if (participant.isAdmin) {

      const adminCount =
        await prisma.conversationParticipant.count({

          where: {

            conversationId: id,

            isAdmin: true

          }

        });

      if (adminCount === 1) {

        return res.status(400).json({

          message: "At least one admin must remain"

        });

      }

    }

    await prisma.conversationParticipant.delete({

      where: {

        id: participant.id

      }

    });

    await logAudit({

  action: "LEAVE_GROUP",

  performedBy: req.user.userId,

  metadata: {

    conversationId: id

  }

});
    res.json({

      message: "You left the group successfully"

    });

  } catch (error) {

    console.log(error);



    res.status(500).json({

      message: "Server Error"

    });

  }

};

const deleteGroup = async (req, res) => {

  try {

    const { id } = req.params;

    const conversation = await prisma.conversation.findUnique({
      where: { id }
    });

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found"
      });
    }

    if (!conversation.isGroup) {
      return res.status(400).json({
        message: "Only groups can be deleted"
      });
    }

    if (conversation.createdById !== req.user.userId) {
      return res.status(403).json({
        message: "Only the owner can delete the group"
      });
    }

   await logAudit({

  action: "DELETE_GROUP",

  performedBy: req.user.userId,

  metadata: {

    conversationId: id,

    groupName: conversation.name

  }

});

await prisma.conversation.delete({

  where: {

    id

  }

});

res.json({

  message: "Group deleted successfully"

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
  removeParticipant,
  promoteToAdmin,
  demoteAdmin,
  transferOwnership,
  updateGroup,
  leaveGroup,
  deleteGroup
};

  