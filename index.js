'use strict'; // Enforce use of strict verion of JavaScript

/*	@Doc
	Main server app instance module.
    This module only holds misc. routes like ping and error handling routes like for 404.
    
    Express Note:
    When "next" is called without any arguements, it will run the next middleware that matches route
    When called with 1 arguement, it will run the next middleware that has 4 arguements, which is the
    (err, req, res, next) Error handling middleware. The 1st arguement will be treated as the error object.
*/

const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');

const { port } = require('./config');
const { print } = require('./utils');
const { getPublicKey } = require('./token');
// Finalhandler module to deal with responding back to the client and closing the connection


// Function returns uptime in ms. Self invoking partial application with startup time
const uptime = ((start_time) => () => Date.now() - start_time)(Date.now());


// Counter object to track number of occurences for different events
const counter = { req: 0, failures: 0 };

// Middleware to increase count of req, on each request received
app.use((req, res, next) => {
    ++counter.req;
    next();
});

// Mount the cookie parser middleware before routes.
app.use(cookieParser());

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

        // @Todo find a way to calculate server latency
        // Current server response latency of the /ping request
        // latency: (Date.now() - req.start_time)

        // Note that counter is also updated with each call to "/ping"
        req_counts: counter,
        uptime: uptime()
    });
});


/*  404 Handler for different type of requests
    Normal request middleware, called when no other route's are matched

    Wrapped in try/catch in case response fails.
*/
app.use((req, res, next) => {
    try {
        // Log error either to error logs or to a logging service

        // Set status to indicate resource not found and send back the string representation of the HTTP code, i.e. "Not-Found"
        // res.sendStatus(404);

        // Send without the string representation. End the cycle right after setting with 404
        res.status(404).end();
    } catch (err) {
        // 500 error middleware is called upon catching any errors
        next(err);
    }
});


/*  500 internal server error route handler

    For error status code other than 500, look at example below

    res.status(401); // Set statusCode directly with the built in method
        OR
    err.code = 401; // Set the code as property of the object

    ** Note that an Error status code set with res.status() method will have precedence over err.code

    next(err); // Call the next middleware function with the err object once the code is set.

    ----------------------------------------------------------------------------------------------

    To send the error message back to the client, and not just the status code with an empty body.
    Use the "send_msg_back" property. Set it to true to send mesage back to client.

    err.send_msg_back = true; // Set true to return the error message back to the client

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
    res.end(err.send_msg_back ? err.message : undefined);

    // Should the error message or something like below be sent back to the user?
});

app.listen(port, () => print(`Server listening to port ${port}`));