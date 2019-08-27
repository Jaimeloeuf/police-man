'use strict'; // Enforce use of strict verion of JavaScript

/*	@Doc
    Middleware to change the X-Powered-By response header
    Wrapped in a self-invoking function so that the express and router objects does not pollute the namespace/env
*/

module.exports = (function () {
    const router = require('express').Router();

    // Middleware to remove X-Powered-By headers.
    // Alternative way below
    // app.disable('x-powered-by'); // ("disable" only works for certain express versions, please test before use)
    // Easter egg, X-powered-by middleware to overwrite the original ones.
    router.use((req, res, next) => {
        res.header("X-powered-by", "Blood, sweat and tears.");
        next();
    });

    return router;
})();