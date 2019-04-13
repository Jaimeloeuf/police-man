'use strict'; // Enforce use of strict verion of JavaScript

/*	@Doc
	Main server app instance module.
	This module only holds misc. routes like ping and error handling routes like for 404.
*/

const express = require('express');
const app = express();

// const { port } = require('./config');
const port = 3000;
const { print } = require('./utils');
const { getPublicKey } = require('./token');

// Finalhandler module to deal with responding back to the client and closing the connection


/* Mount all the routers from the route modules onto the Express app */
app.use('/user', require('./routes/user'));
app.use(require('./routes/tokens'));
// app.use(require('./routes/reset_password'));


// var counter = 0;
// // At end of all routes, print the counter value out again.
// app.all('*', (req, res, next) => ++counter);
// app.use((req, res) => ++counter);

/*
    When u call next without any arguements, it will run the next middleware that matches route
    When called with 1 arguement, it will run the next middleware that has 4 arguements, which is
    the err, req, res, next middleware. That 1 arguement will be treated as the error.
*/

// Route to get public key for verifying JWTs signed by complimenting private key.
// Might move the key storage to a centralized publicKey store in the future
app.get('/public-key', (req, res) => res.end(getPublicKey()));

// Ping Route to check server status
app.get('/ping', (req, res) => {
	/*	Things to return to client
		- Current number of users in DB
		- Load of the server
    */
    res.json({
        status: 200,
        // Current server response latency of the /ping request
        // latency: get_current_latency()
    });
});

/* Since this is the last non-error-handling middleware used, we assume 404, as nothing else responded.
$ curl http://localhost:3000/notfound
$ curl http://localhost:3000/notfound -H "Accept: application/json"
$ curl http://localhost:3000/notfound -H "Accept: text/plain" */

// 404 route handler
app.use((req, res) => {
    // Log error either to error logs or to a logging service
    res.status(404).send("Sorry can't find that!");
});

// 404 Handler using templating engine for HTML response
// app.use((req, res) => {
//     res.status(404);

//     // respond with html page
//     if (req.accepts('html')) {
//         res.render('404', { url: req.url });
//         return;
//     }

//     // respond with json
//     if (req.accepts('json')) {
//         res.send({ error: 'Not found' });
//         return;
//     }

//     // default to plain-text. send()
//     res.type('txt').send('Not found');
// });


/*  500 internal server error route handler

    To set a error status code that is not 500,
    run either of the below code before passing the error object, "err" into the "next" function

    // Set the code as property of the object
    err.code = 401;
    // Set statusCode directly with the built in method
    res.status(401);
    // Call the next function with the err object
    next(err);
*/
app.use((err, req, res, next) => {
    // Log error either to error logs or to a logging service
    console.error(err.stack);

    // Make sure that the status code is an error code
    if (res.statusCode < 400)
        res.status(err.code || 500);

    // End the request after making sure status code is set
    res.end();

    // Should the error message or something like below be sent back to the user?
});

app.listen(port, () => print(`Server listening to port ${port}`));