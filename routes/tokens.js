'use strict'; // Enforce use of strict verion of JavaScript

/*	@Doc
    This module contains:
    - Route handlers to deal with tokens
    - 2 middleware functions, for authenticating the Creds and creating + attaching token
    
    1.  User posts credential to server on the '/login' route
    2.  Login route's handler will authenticate user's credential against those in the Database
    3.  If the credentials are valid,
            - Generate a JWT/Refresh-token pair
            - Put the tokens into the response headers
            - Put the redirect location towards the user homepage into the response headers
            - Respond back to the client with the Response messages


    'tokens' and 'login' routes are both used for exchanging Credentials for JWTs
    When user is on the login page, the creds. should be posted to the /login route
    When user is not on the login page but wants to post creds. for JWTs, then the /token route should be used instead
*/

const express = require('express');
const router = express.Router();
const auth = require('../auth');
const { create_token, verify_token } = require('../token');

// Middleware function for authenticating Credentials against Database credentials for user Object
async function authenticate(req, res, next) {
    /*  Expected JSON posted from client: {
            userID: "Unique User ID, or can be the username also",
            pass: "Password for the user with 'userID'"
        }
    */

    try {
        // Verify credentials to get the user object back and attach to req object to use downstream
        req.user = await auth.verify_credentials(req.body.userID, req.body.pass);

        // Can I not call next? Will it be called automatically?
        // next();
        
    } catch (err) {
        // Log the error

        // End this req/res cycle with a failed code for 'unauthorized'
        res.status(401).send(err);
        // ^ Should the reason/error for failure be returned to the user? Would it be safe?
    }
}

// Middleware function for creating JWT payload for the client, creating and signing the JWT and finally attaching it for the user to use
function attach_token(req, res, next) {
    // Base on the results by the authenticate middleware create a token for the user
    const token = create_token(req.user);

    // Attach token to res object differently based on request client type.
    //  If browser client, set token into cookie. Else if service or native app, put in auth header
    if (req.header.type === 'browser') // Make a Regex Search or use a package for this
    {

    }
    else { // If service or native apps
        res.header['Authorization'] = token;
    }
    //  See how to revoke tokens or revoke cookies that is sent by the browser
}

/*  @Code-flow
    Use the bodyParser middleware to read the user credentials from the request body
    Maybe Clean/Sanitize the credentials before using it against the DB?
    Get the password hash of user with "userID" from the DataBase
    compare it with the password user posted
    Create a JWT and send it back to the user
*/
router.post('/login', express.json(), authenticate, attach_token);
router.post('/tokens', express.json(), authenticate, attach_token);
// See if the below format is possible to combine the above 2 routes
router.post('/(tokens | login)', express.json(), authenticate, attach_token);


// Route to get a new JWT with a complimentary refresh token
router.post('/tokens/refresh', express.json(), (req, res) => {
    // Use the bodyParser middleware to read the refresh token in the request body

    // Verify that the refresh token is valid

    // Create a new token and return to the client
});

module.exports = router;