import Joi from "joi";

// Joi Schema for input validation
const schema = Joi.object({
  API_URL: Joi.string().uri().required().messages({
    "string.uri": "❌ Invalid URL format. Please enter a valid URL.",
    "any.required": "❌ URL is required.",
  }),
  TOTAL_USERS: Joi.number().integer().min(1).required().messages({
    "number.base": "❌ Total Users must be a number.",
    "number.min": "❌ Total Users must be at least 1.",
    "any.required": "❌ Total Users is required.",
  }),
  CONCURRENCY_LIMIT: Joi.number().integer().min(1).required().messages({
    "number.base": "❌ Concurrency Limit must be a number.",
    "number.min": "❌ Concurrency Limit must be at least 1.",
    "any.required": "❌ Concurrency Limit is required.",
  }),
  REQUEST_TYPE: Joi.string()
    .valid("GET", "POST", "PUT", "DELETE")
    .required()
    .messages({
      "any.only":
        "❌ Invalid request type. Choose from GET, POST, PUT, DELETE.",
      "any.required": "❌ Request type is required.",
    }),
  BEARER_TOKEN: Joi.string().allow("").messages({
    "string.base": "❌ Bearer Token must be a string.",
  }),
});

export default schema;
