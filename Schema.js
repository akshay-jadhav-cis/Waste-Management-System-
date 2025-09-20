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
const garbageValidationSchema = Joi.object({
  garbageType: Joi.string()
    .valid("dry", "water", "mix")
    .required()
    .messages({
      "any.only": "Garbage type must be dry, water, or mix",
      "string.empty": "Garbage type is required",
    }),

  description: Joi.string()
    .required()
    .messages({ "string.empty": "Description is required" }),

  image: Joi.array()
    .items(Joi.string().uri())
    .min(1)
    .required()
    .messages({
      "array.base": "Images must be an array",
      "array.min": "At least one image is required",
      "any.required": "Images are required",
    }),

  address: Joi.string()
    .required()
    .messages({ "string.empty": "Address is required" }),

  user: Joi.string().allow(null),
  admin: Joi.string().allow(null),
  assignedTo: Joi.string().optional(),
})
  .xor("user", "admin")
  .messages({ "object.missing": "A user or admin must submit the complaint" });


const adminValidationSchema = Joi.object({
    name: Joi.string().trim().required().messages({
        "string.empty": "Name is required"
    }),
    email: Joi.string().email().required().messages({
        "string.email": "Please enter a valid email",
        "string.empty": "Email is required"
    }),
    password: Joi.string().min(6).required().messages({
        "string.min": "Password must be at least 6 characters long",
        "string.empty": "Password is required"
    }),
    position: Joi.string().valid("head", "manager", "other").default("other"),
    address: Joi.string().trim().required().messages({
        "string.empty": "Address is required"
    })
});

const employeeValidationSchema = Joi.object({
  Employee: Joi.object({
    name: Joi.string().trim().required().messages({
      "string.empty": "Name is required"
    }),
    email: Joi.string().email().required().messages({
      "string.email": "Please enter a valid email",
      "string.empty": "Email is required"
    }),
    age: Joi.number().min(18).required().messages({
      "number.base": "Age must be a number",
      "number.min": "Employee must be at least 18 years old"
    }),
    address: Joi.string().trim().required().messages({
      "string.empty": "Address is required"
    }),
    dob: Joi.date().required().messages({
      "date.base": "Please provide a valid Date of Birth"
    }),
    joiningDate: Joi.date().default(Date.now),
    password: Joi.string().min(6).required().messages({
      "string.min": "Password must be at least 6 characters long",
      "string.empty": "Password is required"
    })
  }).required()
});

const employeeLoginValidationSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});
module.exports = {
  userValidationSchema,
  garbageValidationSchema,
  adminValidationSchema,
  employeeValidationSchema,
  employeeLoginValidationSchema
};
