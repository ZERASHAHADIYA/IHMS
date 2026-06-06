const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");

const changePassword = async (req, res) => {

  try {

    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {

      return res.status(400).json({
        message:
        "Password must be at least 8 characters"
      });

    }

    const hashedPassword =
      await bcrypt.hash(newPassword, 10);

    await prisma.user.update({

      where: {
        id: req.user.userId
      },

      data: {

        password: hashedPassword,

        mustChangePassword: false

      }

    });

    res.json({
      message:
      "Password changed successfully"
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server Error"
    });

  }

};

module.exports = {
  changePassword
};