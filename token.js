'use strict'; // Enforce use of strict verion of JavaScript

/*	@Doc Module description:
    - This module wraps over the jwt module to apply sign and verify options into the methods
      the jwt module before exporting the functions returned by these partial applications.
    - User to specify the sign and verify options directly in this module for every service
    - The DEFAULT OPTIONS MUST BE DEFINED, and they must be defined inside this module
    - Essentially the sign and verify options specific to this service is defined here
        - Their input interface is
            (payload, ?options)   where options object is optional.
    - Payload given to create_token function should only contain private claims and
      should not hold any of the pre-registered interoperable claim names and values.


    @TODO
    - Finnish writing the verification middleware
    - Start implementing JWEs (Is JWEs needed if there are stored in a HttpOnly cookie?)
*/

// Dependencies
const jwt = require('./jwt');


// Default JWT Signing options object
var signOptions = {
    issuer: 'Mysoft corp',
    subject: 'some@user.com',
    // audience: 'https://Promist.io',
    audience: ['https://Promist.io', '.... all the services names'],
    expiresIn: '10m', // Give the token a 10min lifetime
    algorithm: 'RS256' // Must be RS256 as using asymmetric signing
};

// Default JWT Verification options object
var verifyOptions = {
    issuer: 'Mysoft corp',
    subject: 'some@user.com',
    // audience: 'https://Promist.io',
    audience: ['https://Promist.io', '.... all the services names'],
    algorithm: ['RS256'] // Unlike signOption that we used while signing new token , we will use verifyOptions to verify the shared token by client. The only difference is, here the algorithm is Array [“RS256”].
};


// Utility function for merging. Returns an object made by merging the 2 input objects
// To Create another merge function for deep merge using lodash's merge module
const merge = (o1) => (o2) => ({ ...o1, ...o2 });

/*  Partially apply options with merge function to get specialized functions with given options in
    the closure, to apply to another options object with properties the user wants to override.
    Bind these specialized functions to the original given options object's name */
signOptions = merge(signOptions);
verifyOptions = merge(verifyOptions);


/*  Create new create and verify token functions in this namespace to export
    
    - Always merge with default options object to override properties if any are passed
      into the function by finnishing application with the partial application function.
    - The awaiting should be done by the function caller.   */
const create_token = (payload, options = {}) => jwt.create_token(signOptions(options))(payload);
const verify_token = (payload, options = {}) => jwt.verify_token(verifyOptions(options))(payload);


/*  Token verification middleware:
    To be passed in to the routes before the route handlers.
    If the token is invalid, it will secure the route by automatically ending the req/res cycle */
function v_mw(req, res, next) {
    // Middleware to call the verify function first to make sure JWT is valid

    if (!verify(token)) {
        // See what is the status code to respond with depending on
        // why the token is not valid.

        res.end();
    }
    next();
}


// This is a Express middleware for routes that require JWT security
function get_token(req, res, next) {
    // Save token for subsequent functions to access token with request object after this middleware
    req.token = jwt.extract_jwt_in_header(req);
    // End the req/res cycle if no token is sent
    if (typeof req.token === 'undefined')
        res.status(401).end(''); // If token does not exist or not sent over, respond with a 401 auth-token not provided
    // ^To update the response message, either with a 401 HTML page or smth
}


module.exports = {
    // The middleware for extracting token into request object's token property
    get_token,

    // The 2 modified versions for token signing and verification with the key in their closures
    create_token,
    verify_token,

    // Export method for getting public key with from the jwt module
    getPublicKey: jwt.getPublicKey
}