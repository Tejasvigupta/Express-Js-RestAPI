const fs = require('fs');
const path = require('path');

const {
    validationResult
} = require('express-validator/check');

//const io = require('../socket');
const Post = require('../models/post');
const User = require('../models/user');

exports.getPosts = async (req, res, next) => {
    const currentPage = req.query.page || 1;
    const perPage = 2;
    let totalItems;
    try {
        const totalItems = await Post.find().countDocuments()
        const posts = await Post.find()
            .skip((currentPage - 1) * perPage)
            .limit(perPage)
            .populate('creator', 'name')

        res.status(200)
            .json({
                message: 'Fetched posts successfully!',
                posts: posts,
                totalItems: totalItems
            })


    } catch(err) {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
    }


}
/*
exports.getPosts = (req, res, next) => {
    const currentPage = req.query.page || 1;
    const perPage = 2;
    let totalItems;
    Post
        .find()
        .countDocuments()
        .then(count => {
            totalItems = count;
            return Post.find()
                .skip((currentPage - 1) * perPage)
                .limit(perPage)
                .populate('creator','name')
        })
        .then(posts => {
            res.status(200)
                .json({
                    message: 'Fetched posts successfully!',
                    posts: posts,
                    totalItems: totalItems
                })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
            console.log(err);
        })

};
*/

exports.createPost = (req, res, next) => {
    //creating a post!
    const error = validationResult(req, res);
    if (!error.isEmpty()) {
        const error = new Error('Validation Failed you dummy.')
        error.statusCode = 422;
        throw error;
    }
    if (!req.file) {
        const error = new Error('no image provided');
        error.statusCode = 422;
        throw error;
    }
    const imageUrl = req.file.path.replace("\\", "/");
    console.log(imageUrl);
    const title = req.body.title;
    const content = req.body.content;
    let creator;
    const post = new Post({
        title: title,
        content: content,
        creator: req.userId,
        imageUrl: imageUrl
    })
    post.save()
        .then(result => {
            return User.findById(req.userId);
        })
        .then(user => {
            creator = user;
            user.posts.push(post);
            //when we add a post the mongoose will itself
            //do heavy lifting of extracting the post id from post object
            // and appending it to user.
            return user.save();
        })
        .then(result => {
   /*         io.getIO().emit('posts',{action: 'create', post:post}); */
            res.status(201).json({
                message: 'post created successfully!!',
                post: post,
                creator: {
                    _id: creator._id,
                    name: creator.name
                }
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            //will not throw self error as it wont reach the error
            //handling middleware because it's async code!!!
            next(err);
            console.log(err);
        })

};

exports.getPost = (req, res, next) => {
    const postId = req.params.postId; //this post id is the same from route post ID
    Post.findById(postId)
        .then(post => {
            if (!post) {
                const error = new Error('Could not find post');
                error.statusCode = 404;
                throw error; //throwing error in then block means we are passing 
            }
            res
                .status(200)
                .json({
                    message: 'Post fetched',
                    post: post
                })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
            console.log(err);
        })

}

exports.updatePost = (req, res, next) => {
    const postId = req.params.postId;
    const title = req.body.title;
    const content = req.body.content;
    let imageUrl = req.body.image;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation Failed you dummy.')
        error.statusCode = 422;
        throw error;
    }
    if (req.file) {
        imageUrl = req.file.path.replace("\\", "/");
    }
    if (!imageUrl) {
        const error = new Error('No file selected!')
        error.statusCode = 422;
        throw error;
    }

    Post.findById(postId)
        .then(post => {
            if (!post) {
                const error = new Error('could Not Find post.');
                error.statusCode = 404;
                throw error;
            }
            if (post.creator.toString() !== req.userId) {
                const error = new Error('Not authorized!');
                error.statusCode = 403;
                throw err;
            }
            if (imageUrl !== post.imageUrl) {
                post.imageUrl = "";
                clearImage(post.imageUrl);
            }

            post.title = title,
                post.content = content,
                post.imageUrl = imageUrl;
            return post.save();
        })
        .then(result => {
/*            io.getIO().emit('posts',{action :'Update', post :result}) */
            res
                .status(200)
                .json({
                    message: "Post updated successfully!!",
                    post: result
                })
        })
        .catch((err) => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
            console.log(err);
        })
}


exports.deletePost = (req, res, next) => {
    const postId = req.params.postId;
    Post.findById(postId)
        .then(post => {
            if (!post) {
                const error = new Error('could Not Find post.');
                error.statusCode = 404;
                throw error;
            }
            if (post.creator.toString() !== req.userId) {
                const error = new Error('Not authorized!');
                error.statusCode = 403;
                throw err;
            }
            clearImage(post.imageUrl)
            return Post.findByIdAndRemove(postId);
        })
        .then(result => {
            return User.findById(req.userId);
        })
        .then(user => {
            user.posts.pull(postId);
            return user.save()
        })
        .then(result => {
/*            io.getIO().emit('posts',{action:'delete',post:postId}) */
            res
                .status(200)
                .json({
                    message: 'Deleted Post.'
                })
        })
        .catch((err) => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
            console.log(err);
        })
}

const clearImage = (filePath) => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => console.log(err));
}