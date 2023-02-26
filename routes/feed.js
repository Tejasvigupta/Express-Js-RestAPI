const express = require('express');
const {
    body
} = require('express-validator/check');

const router = express.Router();

const feedController = require('../controllers/feed');
const isAuth = require('../middleware/is-auth');


// Get /feed/posts routes
router.get('/posts',isAuth,feedController.getPosts);

// Post /feed/post
router.post('/post', isAuth, [
    body('title')
    .trim()
    .isLength({
        min:5
    }),
    body('content')
    .trim()
    .isLength({
        min:5,
        max:400})
], feedController.createPost);

// feed/post/id
router.get('/post/:postId', isAuth, feedController.getPost);

router.put('/post/:postId', isAuth, [
    body('title')
    .trim()
    .isLength({
        min: 5
    }),
    body('content')
    .trim()
    .isLength({
        min: 5,
        max: 400
    })
],feedController.updatePost);

router.delete('/post/:postId', isAuth, feedController.deletePost);

module.exports = router;