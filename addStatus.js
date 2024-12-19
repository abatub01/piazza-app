
const postswithStatus= (req, res, next) => {
    try {
        // Check if req.posts exists and process it
        if (req.posts) {
            req.posts = req.posts.map(post => {
                const postObject = post.toObject(); // Convert Mongoose document to plain JS object
                postObject['status'] = Date.now() <= post['expiration'] ? 'Live' : 'Expired';
                return postObject;
            });
        }
        next(); // Pass control to the next middleware/route handler
    } catch (err) {
        res.status(500).json({ message: 'Error processing posts', error: err.message });
    }
};