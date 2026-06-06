const { io } = require("socket.io-client");

console.log("Starting...");

const socket = io("http://localhost:5000", {

  transports: ["websocket"],

  auth: {

    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxZDU2NTEwNy1lNDY1LTQ0YjktODVmOC1hODk0MjM4M2U1NDkiLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3ODA3MzU3MjksImV4cCI6MTc4MDgyMjEyOX0.BaKWuQ2QWMsQiF_VPIBZmPUlgNYKvNuVVhYBacaT5Ck"

  }

});

socket.on("connect", () => {

  console.log(
    "Connected:",
    socket.id
  );

});

socket.on("connect_error", (err) => {

  console.log(
    "Connection Error:",
    err.message
  );

});

socket.on("disconnect", () => {

  console.log(
    "Disconnected"
  );

});