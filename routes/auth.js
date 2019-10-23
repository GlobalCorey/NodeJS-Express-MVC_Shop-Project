const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const { check, body } = require('express-validator');
const User = require('../models/user');

router.get('/login', authController.getLogin)

router.post(
    '/login',
    [
        check('email', 'Not a valid Email. Try again.')
        .isEmail()
        .normalizeEmail(),

        body('password', 'Invalid password. Must be more than 5 characters long.')
        .trim()
        .isLength({min: 5})
        
    ],
    authController.postLogin
);

router.get('/signup', authController.getSignup);

router.post(
    '/signup', 
    [
        check('email')
        .isEmail()
        .withMessage('Please enter a valid Email.')
        .custom((value, { req }) => {
            return User.findOne({email: value})
                .then(userDoc => {
                    if(userDoc){
                        return Promise.reject('Email already exists.');
                    }
                })
        })
        .normalizeEmail(),

        body(
            'password', 
            'Please enter a password with more than 5 characters.')
        .trim()
        .isLength({min: 5}),

        body('confirmPassword')
        .trim()
        .custom((value, { req }) => {
            if(value !== req.body.password){
                throw new Error('Passwords must match!');
            }
            return true;
        })
        .trim()
    ]
    , 
    authController.postSignup
);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;