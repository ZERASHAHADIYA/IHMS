const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const login = async (req, res) => {

  try {

    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const validPassword = await bcrypt.compare(
      password,
      user.password
    );

    if (!validPassword) {
      return res.status(401).json({
        message: "Invalid password"
      });
    }
    await prisma.user.update({
  where: {
    id: user.id
  },
  data: {
    lastSeen: new Date()
  }
});

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "24h"
      }
    );
    

    res.json({
      token,
      role: user.role,
      name: user.name
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server Error"
    });

  }

};



const profile = async (req, res) => {

  res.json({
    message: "Protected Route Accessed",
    user: req.user
  });

};

const adminPanel = (req, res) => {

  res.json({
    message: "Welcome Admin",
    user: req.user
  });

};
module.exports = {
  login,
  profile,
  adminPanel
};
