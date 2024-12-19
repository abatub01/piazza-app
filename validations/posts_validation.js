const Post = require('../models/post');

//const expirationValidation


// Validation to check if a post exists
const PostExists = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }
        req.post = post; // Attach the post to the request
        next();
    } catch (error) {
        res.status(500).json({ message: 'Error finding post.', error: error.message });
    }
};

// Validation to check interaction rules
const interactionValidation = async (req, res, next) => {
    const { userId, interactionType } = req.body;

    // Check if the user is the owner of the post
    if (req.post.owner.userId.toString() === userId && interactionType === 'like') {
        return res.status(403).json({ message: 'Post owners cannot like their own posts.' });
    }
    next();
};

module.exports = { PostExists, interactionValidation };