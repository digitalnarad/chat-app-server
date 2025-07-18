const { userController } = require("../controller");
const { response200 } = require("../lib/response-messages");
const { isAuthenticated } = require("../middleware/auth");
const { msg } = require("../utils/constant");

const router = require("express").Router();

router.post("/sign-in", userController.userSignIn);
router.post("/sign-up", userController.userSignUp);
router.post("/user-name-verification", userController.userNameVerification);

// authentic user routes
router.post("/get-search-users", isAuthenticated, userController.getSearchUser);
router.get("/token-verification", isAuthenticated, (req, res) => {
  const user = req.user;
  response200(res, msg.fetchSuccessfully, user);
});

module.exports = router;
