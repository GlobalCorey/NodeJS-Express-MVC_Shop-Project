const User = require('../models/user');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const crypto = require('crypto');
const BCRYPT_SALT_ROUNDS = 12;
const { validationResult } = require('express-validator');

const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: '<INSERT_NODEMAILER_API-KEY'
    }
}));

exports.getLogin = (req, res, next) => {
    let message = req.flash('error');
    if(message.length > 0){
        message = message[0];
    }
    else{
        message = null;
    }
    res.render('auth/login', {
        path: 'login',
        pageTitle: 'Login',
        errorMessage: message,
        oldInput: {
            email: "",
            password: ""
        },
        validationErrors: []
    });
};

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).render('auth/login', {
            path: 'login',
            pageTitle: 'Login',
            errorMessage: errors.array()[0].msg,
            oldInput: {
                email: email,
                password: password
            },
            validationErrors: errors.array()
        });
    }

    User.findOne({email: email})
    .then(user => {
        return bcrypt.compare(password, user.password)
        .then(samePassword => {
            if(!samePassword){
                return res.status(422).render('auth/login', {
                    path: 'login',
                    pageTitle: 'Login',
                    errorMessage: 'Invalid Email or Password.',
                    oldInput: {
                        email: email,
                        password: password
                    },
                    //Return empty array to not give away what failed
                    validationErrors: []
                })
            }

            req.session.user = user
            req.session.isLoggedIn = true;
            return req.session.save((err) => {
                console.log(err);
                res.redirect('/');
            })
        })
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500
        return next(error);
    });
}

exports.getSignup = (req, res, next) => {
    let message = req.flash('error');
    if(message.length > 0){
        message = message[0];
    }
    else{
        message = null;
    }
    res.render('auth/signup', {
        path: 'signup',
        pageTitle: 'Signup',
        errorMessage: message,
        oldInput: {
            email: "",
            password: "",
            confirmPassword: ""
        },
        validationErrors: []
    });
}

exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).render('auth/signup', {
            path: 'signup',
            pageTitle: 'Signup',
            errorMessage: errors.array()[0].msg,
            oldInput: {
                email: email, 
                password: password, 
                confirmPassword: req.body.confirmPassword
            },
            validationErrors: errors.array()
        });
    }

    bcrypt.hash(password, BCRYPT_SALT_ROUNDS)
        .then(hashedPassword => {
            const user = new User({
                email: email,
                password: hashedPassword,
                cart: { items: []}
            });
            return user.save();
        })
        .then(result => {
            res.redirect('/login');
            return transporter.sendMail({
                to: email,
                from: 'shop@node-complete.com',
                subject: 'Signup Succeeded',
                html: '<h1>You Successfully Signed Up </h1>'
            })
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500
            return next(error);
        })
}

exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        res.redirect('/'); 
    });
      
}

exports.getReset = (req, res, next) => {
    let message = req.flash('error');
    if(message.length > 0){
        message = message[0];
    }
    else{
        message = null;
    }
    res.render('auth/reset', {
        path: 'reset',
        pageTitle: 'Reset Password',
        errorMessage: message
    });
}

exports.postReset = (req, res, next) => {
    crypto.randomBytes(32, (err, buffer) => {
        if(err){
            console.log(err)
            return res.redirect('/reset');
        }
        const token = buffer.toString('hex');
        User.findOne({email: req.body.email})
        .then(user => {
            if(!user){
                req.flash('error', 'No account with that email found.');
                return res.redirect('/reset');
            }
            user.resetToken = token;
            user.resetTokenExpiration = Date.now() + 3600000;
            return user.save();
        })
        .then(result => {
            res.redirect('/');
            transporter.sendMail({
                to: req.body.email,
                from: 'shop@node-complete.com',
                subject: 'Password Reset',
                html: `
                    <p>You requested a password reset</p>
                    <p>Click this <a href="http://localhost:3000/reset/${token}">Link</a> to set a new password</p>
                `
            })
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500
            return next(error);
        });
    })
}

exports.getNewPassword = (req, res, next) => {
    const token = req.params.token;
    User.findOne({
        resetToken: token, 
        resetTokenExpiration: {$gt: Date.now()}
    })
    .then(user => {
        let message = req.flash('error');
        if(message.length > 0){
            message = message[0];
        }
        else{
            message = null;
        }
        res.render('auth/new-password', {
            path: 'new-password',
            pageTitle: 'New Password',
            errorMessage: message,
            userId: user._id.toString(),
            passwordToken: token
        });
    })
    .catch(err => console.log(err))
}

exports.postNewPassword = (req, res, next) => {
    //Save new password to const newPassword
    //Find user with given userId
    //Hash newPassword
    //Overwrite old password with new password
    //save user
    //redirect to login
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    User.findOne({
        resetToken: passwordToken, 
        resetTokenExpiration: {$gt: Date.now()}, 
        _id: userId})
    .then(user => {
        if(!user){
           return console.log('user not found');
        }
        return bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS)
            .then(hashedPassword => {
                user.password = hashedPassword;
                user.resetToken = undefined;
                user.resetTokenExpiration = undefined;
                return user.save();
            })
            .then(result => {
                res.redirect('/login');
            })
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500
        return next(error);
    });
}
