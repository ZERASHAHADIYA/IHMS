const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");

const {
  createUserSchema
} = require("../validators/userValidator");

const generatePassword =
require("../utils/generatePassword");

const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.userId
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        rollNo: true,
        employeeId: true,
        bio: true,
        phoneNumber: true,
        profileImage: true,
        isActive: true,
        createdAt: true
      }
    });

    res.json(user);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server Error"
    });

  }
};

const updateProfile = async (req, res) => {

  try {

    const {
      name,
      bio,
      phoneNumber,
      profileImage
    } = req.body;

    const updatedUser =
      await prisma.user.update({

        where: {
          id: req.user.userId
        },

        data: {
          name,
          bio,
          phoneNumber,
          profileImage
        }

      });

    const {
      password,
      ...safeUser
    } = updatedUser;

    res.json({
      message: "Profile updated successfully",
      user: safeUser
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server Error"
    });

  }

};

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
  createUser,
  getProfile,
  updateProfile
};

  