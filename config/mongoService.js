const mongoose = require("mongoose");

// find one
const findOne = async (
  model,
  where,
  projection = {},
  options = { lean: true }
) => {
  return await mongoose.model(model).findOne(where, projection, options);
};

// find One with populate
const findOnePopulate = async (
  model,
  where,
  projection = {},
  options = { lean: true },
  populate = null
) => {
  try {
    let query = mongoose.model(model).findOne(where, projection, options);

    if (populate) {
      query = query.populate(populate);
    }

    return await query.exec();
  } catch (error) {
    throw new Error(`Error in findOne: ${error.message}`);
  }
};

// create one
const createOne = async (model, payload) => {
  return await mongoose.model(model).create(payload);
};

// create many
const createMany = async (model, payload) => {
  return await mongoose.model(model).create(payload);
};

// find all
const findAll = async (
  model,
  criteria,
  projection = {},
  options = { lean: true, populate: "" }
) => {
  options.lean = true;
  let query = mongoose.model(model).find(criteria, projection, options);

  if (options.populate) query = query.populate(options.populate);
  return await query.exec();
};

//update one
const updateOne = async (model, criteria, dataToSet, options = {}) => {
  options = { lean: true, new: true };

  return await mongoose
    .model(model)
    .findOneAndUpdate(criteria, dataToSet, options);
};

//update many
const updateMany = async (
  model,
  criteria,
  dataToSet,
  options = { new: false }
) => {
  return await mongoose.model(model).updateMany(criteria, dataToSet, options);
};

//aggregate data
const aggregation = async (model, data) => {
  return await mongoose.model(model).aggregate(data);
};

//populate
const populate = async (
  modelName,
  criteria,
  projection = {},
  options = { lean: true },
  populate = [],
  limit,
  skip,
  sort
) => {
  options.lean = true;
  return await mongoose
    .model(modelName)
    .find(criteria, projection, options)
    .skip(skip)
    .limit(limit)
    .populate(populate)
    .sort(sort);
};

const findPaginateQuery = async (modelName, criteria, sort, limit, skip) => {
  return await mongoose
    .model(modelName)
    .find(criteria, {}, { lean: true })
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

// count documents
const countDocument = async (modelName, criteria) => {
  return await mongoose.model(modelName).countDocuments(criteria);
};

const deleteDocument = async (model, criteria) => {
  return await mongoose.model(model).findOneAndDelete(criteria);
};

const deleteManyDocument = async (model, criteria) => {
  return await mongoose.model(model).deleteMany(criteria);
};

module.exports = {
  findOne,
  findOnePopulate,
  createOne,
  createMany,
  findAll,
  updateOne,
  updateMany,
  aggregation,
  populate,
  countDocument,
  deleteDocument,
  deleteManyDocument,
  findPaginateQuery,
};
