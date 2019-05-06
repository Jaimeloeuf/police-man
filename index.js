'use strict'; // Enforce use of strict verion of JavaScript

/*	@Doc
	Main server app instance module.
	This module only holds misc. routes like ping and error handling routes like for 404.
*/

const express = require('express');
const app = express();

const { port } = require('./config');
const { print } = require('./utils');
const { getPublicKey } = require('./token');
// Finalhandler module to deal with responding back to the client and closing the connection

// Function returns uptime in ms. Self invoking partial application with startup time
const uptime = ((start_time) => () => Date.now() - start_time)(Date.now());

// Counter object to track number of occurences for different events
var counter = {
    req: 0,
    failures: 0
};
// Middleware to increase count of req, on each request received
app.use((req, res, next) => {
    ++counter.req;
    next();
});

/*
    When u call next without any arguements, it will run the next middleware that matches route
    When called with 1 arguement, it will run the next middleware that has 4 arguements, which is
    the err, req, res, next middleware. That 1 arguement will be treated as the error object.
*/


/* Mount all the routers from the route modules onto the Express app */
app.use('/user', require('./routes/user'));
app.use(require('./routes/tokens'));
app.use(require('./routes/reset_password'));


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
        // @TODO Remove the hardcoded status number
        status: 200,

        // Current server response latency of the /ping request
        // latency: (Date.now() - req.start_time)

        // Note that counter is also updated with each call to "/ping"
        req_counts: counter,
        uptime: uptime()
    });
});


// 404 Handler for different type of requests
// Normal request middleware, called when no other route's are matched
app.use((req, res) => {
    // Wrap in try/catch in case rendering/send fails.
    try {
        // Log error either to error logs or to a logging service

        // Set status to indicate resource not found
        res.status(404);


        /* Since this is the last non-error-handling middleware used, we assume 404, as nothing else matched/responded.
        $ curl http://localhost:3000/notfound
        $ curl http://localhost:3000/notfound -H "Accept: application/json"
        $ curl http://localhost:3000/notfound -H "Accept: text/plain" */

        /*  Since this is an JSON API only service, this HTML response should only be valid
            if a user navigates to the Service using a browser or something mistakenly.
            Use the templating engine to generate the html page */
        if (req.accepts('html'))
            res.render('404', { url: req.url });

        // respond with json for S.P.A / P.W.A
        else if (req.accepts('json'))
            res.send({ error: 'Not found' });

        // defaults to plain-text representation of the HTTP code
        else
            res.sendStatus(404);
    } catch (err) {
        // 500 error middleware is called upon catching any errors
        next(err);
    }
});


/*  500 internal server error route handler

    To set a error status code other than 500,
    run either of the below code before passing error object, "err" into the "next" function

    res.status(401); // Set statusCode directly with the built in method
    OR
    err.code = 401; // Set the code as property of the object

    // Call the next function with the err object once the code is set.
    next(err);

    Note that an Error status code set with res.status() method will have precedence over err.code
*/
app.use((err, req, res, next) => {
    // Increase failure count of the counter object
    ++counter.failures;

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