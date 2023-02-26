const express = require('express');
const { body,check } = require('express-validator/check');
const User =  require('../models/user');

const router = express.Router();

const authController = require('../controllers/auth');
const isAuth = require('../middleware/is-auth');


router.put("/signup",[
    check("email")
    .isEmail().withMessage('Please enter a valid Email')
    .custom((value,{req})=>{
        return User.findOne({email:value})
        .then(userDoc=>{
            if (userDoc) 
            {
                return Promise.reject('Email exists you dumb fuk')
            }
        })
    })
    .normalizeEmail(),
    body('password')
    .trim()
    .isLength({min:5}),
    body('name')
    .trim()
    .not()
    .isEmpty()
],authController.signup);

router.post('/login',authController.login);

router.get('/status',isAuth,authController.getUserStatus);

router.patch('/status', isAuth,[
    body('status')
    .trim()
    .not()
    .isEmpty()
], authController.updateUserStatus);

module.exports = router;