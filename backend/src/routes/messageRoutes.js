const express =
require("express");

const router =
express.Router();

const authMiddleware =
require("../middleware/authMiddleware");

const {
  sendMessage,
  getMessages,
  editMessage,
  deleteMessage,
  markDelivered,
  markSeen
} =
require("../controllers/messageController");

router.post(
  "/",
  authMiddleware,
  sendMessage
);

router.get(
  "/:conversationId",
  authMiddleware,
  getMessages   
);

router.patch(
  "/:id",
  authMiddleware,
  editMessage
);

router.delete(
  "/:id",
  authMiddleware,
  deleteMessage
);

router.patch(
  "/:conversationId/delivered",
  authMiddleware,
  markDelivered
);

router.patch(
  "/:conversationId/seen",
  authMiddleware,
  markSeen
);

module.exports = router;