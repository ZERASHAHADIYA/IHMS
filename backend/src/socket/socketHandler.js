const jwt = require("jsonwebtoken");

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

  io.on("connection", (socket) => {

    console.log(

      "User Connected:",

      socket.user.userId

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
        socket.join(
          `user:${socket.user.userId}`
        );

      }

    );

    socket.on(

      "disconnect",

      () => {

        console.log(

          "User Disconnected:",

          socket.user.userId

        );

      }

    );

  });

};

module.exports =
socketHandler;