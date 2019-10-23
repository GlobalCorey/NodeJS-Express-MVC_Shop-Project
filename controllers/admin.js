const Product = require('../models/product');
const { validationResult } = require('express-validator');
const fileHelper = require('../utils/file');

exports.getAddProduct = (req, res, next) => {
    let message = req.flash('error');
    if(message.length > 0){
        message = message[0];
    }
    else{
        message = null;
    }
    res.render('admin/edit-product', {
        pageTitle: 'Add Product', 
        path: '/admin/add-product',
        editing: false,
        hasError: false,
        errorMessage: null,
        oldInput: {
            title: "",
            imageUrl: "",
            price: "",
            description: ""
        },
        validationErrors: []
    });
};

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const image = req.file;
    const price = req.body.price;
    const description = req.body.description;
    const errors = validationResult(req);
    if(!image){
        return res.status(422).render('admin/edit-product', {
            path: '/admin/add-product',
            editing: false,
            hasError: true,
            pageTitle: 'Add Product',
            product: {
                title: title, 
                price: price,
                description: description
            }, 
            errorMessage: 'Attached image is not an image/unsupported image type.',
            validationErrors: []
        });
    }
    if(!errors.isEmpty()){
        return res.status(422).render('admin/edit-product', {
            path: '/admin/add-product',
            editing: false,
            pageTitle: 'Add Product',
            product: {
                title: title,
                price: price,
                description: description
            },
            hasError: true,
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array()
        });
    }

    const imageUrl = image.path;
    const product = new Product({
        title: title, 
        price: price, 
        description: description, 
        imageUrl: imageUrl,
        userId: req.user
    });
    product
    .save()
    .then(result => {
        res.redirect('/admin/products');
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500
        return next(error);
    });
};

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if(!editMode){
       return res.redirect('/')
    }
    const prodId = req.params.productId;
    Product.findById(prodId)
    .then(product => {
        if(!product){
            return res.redirect('/')
        }
        res.render('admin/edit-product', {
            pageTitle: 'Edit Product', 
            path: '/admin/edit-product',
            editing: (editMode === 'true') ? true : false,
            product: product,
            hasError: false,
            errorMessage: null,
            validationErrors: []
        });
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500
        return next(error);
    });
};

exports.postEditProduct = (req, res, next) => {
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const image = req.file;
    const updatedDescription = req.body.description;

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).render('admin/edit-product', {
            path: '/admin/edit-product',
            editing: true,
            pageTitle: 'Edit Product',
            product: {
                title: updatedTitle, 
                price: updatedPrice,
                description: updatedDescription,
                _id: prodId
            },
            hasError: true,
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array()
        });
    }
    
    Product.findById(prodId)
    .then(product => {
        if(product.userId.toString() !== req.user._id.toString()){
            return res.redirect('/');
        }
        product.title = updatedTitle;
        product.price = updatedPrice;
        product.description = updatedDescription;
        if(image){
            fileHelper.deleteFile(product.imageUrl);
            product.imageUrl = image.path;
        }
        return product
        .save()
        .then(result => {
            res.redirect('/admin/products');
        })
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500
        return next(error);
    })
};

exports.deleteProduct = (req, res, next) => {
    const prodId = req.params.productId;
    Product.findById(prodId)
    .then(product => {
        if(!product){
            return next(new Error('Product not found'));
        }
        fileHelper.deleteFile(product.imageUrl);
        return Product.deleteOne({
                _id: prodId, 
                userId: req.user._id
            });
    })
    .then(results => {
        res.status(200).json({
            message: "Success"
        });
        // res.redirect('/admin/products')
    })
    .catch(err => {
        res.status(500).json({
            message: "Deleting product failed."
        });
        // const error = new Error(err);
        // error.httpStatusCode = 500
        // return next(error);
    });
};

exports.getProducts = (req, res, next) => {
    Product.find({userId: req.user._id})
    .then(products => {
        res.render('admin/products', {
            prods: products, 
            pageTitle: 'Admin Products', 
            path: '/admin/products',
        });
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500
        return next(error);
    });
}