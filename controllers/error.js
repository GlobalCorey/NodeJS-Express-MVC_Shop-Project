exports.get404 = (req, res, next) =>{
    res.status(404).render('404', {
        pageTitle: '404 Error', 
        pageContent: 'Page Not Found!', 
        path: '/404',
        isAuthenticated: req.session.isLoggedIn
    })
};

exports.get500 = (req, res, next) => {
    res.status(500).render('500', {
        pageTitle: '500 Error', 
        pageContent: 'Error!', 
        path: '/500',
        isAuthenticated: req.session.isLoggedIn
    })
}