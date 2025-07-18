const { response400, response200 } = require("../lib/response-messages");
const catchAsyncFunc = require("../middleware/catchAsyncFunc");
const { user_services, chat_services } = require("../service");
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
  let { email, password, user_name } = req.body;

  const user = await user_services.findUser({
    $or: [{ email }, { user_name }],
    is_deleted: false,
  });
  if (user) return response400(res, msg.emailIsExists);

  req.body.password = hashPassword(password);

  const newUser = await user_services.registerUser(req.body);

  const newChat = await chat_services.registerChat({
    participants: [newUser._id, newUser._id],
  });
  console.log("newChat", newChat);

  return response200(res, msg.signupSuccess, []);
});

const userNameVerification = catchAsyncFunc(async (req, res) => {
  let { user_name } = req.body;
  const user = await user_services.findUser({
    user_name,
    is_deleted: false,
  });
  if (user) return response400(res, msg.userNameExit);

  response200(res, msg.userNameVerified);
});

const getSearchUser = catchAsyncFunc(async (req, res) => {
  let { search_str } = req.body;
  const userId = req.userId;

  if (!search_str) return response200(res, msg.fetchSuccessfully, []);

  const users = await user_services.findUserIdBySearch(userId, search_str);

  response200(res, msg.fetchSuccessfully, users);
});

module.exports = {
  userSignIn,
  userSignUp,
  userNameVerification,
  getSearchUser,
};
