const path = require('path');

const shopController = require('../controllers/shop');

const isAuth = require('../middleware/is-auth');

const express = require('express');

const router = express.Router();

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

// //Dynamic routes should be handled last
router.get('/products/:productId', isAuth, shopController.getProduct);

router.get('/cart', isAuth, shopController.getCart);

router.post('/cart', isAuth, shopController.postCart);

router.post('/cart-delete-item', isAuth, shopController.postCartDeleteProduct);

router.get('/orders', isAuth, shopController.getOrders);

router.get('/orders/:orderId', isAuth, shopController.getInvoice)


router.get('/checkout', isAuth, shopController.getCheckout);

router.get('/checkout/success', shopController.getCheckoutSuccess);
 
router.get('/checkout/cancel', shopController.getCheckout);

module.exports = router;