const joi = require('joi')
const Post = require('../models/post');

//Input Validation for posts
const postsValidation = (data) => {
    const schemaValidation = joi.object({
        title: joi.string().required().min(1).max(256),
        text: joi.string().required().min(1).max(500),
        expiration: joi.number().required().min(1),
        topic: joi.array()
            .items(joi.string().valid('Politics', 'Health', 'Sport', 'Tech'))
            .required()
            .min(1) // Ensure at least one topic is provided
    });
    return schemaValidation.validate(data);
};


//Input Validation for comments
const commentsValidation = (data) => {
    const schemaValidation = joi.object({
        message: joi.string().required().min(1).max(500)
    });
    return schemaValidation.validate(data);
};


module.exports = { commentsValidation, postsValidation };

