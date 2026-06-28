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
  removeParticipant,
  promoteToAdmin,
  demoteAdmin,
  transferOwnership,
  updateGroup,
  leaveGroup,
  deleteGroup
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

router.put(
  "/:id/promote/:userId",
  authMiddleware,
  promoteToAdmin
);

router.put(
  "/:id/demote/:userId",
  authMiddleware,
  demoteAdmin
);

router.put(
  "/:id/transfer/:userId",
  authMiddleware,
  transferOwnership
);

router.put(
  "/:id",
  authMiddleware,
  updateGroup
);

router.delete(
  "/:id/leave",
  authMiddleware,
  leaveGroup
);

router.delete(
  "/:id",
  authMiddleware,
  deleteGroup
);
module.exports = router;