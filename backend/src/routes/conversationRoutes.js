const express =
require("express");

const router =
express.Router();

const authMiddleware =
require("../middleware/authMiddleware");

const {
  createConversation,
  getConversations,
  addParticipant,
  removeParticipant
} =
require("../controllers/conversationController");

router.post(
  "/",
  authMiddleware,
  createConversation
);

router.get(
  "/",
  authMiddleware,
  getConversations
);

router.post(
  "/:id/participants",
  authMiddleware,
  addParticipant
);

router.delete(
  "/:id/participants/:userId",
  authMiddleware,
  removeParticipant
);

module.exports = router;