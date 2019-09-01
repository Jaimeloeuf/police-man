'use strict'; // Enforce use of strict verion of JavaScript

/*	@Doc
    This module contains:
    - Route handlers to deal with tokens
    - 2 middleware functions, for authenticating the Creds and creating + attaching token

    @Todo
    - See how to revoke tokens or tokens in browser cookies
*/

const express = require('express');
const router = express.Router();
const auth = require('../auth');
const { create_token, verify_token } = require('../token');


// Middleware function for authenticating Credentials against Database credentials for user Object
// Once authenticated, user object will be attached to the req object, else err object will be passed to error handling middleware
async function authenticate(req, res, next) {
    // Expected JSON from client: { userID: "Unique userID", pass: "Password for this user" }
    try {

        /*  If user already has a valid token.
            Check if the user specified / claimed exists in the DB anot.

            If no, means the user was deleted while the client still had the token.
            In this case we would need to invalidate the token.
        */
        console.log('Cookies: ', req.cookies.token)
        verify_token(req.cookies.token)
            .then(console.log)

        // Extract the userID and the password from the request body.
        const { userID, pass } = req.body;

        /*  Make sure extracted values are not empty or undefined, before verifying credentials to
            get back the user object, in order to attach it onto the req object for use downstream. */
        if (userID && pass)
            req.user = await auth.verify_credentials(userID, pass);
        else {
            const err = new Error("badly formed body");
            // To send the error message back to the client.
            err.send_msg_back = true;
            // Set error code to be 400 for Client error bad request.
            err.code = 400;
            throw err;
        }

        // Call the next middleware
        next();
    } catch (err) {
        // Passing error to error handling middleware to deal with it.
        next(err);
    }
}


// @Todo finish implementing this function
// Function that returns a Cookie option that is specific for every application / user / request
function cookie_option_for(req) {
    /*  Options object for responding with Cookies
    */
    const cookie_options = {
        // Set cookie to auto expire after 600,000ms, a.k.a 10mins before a refresh is needed.
        maxAge: 600000,

        // Http Only cookie to prevent XSS attacks
        httpOnly: true
    };

    return cookie_options;
}

// Middleware for creating the JWT before attaching it onto the response stream for the user depending on the client type
async function attach_token(req, res, next) {
    // Base on the results by the authenticate middleware, create a token for the user uding the user object
    const token = await create_token(req.user);
    // ^ @Todo Set user object to "user" property of the jwt instead of setting the properties of user object on the jwt root level.

    // @Todo Fix the items below
    // Attach token to res object differently based on request client type.
    // If browser client, set token into cookie. Else if service or native app, put in auth header
    if (req.header.type === 'browser') {
        // Make a Regex Search or use a package for this
    }
    else { // If service or native apps
        res.header['Authorization'] = token;
    }

    console.log(token)
    // @Todo What if the user tries to login even though he/she already has a token?

    res.cookie('token', token, cookie_option_for(req)); // Send the token back to the user as a Cookie
    res.end(); // End the cycle
}


/*  @Code-flow
    1.  User posts credential to server on the '/login' route
    2.  Check to make sure that the user does not already have a valid token.
    3.  Use the bodyParser middleware to read the user credentials from the request body
        - Make sure that the deserialization is safe from JS execution attacks
        - Maybe Clean/Sanitize the credentials before using it against the DB?
    4.  Login route's handler will authenticate user's credential against those in the Database
    5.  If the credentials are valid,
            - Generate a JWT/Refresh-token pair
            - Put the tokens into the response headers
            - Put the redirect location towards the user homepage into the response headers
            - Respond back to the client with the Response messages
*/
router.post('/login', express.json({ limit: "1kb" }), authenticate, attach_token);


// @Todo fix below route to make it for token generation for services.
// router.post('/token', express.json({ limit: "1kb" }), authenticate, attach_token);


// When JWT expires, user should POST refresh token to "/token/refresh" route for a new token pair
// Route to get a new JWT with a complimentary refresh token
router.post('/tokens/refresh', express.json(), (req, res) => {
    // Use the bodyParser middleware to read the refresh token in the request body

    // Verify that the refresh token is valid

    // Create a new token and return to the client
});


module.exports = router;