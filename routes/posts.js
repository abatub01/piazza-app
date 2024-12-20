const express = require('express')
const router = express.Router()

const Post = require('../models/post')
const Interaction = require('../models/interaction')
const Comment = require('../models/comment')
const verifyToken = require('../verifyToken')
const {postsValidation, commentsValidation} = require('../validations/posts_validation')

// create Post
router.post('/', verifyToken, async (req, res) => {
    try {
        // Retrieve user info from the token 
        const userId = req.user._id; 

        //Input validation: formatting
        const {error} = postsValidation(req.body);
        if (error) {
            return res.status(400).send({message:error['details'][0]['message']})
        }

        //Topic validation: must be within chosen topics: this is already included in postsValidation, but as alternative:
        const topics = req.body.topic;

        const validTopics = ['Politics', 'Health', 'Sport', 'Tech'];
        const invalidTopics = topics.filter(topic => !validTopics.includes(topic));

        if (invalidTopics.length > 0) {
            return res.status(400).json({ message: 'Invalid topic(s)' });
        }

        // Expiration date: transforming from minutes input to date format in the database 
        const expirationMinutes = req.body.expiration;
        const expirationDate = new Date(Date.now() + expirationMinutes * 60000);
        
        // Create a new post with owner details
        const postData = new Post({
            title: req.body.title,
            topic: req.body.topic,
            text: req.body.text,
            expiration: expirationDate,
            owner: userId
        });
        // Save the post to the database
        const postToSave = await postData.save();
        res.status(201).json(postToSave);
    } catch (err) {
        res.status(400).send({message:err})
    }
});



// Get Posts (Read all)
router.get('/', verifyToken, async(req,res) =>{
    try{
        const posts = await Post.find().populate('owner', 'username');  // Populate the `owner` field with username and email
        // Populate the 'comment.commenter' field within the 'comments' array
        const populatedPosts = await Post.populate(posts, { 
            path: 'comments.commenter', 
            select: 'username' 
        });
        // Add expiration status to each post
        const postsWithStatus = populatedPosts.map(post => {
            const postObject = post.toObject();
            postObject['status'] = Date.now() <= new Date(post.expiration) ? 'Live' : 'Expired';
            return postObject;
        });
        res.send(postsWithStatus)
    }catch(err){
        res.status(400).send({message:err})
    }
});


// Get Post (Read by ID)
router.get('/:postId', verifyToken, async(req,res) =>{
    try{
        const postById = await Post.findById(req.params.postId).populate('owner', 'username');
        // Populate the 'comment.commenter' field within the 'comments' array
        await postById.populate('comments.commenter', 'username'); 
        // Adding expiration Status
        const postIdWithStatus = postById.toObject();
        postIdWithStatus['status'] = Date.now() <= postById['expiration'] ? 'Live' : 'Expired';
        res.send(postIdWithStatus)
    }catch(err){
        res.status(400).send({message:err})
    }
});



// Get Post (by Topic)
router.get('/topic/:topictitle', verifyToken, async(req, res) => {
    try{
        const topics = req.params.topictitle;
        // Validate if the topic is one of the allowed enum values
        if (!['Politics', 'Health', 'Sport', 'Tech'].includes(topics)) {
            return res.status(400).json({ message: 'Invalid topic' });
        }

        //find topics
        const postByTopic = await Post.find({
            topic: { $in: topics }
        }).populate('owner', 'username');

        // Populate 'comment.commenter' field in the 'comments' array
        const populatedPosts = await Post.populate(postByTopic, {
            path: 'comments.commenter',
            select: 'username' // Only populate 'username' field for the commenter
        });

        // Adding expiration Status
        const postsWithStatus = populatedPosts.map(post => {
            const postObject = post.toObject();
            postObject['status'] = Date.now() <= post.expiration ? 'Live' : 'Expired';
            return postObject;
        });

        res.send(postsWithStatus);
    } catch (err) {
        res.status(400).send({ message: err });
    }
});



// Search Expired Posts
router.get('/expired/all', verifyToken, async(req, resp) => {
    try {
        // Get messages filtered by Expired status
        const posts = await Post.find({
            expiration: {$lt: Date.now()}
        }).populate('owner', 'username');

         // Adding expiration Status -- all here are expired, but just to double check. 
         const postsWithStatus = posts.map(post => {
            const postObject = post.toObject();
            postObject['status'] = Date.now() <= post.expiration ? 'Live' : 'Expired';
            return postObject;
        });
        resp.send(postsWithStatus)
    }catch(err){
        resp.status(400).send({message:err})
    }
});



