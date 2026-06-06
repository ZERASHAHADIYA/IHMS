const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");

const {
  createUserSchema
} = require("../validators/userValidator");

const generatePassword =
require("../utils/generatePassword");

const createUser = async (req, res) => {

  try {

    const validatedData =
      createUserSchema.parse(req.body);

    const tempPassword =
      generatePassword();

    const hashedPassword =
      await bcrypt.hash(tempPassword, 10);

    const user =
      await prisma.user.create({

        data: {

          ...validatedData,

          password: hashedPassword,

          mustChangePassword: true

        }

      });

      console.log("Creating Audit Log...");
      await prisma.auditLog.create({

  data: {

    action: "CREATE_USER",

    performedBy:
      req.user.userId,

    targetUser:
      user.id

  }

});

    const {
  password,
  ...safeUser
} = user;

res.status(201).json({
  message: "User created successfully",
  temporaryPassword: tempPassword,
  user: safeUser
});

  } catch (error) {

    console.log(error);

    res.status(400).json({

      message:
        error.message

    });

  }

};



module.exports = {
  createUser
};
