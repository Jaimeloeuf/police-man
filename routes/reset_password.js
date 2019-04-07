'use strict'; // Enforce use of strict verion of JavaScript

/*	@Doc
    This routes module will handle all API endpoints to reset user password

    Routes:
    - Endpoint to post userID of the user who wish to reset the password.
        Upon getting a request, to check against DB for user with userID,
        if exists, generate a temperory token and make a email request to mail it to the user,
        else just ignore request
    - Link with token in the URL which the user was sent in the email.
        Upon request, dynamically generate the RESET password page with userID in it and respond back to user
    - Endpoint to post new password for the userID
        Upon request, update the DB with the new password.
        If update successful, redirect user to the login page
        else, store the hash temporarily and keep retrying, and in mean time, email user about failure,
        and inform about potential need to reset password again.
*/

const express = require('express');
const router = express.Router();

// POST email/userID to this route to request for a email password reset
router.post('/user/forget-password', (req, res, next) => {
    /*  Read the email/userID from the body.
        Use express.json with size limit before rejecting request as this is a public route
        Expected JSON in request body:  { "userID": ... }   */
    let { userID } = req.body;

    // Get the user object from the DB about this user
    /* Since we are talking about a userObject, would a NoSQL database be better?
    SQL DB vs NoSQL DB in terms of speed? One need to look through everything, one have direct address access */
    const user = db.getUser(userID);

    if (user) {
        // If the user actually exists and the returned user object is not null

        // Generate a temporary token and send to the user's email
        const token = create_token({
            // Sign option here
            // Allocate the 10 mins expiriy time here too
        })({
            // Payload here
            userID,
            token_type: 'tmp-identity-token',
            permissions: 'reset-password'
        });

        // Generate token for this service for accessing the mail service
        create_token()

        // Make a AJAX call to the mail service and end the request
        
    }
});

// Route to reset the password after getting the token in the email
router.get('/auth/reset-password/:token', (req, res, next) => {
   // Verify token's authenticity and validity (By checking signature and expire time)
   
   // Put the token into the Set-Cookie header
   /* Can we go use a cookie module, to deal with the cookie parsing and the setting */

   // Generate the reset password page with the userID in the token and end response
});

// API endpoint for posting the new credentials
// This time round the tmp token is in the cookies
router.post('/auth/reset-password', (req, res, next) => {
    // Using the userID in the token, retrieve password hash from database

    // Make sure new password hash is different
})

module.exports = router;