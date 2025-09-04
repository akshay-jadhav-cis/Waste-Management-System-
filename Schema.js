const Joi = require("joi");

const userValidationSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  city: Joi.string().required(),
  district: Joi.string().required(),
  state: Joi.string().required(),
  country: Joi.string().default("India")
});

module.exports = { userValidationSchema };

const garbageValidationSchema = Joi.object({
  garbageType: Joi.string().valid("dry", "water", "mix").required().messages({
    "any.only": "Garbage type must be dry, water, or mix",
    "string.empty": "Garbage type is required",
  }),
  description: Joi.string().allow("").optional(),
  image: Joi.string().required().messages({
    "string.empty": "Image is required",
  }),
  address: Joi.string().required().messages({
    "string.empty": "Address is required",
  }),
   user: Joi.string().required(),
});

module.exports = {
  userValidationSchema,
  garbageValidationSchema,
};
