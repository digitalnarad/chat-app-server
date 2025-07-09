const mongoService = require("../config/mongoService");
const { create_token } = require("../lib/token_manager");
const { modelName } = require("../utils/constant");

const findUser = async (payload) => {
  try {
    return await mongoService.findOne(modelName.USER, payload);
  } catch (error) {
    throw error;
  }
};

const registerUser = async (payload) => {
  try {
    return await mongoService.createOne(modelName.USER, payload);
  } catch (error) {
    throw error;
  }
};

const create_jwt_token = async (payload) => {
  try {
    return await create_token(payload);
  } catch (error) {
    throw error;
  }
};

const updateUser = async (query, payload) => {
  try {
    return await mongoService.updateOne(modelName.USER, query, payload, {});
  } catch (error) {
    throw error;
  }
};

module.exports = {
  findUser,
  registerUser,
  create_jwt_token,
  updateUser,
};
