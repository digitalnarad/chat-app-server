const router = require("express").Router();

const userRoutes = require("./user.routes");
const chatRoutes = require("./chat.routes");
const { isAuthenticated } = require("../middleware/auth");

router.use("/user", userRoutes);
router.use("/chat", isAuthenticated, chatRoutes);

module.exports = router;
