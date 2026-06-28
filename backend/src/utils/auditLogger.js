const prisma = require("../config/prisma");

const logAudit = async ({
  action,
  performedBy,
  targetUser = null,
  metadata = null
}) => {

  try {

    await prisma.auditLog.create({

      data: {

        action,

        performedBy,

        targetUser,

        metadata

      }

    });

  } catch (error) {

    console.log("Audit Log Error:", error.message);

  }

};

module.exports = logAudit;