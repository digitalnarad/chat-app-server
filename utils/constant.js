const bcrypt = require("bcrypt");
const crypto = require("crypto");

const msg = {
  notFound: "Data not found",
  invalidCredentials: "Invalid credentials",
  loginSuccess: "Login successfully",
  invalidRole: "Invalid role",
  tokenExpired: "Token is expired or Invalid",
  accountInActivated: "Your account has been deactivated by the administrator.",
  emailIsExists: "Email is already exists",
  phoneExists: "Phone number is already exists",
  fetchSuccessfully: "Fetched successfully",
  fetch_success: "Fetched successfully",
  update_success: "Updated successfully",
  delete_success: "Deleted successfully",
  signupSuccess: "Sign up successfully",
  headerMissing: "Header is missing",
  invalidToken: "Invalid Token",
  tokenExpired: "Token is expired or Invalid",
};

const modelName = {
  USER: "User",
  CHAT: "Chat",
  MESSAGE: "Message",
};

const hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

const PasswordValidation = (inputPassword, storedPassword) => {
  return bcrypt.compareSync(inputPassword, storedPassword);
};

const generateEncryptedToken = (payload) => {
  const cipher = crypto.createCipher("aes-256-cbc", process.env.SECRET_KEY);
  let encrypted = cipher.update(payload, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
};

const decryptToken = (encryptedToken) => {
  try {
    const decipher = crypto.createDecipher(
      "aes-256-cbc",
      process.env.SECRET_KEY
    );
    let decrypted = decipher.update(encryptedToken, "hex", "utf8");
    decrypted += decipher.final("utf8");
    const payload = JSON.parse(decrypted);
    return payload;
  } catch (error) {
    return error;
  }
};

const generateResetPasswordToken = () => {
  const resetToken = crypto.randomBytes(20).toString("hex");
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  const resetPasswordExpires = Date.now() + 15 * 60 * 1000;

  return { resetPasswordToken, resetPasswordExpires };
};

module.exports = {
  msg,
  modelName,
  hashPassword,
  PasswordValidation,
  generateEncryptedToken,
  decryptToken,
  generateResetPasswordToken,
};
