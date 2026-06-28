const jwt = require("jsonwebtoken");

    const prisma =
require("../config/prisma");

const socketHandler = (io) => {

  io.use((socket, next) => {
     
         console.log(
    "Socket Auth Attempt"
  );

    try {

      const token =
        socket.handshake.auth.token;

      if (!token) {

        return next(
          new Error("No Token")
        );

      }

      const decoded =
        jwt.verify(

          token,

          process.env.JWT_SECRET

        );

      socket.user = decoded;

      next();

    } catch (error) {

  console.log(
    "Socket Auth Error:",
    error.message
  );

  next(
    new Error("Invalid Token")
  );

}

  });

  io.on("connection", async (socket) => {
    

    console.log(

      "User Connected:",

      socket.user.userId

    );

socket.join(
          `user:${socket.user.userId}`
        );

await prisma.user.update({

  where: {

    id: socket.user.userId

  },

  data: {

    isActive: true,

    lastSeen: new Date()

  }

});

io.emit(
  "userOnline",
  {
    userId: socket.user.userId
  }
);


    socket.on(

      "joinConversation",

      (conversationId) => {

        socket.join(
          conversationId
        );

        console.log(

          `Joined ${conversationId}`

        );
        

      }

    );


    socket.on(

  "typing",

  ({ conversationId }) => {

    socket.to(conversationId).emit(

      "userTyping",

      {

        userId: socket.user.userId

      }

    );

  }

);

socket.on(

  "stopTyping",

  ({ conversationId }) => {

    socket.to(conversationId).emit(

      "userStoppedTyping",

      {

        userId: socket.user.userId

      }

    );

  }

);
socket.on("disconnect", async (reason) => {

  console.log("DISCONNECT EVENT FIRED");
  console.log("Reason:", reason);

  try {

    await prisma.user.update({

      where: {
        id: socket.user.userId
      },

      data: {

        isActive: false,

        lastSeen: new Date()

      }

    });

    io.emit("userOffline", {

      userId: socket.user.userId

    });

    console.log("Updated user offline");

  } catch (error) {

    console.log(error);

  }

});

  });

};



module.exports =
socketHandler;

