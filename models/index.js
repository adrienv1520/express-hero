/**
 * Mongoose models manager with logic separation.
 * Manage and export all models and util functions
 */

// db model
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var db = require('./db');

// api models linked to a db
var models = {
  User: require('./users'),
  Drawing: require('./drawings')
};

// models security when output to view
var xssFilters = require('xss-filters');


// exports
module.exports.db = db;
module.exports.User = models.User;
module.exports.Drawing = models.Drawing;


// util functions and exports

/**
 * FUNCTION ISVALIDID
 * Uses mongoose.Types.ObjectId.isValid method to be sure if a string or ObjectId is a regular ObjectId
 * It is the same as regex : /^[a-fA-F0-9]{24}$/
 * TO USE BEFORE FINDING BY ID IN DB
 */
module.exports.isValidId = function(id) {
  return ObjectId.isValid(id);
};


/**
 * FUNCTION BODYHYDRATE
 * Hydrate a new object instance from a needed Mongoose Model with the req.body object (form fields) only if they are in Model schema.
 * Decodes URI component from Ajax request.
 * @param  {Object} modelName     the Mongoose model name (eg. User)
 * @param  {Object} modelObject   the model object (used to update) or null
 * @param  {Object} reqBody       the req.body object that contains form fields
 * @return {Object} model         returns a mongoose Model object
 */
module.exports.bodyHydrate = function (modelName, modelObject, reqBody) {
  var Model = models[modelName];
  var model = modelObject || new Model();
  Model.schema.eachPath(function(path){
    var propValue = reqBody[path] ? decodeURIComponent(reqBody[path]) : false;
    if (propValue) model[path] = propValue;
  });
  return model;
};

/**
 * FUNCTION XSSFILTERMODEL
 * Uses Yahoo xss filter for data to be output in HTML. Each property of Mongoose Model will be sanitize but _id and __v.
 *
 * @param  {Object} model         a Mongoose Model object, needs to be stringify and parse to get only model properties as defined in models/users.js
 * @return {Object} model         returns a xss-filtered model ready to be output/use
 *
 * NOTE : if object is null, no error will be thrown.
 */
var xssFilterModel = function(model, filterMethod) {
  model = JSON.parse(JSON.stringify(model));

  var filter = 'inHTMLData';
  if (filterMethod && xssFilters.hasOwnProperty(filterMethod)) {
    filter = filterMethod;
  }

  for (var prop in model) {
    if (model.hasOwnProperty(prop) /*&& prop !== '_id' && prop !== '__v'*/) {
      model[prop] = xssFilters[filter](model[prop]);
    }
  }
  return model;
};
module.exports.xssFilterModel = xssFilterModel;

/**
 * FUNCTION XSSFILTERMODELS
 * Uses xssFilterModel function to filter an array of Mongoose Model.
 *
 * @param  {Array} arrayModels Array of Model
 * @return {Array}             Returns an xss-filtered array of Model
 */
module.exports.xssFilterModels = function(arrayModels, filterMethod) {
  return arrayModels.map(function(model) {
    return xssFilterModel(model, filterMethod);
  });
};
