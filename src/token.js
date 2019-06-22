'use strict'; // Enforce use of strict verion of JavaScript

/*	@Doc Module description:
    - This module wraps over the jwt module to apply the default sign and verify options into
      the methods of the jwts module before exporting these partial applications.
    - User to specify the sign and verify options directly in this module for every service
    - The DEFAULT OPTIONS MUST BE DEFINED, and they must be defined inside this module
    - Essentially the sign and verify options specific to this service is defined here
        - Their input interface is
            (payload, ?options)   where options object is optional.
    - Payload given to create_token function should only contain private claims and
      should not hold any of the pre-registered interoperable claim names and values.


    @TODO
    - Should there be a "subject" field in the signing options? Or is it already in the payload?
        - Actually what is signing option? Basically the default payload?
        - The words are too confusing.
    - For the audience, since it can change, is it a value that the user is allowed to set themselves?

    - Finnish writing the verification middleware
    - Start implementing JWEs (Is JWEs needed if there are stored in a HttpOnly cookie?)
*/

// Dependencies
// Directly call apply_keys method to get create and verify token methods with key-pair baked in
const jwt = require('jwts').apply_keys();


// @Todo use cookie parser here?
// This is a Express middleware for routes that require JWT security
function get_token(req, res, next) {
    // Save token for subsequent functions to access token with request object after this middleware
    req.token = jwt.extract_jwt_in_header(req);
    // End the req/res cycle if no token is sent
    if (typeof req.token === 'undefined') {
        // Use 401 auth-token not provided, if token not received
        const err = new Error('Token expected');
        err.code = 401;
        next(err);
    }
    // ^To update the response message, either with a 401 HTML page or smth
}


// @Todo Figure the below out
// Function that returns an array of audience, for a given input app
function audience(application) {

    // Temporarily return a hard coded set of items before this function is complete
    return ['my_audience', 'my_second_audience', 'billing-service'];
}


// Function that returns an option object depending on the given token issuser, used for signing and verifying JWTs
function options() {
    return {
        issuer: 'police-man',
        audience: ['police-man', ...audience()],
        expiresIn: '10m' // Give the token a 10min default Time To Live
    };
}


function signOptions() {
    const option = options();
    option.algorithm = 'RS256'; // Must be RS256 as using asymmetric signing
    return option;
}

function verifyOptions() {
    const option = options();
    option.algorithm = ['RS256'] // Unlike signOption that we used while signing new token , we will use verifyOptions to verify the shared token by client. The only difference is, here the algorithm is Array [“RS256”].
    return option;
}


/* // Default JWT Signing options object
const signOptions = {
    issuer: 'police-man',
    subject: 'some@user.com',
    audience: ['police-man', ...audience()],
    expiresIn: '10m', // Give the token a 10min lifetime
    algorithm: 'RS256' // Must be RS256 as using asymmetric signing
};

// Default JWT Verification options object
const verifyOptions = {
    issuer: 'police-man',
    subject: 'some@user.com',
    audience: ['police-man', ...audience()],
    algorithm: ['RS256'] // Unlike signOption that we used while signing new token , we will use verifyOptions to verify the shared token by client. The only difference is, here the algorithm is Array [“RS256”].
}; */


module.exports = {
    // The middleware for extracting token into request object's token property
    get_token,

    // Partially applied functions from the jwt module with default options object in their closures
    create_token: jwt.create_token(signOptions()),
    verify_token: jwt.verify_token(verifyOptions()),

    // Directly re-export method for getting public key from the jwt module
    getPublicKey: jwt.getPublicKey
}