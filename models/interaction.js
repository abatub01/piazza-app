const mongoose = require('mongoose')

const InteractionSchema = new mongoose.Schema({
    post_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    user: { 
        type: mongoose.Schema.Types.ObjectId, ref: 'users', 
        required: true 
    },
    interactionType: {
        type: String,
        enum: ['like', 'dislike'],
        required: true
    },
    comment: { type: String, default: null }, // Only filled if interactionType is 'comment'
    interactedAt: { type: Date, default: Date.now }, // Timestamp of the interaction
    expirationTimeLeft: { 
        type: Number, // Time left for the post to expire (in minutes)
        required: true 
    }
})


// Unique constraint for post_id and owner/user as a group
//InteractionSchema.index({post_id: 1, user: 1}, {unique: true});

module.exports=mongoose.model('interactions',InteractionSchema)