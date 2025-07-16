const { chatController, messageController } = require("../controller");

const router = require("express").Router();

router.get("/fetch-chats-messages/:id", messageController.fetchAllMessages);

module.exports = router;
