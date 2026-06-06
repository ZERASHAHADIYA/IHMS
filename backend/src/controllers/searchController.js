const prisma = require("../config/prisma");

const searchUsers = async (req, res) => {

  try {

    const query = req.query.q || "";

    const users =
      await prisma.user.findMany({

        where: {

          OR: [

            {
              name: {
                contains: query,
                mode: "insensitive"
              }
            },

            {
              email: {
                contains: query,
                mode: "insensitive"
              }
            },

            {
              department: {
                contains: query,
                mode: "insensitive"
              }
            }

          ]

        },

        select: {

          id: true,
          name: true,
          email: true,
          role: true,
          department: true,
          profileImage: true

        }

      });

    res.json(users);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server Error"
    });

  }

};

module.exports = {
  searchUsers
};