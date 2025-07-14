const { userController } = require("../controller");

const router = require("express").Router();

router.post("/sign-in", userController.userSignIn);
router.post("/sign-up", userController.userSignUp);
// router.post("/sign-up", userController.userSignUp);

module.exports = router;