// Search Expired Posts on Topics
router.get('/expired/:topictitle', verifyToken, async(req, resp) => {
    try {
        const topics = req.params.topictitle;
        // Validate if the topic is one of the allowed enum values
        if (!['Politics', 'Health', 'Sport', 'Tech'].includes(topics)) {
            return res.status(400).json({ message: 'Invalid topic' });
        }
        // Get messages filtered by topic and Expired status
        const posts = await Post.find({
            topic: { $in: topics },
            expiration: {$lt: Date.now()}
        }).populate('owner', 'username');

         // Adding expiration Status -- all here are expired, but just to double check. 
         const postsWithStatus = posts.map(post => {
            const postObject = post.toObject();
            postObject['status'] = Date.now() <= post.expiration ? 'Live' : 'Expired';
            return postObject;
        });
        resp.send(postsWithStatus)
    }catch(err){
        resp.status(400).send({message:err})
    }
});



// Search Active Posts
router.get('/active/all', verifyToken, async(req, resp) => {
    try {
        // Get messages filtered by Expired status
        const posts = await Post.find({
            expiration: {$gt: Date.now()}
        }).populate('owner', 'username');

         // Adding expiration Status -- all here are expired, but just to double check. 
         const postsWithStatus = posts.map(post => {
            const postObject = post.toObject();
            postObject['status'] = Date.now() <= post.expiration ? 'Live' : 'Expired';
            return postObject;
        });
        resp.send(postsWithStatus)
    }catch(err){
        resp.status(400).send({message:err})
    }
});


// Search Active Posts on Topics
router.get('/active/:topictitle', verifyToken, async(req, resp) => {
    try {
        const topics = req.params.topictitle;
        // Validate if the topic is one of the allowed enum values
        if (!['Politics', 'Health', 'Sport', 'Tech'].includes(topics)) {
            return res.status(400).json({ message: 'Invalid topic' });
        }
        // Get messages filtered by topic and Expired status
        const posts = await Post.find({
            topic: { $in: topics },
            expiration: {$gt: Date.now()}
        }).populate('owner', 'username');

         // Adding expiration Status -- all here are expired, but just to double check. 
         const postsWithStatus = posts.map(post => {
            const postObject = post.toObject();
            postObject['status'] = Date.now() <= post.expiration ? 'Live' : 'Expired';
            return postObject;
        });
        resp.send(postsWithStatus)
    }catch(err){
        resp.status(400).send({message:err})
    }
});



