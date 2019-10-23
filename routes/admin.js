const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');
const express = require('express');
const router = express.Router();
const { check, body } = require('express-validator');

router.get('/add-product', isAuth, adminController.getAddProduct);

router.post(
    '/add-product', 
    [
        body('title', 'Title is needed!')
        .isString()
        .trim()
        .isLength({min: 3}),

        body('price', 'Price needs to have decimal!')
        .isFloat(),

        check('description', 'Description needs to be longer!')
        .trim()
        .isLength({min: 5, max: 400})
    ], 
    isAuth, 
    adminController.postAddProduct);

router.get('/products', isAuth, adminController.getProducts);

router.get(
    '/edit-product/:productId', 
    [
        body('title', 'Title is needed!')
        .isString()
        .trim()
        .isLength({min: 3}),

        body('imageUrl', 'Need a valid image URL!')
        .isURL(),

        body('price', 'Price needs to have decimal!')
        .isFloat(),

        check('description', 'Description needs to be longer!')
        .trim()
        .isLength({min: 5, max: 400})
    ],
    isAuth, 
    adminController.getEditProduct);

router.post(
    '/edit-product',
    [
        body('title', 'Title is needed!')
        .isString()
        .trim()
        .isLength({min: 3}),

        body('price', 'Price needs to have decimal!')
        .isFloat(),

        check('description', 'Description needs to be longer!')
        .trim()
        .isLength({min: 5, max: 400})
    ],
    isAuth, 
    adminController.postEditProduct
);

router.delete('/product/:productId', isAuth, adminController.deleteProduct);

module.exports = router;