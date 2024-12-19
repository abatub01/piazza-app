const mongoose = require('mongoose')

const PostSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    topic:[{ 
        type: String, 
        enum: ['Politics', 'Health', 'Sport', 'Tech'],
        required:true
     }],
    text:{
        type:String,
        required:true
    },
    posted_date: { 
        type: Date, 
        default: Date.now 
    },
    expiration: { 
        type: Date
    },
    owner: { 
        type: mongoose.Schema.Types.ObjectId, ref: 'users' // only owner's post ID is saved to the backend
    }, 
    likesCount:{ 
        type: Number, default: 0 
    },
    dislikesCount:{ 
        type: Number, default: 0 
    },
    comments: [{ 
        commenter: { type: mongoose.Schema.Types.ObjectId, ref: 'users'}, 
        message: { type: String},
        interactedAt: { type: Date}
    }]
})

module.exports=mongoose.model('posts',PostSchema)