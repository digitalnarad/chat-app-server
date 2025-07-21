const { response401 } = require("../lib/response-messages");
const { msg } = require("../utils/constant");
const { verifyToken } = require("../lib/token_manager");
const { user_services } = require("../service");
const catchAsyncFunc = require("./catchAsyncFunc");

// Token is valid or not middleware
exports.isAuthenticated = catchAsyncFunc(async (req, res, next) => {
  const headers = req.headers.authorization;
  if (!headers) return response401(res, msg.headerMissing);

  const token = headers.split(" ")[1];
  if (!token) return response401(res, msg.invalidToken);

  const data = await verifyToken(token);

  const user = await user_services.findUser({ _id: data?.user_id });
  if (!user) return response401(res, msg.tokenExpired);
  if (!user.is_active) return response401(res, msg.accountInActivated);

  req.userId = user._id;
  req.user = user;

  next();
});

exports.isSocketAuthenticated = catchAsyncFunc(async (socket, next) => {
  try {
    const token = socket.handshake?.auth?.token || "";
    if (!token) return next(new Error("No token"));

    const data = await verifyToken(token);

    if (!data?.user_id) throw new Error("Invalid token");

    const user = await user_services.findUser({ _id: data.user_id });
    if (!user) throw new Error("User not found");

    socket.userId = data.user_id;

    next();
  } catch (err) {
    next(new Error("Unauthorized"));
  }
});
