const { chatController } = require("../controller");

const router = require("express").Router();

router.get("/fetch-all-chats", chatController.fetchAllChats);
router.post("/create-chat", chatController.createChat);

module.exports = router;