// Query Posts with Highest Interest
router.get('/filter/highest-interest', verifyToken, async(req, res) => {
    try {
        const topic = req.body.topic || null;
        const status = req.body.status || 'All'; // default is All if no body.status is written
        // Validate if the topic is one of the allowed enum values
        if (topic && !['Politics', 'Health', 'Sport', 'Tech'].includes(topic)) {
            return res.status(400).json({ message: 'Invalid topic' });
        }       
        // Validate if the topic is one of the allowed enum values
        if (!['Live', 'Expired', 'All'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status - Pick the following: Live, Expired or All' });
        }
        
        // Define match criteria based on status
        const matchCriteria = {};
        if (topic) {
            matchCriteria.topic = topic; // Include topic if provided
        }
        
        if (status === 'Live') {
            matchCriteria.expiration = { $gt: new Date() }; // Live posts
        } else if (status === 'Expired') {
            matchCriteria.expiration = { $lte: new Date() }; // Expired posts
        } // If status is 'All', no additional expiration criteria

        // Get a message filtered by topic, status, and highest total likes and dislikes
        const posts = await Post.aggregate([
            { $match: matchCriteria }, // Filter by topic and status
            { $addFields: { total_interest: { $add: ['$likesCount', '$dislikesCount'] } } }, // Add total_interest field
            { $sort: { total_interest: -1 } }, // Sort by total_interest in descending order
            { $limit: 1 } // Limit to the highest-interest post
        ]);

        //await posts.populate('owner', 'username')
        const populatedPosts = await Post.populate(posts, { path: 'owner', select: 'username' });
        const postsWithStatus = populatedPosts.map(post => {
            const postObject = { ...post };
            postObject['status'] = Date.now() <= new Date(post.expiration) ? 'Live' : 'Expired';
            return postObject;
        });
        
        res.send(postsWithStatus);
    } catch(err) {
        res.status(400).send({message: err});
    }
});



// Interaction 1: Like Post
router.post('/:postId/like', verifyToken, async(req, resp) => {
    const post = await Post.findById(req.params.postId);

    // Validation 1: check if message status is Expired
    if (Date.now() > post['expiration']) {
        return resp.status(400).send({message: 'The post has Expired.'});
    }

    // Validation 2: Check if the user is liking/disliking their own post
    if (post['owner'].equals(req.user._id)) {
        return resp.status(400).send({message: 'User cannot like their own message.'});
    }

    // Validation 3: Check if user has already liked/disliked
    const interactionExists = await Interaction.findOne({
        post_id: req.params.postId,
        user: req.user._id,
        interactionType: 'like'
    });
    if (interactionExists) {
        return resp.status(400).send({message: 'User cannot like a message multiple times'});
    }

    const interactionNew = new Interaction({
        post_id: req.params.postId,
        user: req.user._id,
        interactionType: 'like',
        expirationTimeLeft: post['expiration'] - Date.now()
    });

    // Try to insert
    try {
        const interactionToSave = await interactionNew.save();
        // Populate the 'user' field with the username from the User collection
        await interactionToSave.populate('user', 'username'); // REFERENCE: 

        // Also increase interaction count of the message
        const updatePost = await Post.updateOne(
            {_id: req.params.postId},
            {$set: {
                likesCount: post['likesCount'] 
            }}
        );
        resp.send({saved_interaction: interactionToSave, updated_post: updatePost});
    } catch(err) {
        resp.send({message: err});
    }
});


// Interaction 2: Dislike Post
router.post('/:postId/dislike', verifyToken, async(req, resp) => {
    const post = await Post.findById(req.params.postId);

    // Validation 1: check if message status is Expired
    if (Date.now() > post['expiration']) {
        return resp.status(400).send({message: 'The post has Expired.'});
    }

    // Validation 2: Check if the user is liking/disliking their own post
    if (post['owner'] === req.user) {
        return resp.status(400).send({message: 'User cannot dislike their own message.'});
    }

    // Validation 3: Check if user has already liked/disliked
    const interactionExists = await Interaction.findOne({
        post_id: req.params.postId,
        user: req.user._id,
        interactionType: 'dislike'
    });
    if (interactionExists) {
        return resp.status(400).send({message: 'User cannot dislike a message multiple times'});
    }

    const interactionNew = new Interaction({
        post_id: req.params.postId,
        user: req.user._id,
        interactionType: 'dislike',
        expirationTimeLeft: post['expiration'] - Date.now()
    });

    // Try to insert
    try {
        const interactionToSave = await interactionNew.save();
        // Populate the 'user' field with the username from the User collection
        await interactionToSave.populate('user', 'username'); // REFERENCE: 

        // Also increase interaction count of the message
        const updatePost = await Post.updateOne(
            {_id: req.params.postId},
            {$set: {
                dislikesCount: post['dislikesCount'] + 1
            }}
        );
        resp.send({saved_interaction: interactionToSave, updated_post: updatePost});
    } catch(err) {
        resp.send({message: err});
    }
});



// Interaction 3: Comment on Post
router.post('/:postId/comment', verifyToken, async(req, resp) => {
    const post = await Post.findById(req.params.postId);

    // Validation 1: check if message status is Expired
    if (Date.now() > post['expiration']) {
        return resp.status(400).send({message: 'The post has Expired.'});
    }

    //Validation 2: user input
    const {error} = commentsValidation(req.body);
    if (error) {
        return res.status(400).send({message:error['details'][0]['message']})
    }

    // Validation 3: user input - may not contain only whitespaces too (avoid spam comments)
    if (!req.body.message || req.body.message.trim().length === 0) {
        return resp.status(400).send({message: 'Comment message is required.'});
    }
    
    const commentMessage = req.body.message;

    const commentNew = new Comment({
        post_id: req.params.postId,
        commenter: req.user._id,
        message: commentMessage,
        expirationTimeLeft: post['expiration'] - Date.now()
    });

    // Try to insert
    try {
        const commentToSave = await commentNew.save();
        // Populate the 'user' field with the username from the User collection
        await commentToSave.populate('commenter', 'username'); // REFERENCE: 

        const updatedPost = await Post.updateOne(
            { _id: req.params.postId },
            { $push: {
                comments: {
                    message: commentMessage,
                    timestamp: Date.now(), // Current timestamp for the comment
                    commenter: req.user._id // The user commenting
                }}
            }
        );

        resp.send({saved_interaction: commentToSave, updated_post: updatedPost})
    } catch(err) {
        resp.send({message: err});
    }
});




module.exports=router