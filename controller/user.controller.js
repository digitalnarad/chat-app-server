const { response400, response200 } = require("../lib/response-messages");
const catchAsyncFunc = require("../middleware/catchAsyncFunc");
const { user_services } = require("../service");
const { PasswordValidation, hashPassword, msg } = require("../utils/constant");

const userSignIn = catchAsyncFunc(async (req, res) => {
  const { email, password } = req.body;

  const user = await user_services.findUser({ email, is_deleted: false });
  if (!user) return response400(res, msg.invalidCredentials);

  const validPassword = PasswordValidation(password, user.password);
  if (!validPassword) return response400(res, msg.invalidCredentials);

  const token = await user_services.create_jwt_token(user);
  return response200(res, msg.loginSuccess, { role: user.user_type, token });
});

const userSignUp = catchAsyncFunc(async (req, res) => {
  let { email, password } = req.body;

  const user = await user_services.findUser({ email, is_deleted: false });
  if (user) return response400(res, msg.emailIsExists);

  req.body.password = hashPassword(password);

  await user_services.registerUser(req.body);

  return response200(res, msg.signupSuccess, []);
});

module.exports = {
  userSignIn,
  userSignUp,
};
