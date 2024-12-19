const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
    post_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    commenter: { 
        type: mongoose.Schema.Types.ObjectId, ref: 'users', 
        required: true 
    },
    message: { type: String, default: null }, // Only filled if interactionType is 'comment'
    timestamp: { type: Date, default: Date.now }, // Timestamp of the interaction
    expirationTimeLeft: { 
        type: Number, // Time left for the post to expire (in minutes)
        required: true 
    }
})


// Unique constraint for post_id and owner/user as a group
//InteractionSchema.index({post_id: 1, user: 1}, {unique: true});

module.exports=mongoose.model('comments',commentSchema)