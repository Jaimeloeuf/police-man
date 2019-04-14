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
        // Verify credentials to get user object back and attach to req object to use downstream
        req.user = await auth.verify_credentials(req.body.userID, req.body.pass);

        // Call the next middleware
        next();
    } catch (err) {
        // Passing error to error handling middleware to deal with it.
        next(err);
    }
}


// Middleware function for creating JWT payload for the client, creating and signing the JWT and finally attaching it for the user to use
async function attach_token(req, res, next) {
    // Base on the results by the authenticate middleware create a token for the user
    const token = await create_token(req.user);

    // Attach token to res object differently based on request client type.
    // If browser client, set token into cookie. Else if service or native app, put in auth header
    if (req.header.type === 'browser') // Make a Regex Search or use a package for this
    {
        res.header['Set-cookie'] = token;
    }
    else { // If service or native apps
        res.header['Authorization'] = token;
    }

    // Temporary end cycle statement with the token in the body
    res.end(token);
}


/*  @Code-flow
    1.  User posts credential to server on the '/login' route
    2.  Use the bodyParser middleware to read the user credentials from the request body
        - Make sure that the deserialization is safe from JS execution attacks
        - Maybe Clean/Sanitize the credentials before using it against the DB?
    3.  Login route's handler will authenticate user's credential against those in the Database
    4.  If the credentials are valid,
            - Generate a JWT/Refresh-token pair
            - Put the tokens into the response headers
            - Put the redirect location towards the user homepage into the response headers
            - Respond back to the client with the Response messages

    "tokens" and "login" routes are both used for exchanging Credentials for JWTs
    - When user is on login page, creds. should be posted to /login route
    - When user is not on the login page but needs to post creds. for JWTs, then /token route should be used
*/
router.post(['/login', '/token'], express.json({ limit: "1kb" }), authenticate, attach_token);


// Route to get a new JWT with a complimentary refresh token
router.post('/tokens/refresh', express.json(), (req, res) => {
    // Use the bodyParser middleware to read the refresh token in the request body

    // Verify that the refresh token is valid

    // Create a new token and return to the client
});


module.exports = router;