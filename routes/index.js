const router = require("express").Router();

const userRoutes = require("./user.routes");
const chatRoutes = require("./chat.routes");
const messageRoutes = require("./message.routes");
const requestRoutes = require("./request.routes");

const { isAuthenticated } = require("../middleware/auth");

router.use("/user", userRoutes);
router.use("/chat", isAuthenticated, chatRoutes);
router.use("/message", isAuthenticated, messageRoutes);
router.use("/request", isAuthenticated, requestRoutes);

module.exports = router;
