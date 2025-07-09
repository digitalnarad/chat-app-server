const Jwt = require("jsonwebtoken");

const create_token = (userData) => {
  const data = {
    user_id: userData._id,
  };
  const token = Jwt.sign(data, process.env.JWT_SEC);
  return token;
};

const verifyToken = async (token) => {
  return new Promise((resolve, reject) => {
    Jwt.verify(token, process.env.JWT_SEC, (err, result) => {
      if (err) return resolve(null);
      resolve(result);
    });
  });
};

module.exports = { create_token, verifyToken };
