'use strict'; // Enforce use of strict verion of JavaScript

/*	@Doc
    Middleware used for basic debugging, where the originalUrl is printed out for every request received
    Wrapped in a self-invoking function so that the express and router objects does not pollute the namespace/env
*/

module.exports = (function () {
    const router = require('express').Router();

    // Middleware to log all originalUrl accessed/called
    router.use((req, res, next) => {
        console.log(req.originalUrl);
        next();
    });

    return router;
})();