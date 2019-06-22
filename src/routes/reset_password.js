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

    If the user forgets pasword, he/she can reset it
    If the user wants to reset password, does it goes thru same procedure as the
    forget password one??
*/


const express = require('express');
const router = express.Router();
const db = require('../db/db');
const { create_token, verify_token } = require('../token');


// POST email/userID to this route to request for a email password reset
router.post('/user/forget-password', async (req, res, next) => {
    /*  Read the email/userID from the body.
        Use express.json with size limit before rejecting request as this is a public route
        Expected JSON in request body:  { "userID": ... }   */
    const { userID } = req.body;

    try {
        // Get the user object from the DB about this user
        const user = await db.get_user(userID);

        // Generate a temporary token and send to the user's email
        const token = await create_token({
            // Payload here
            userID,
            token_type: 'reset-password-identity-token',
            permissions: 'reset-password',

        }, {
                // Override these default options
                expiresIn: '15m',
                // subject:
        });

        // Generate token for this service for accessing the mail service
        // await create_token()

        // Make a AJAX call to the mail service and end the request

    } catch (err) {
        next(err);
    }
});


// Route to reset the password after getting the token in the email
router.get('/auth/reset-password/:token', async (req, res, next) => {
    try {
        // Verify token's authenticity and validity (By checking signature and expire time)
        const decoded_token = await verify_token(req.params.token);

        // Put the token into the Set-Cookie header
        // @TODO Use a cookie module, to deal with the cookie parsing and setting cookies

        // Generate the reset password page with the userID in the token and end response     
    } catch (err) {
        next(err);
    }
});


// API endpoint for posting the new credentials
// This time round the tmp token is in the cookies
router.post('/auth/reset-password', express.json({ limit: "1kb" }), async (req, res, next) => {
    // @TODO Check JWT in request cookie is valid

    // Using the userID in the token, retrieve password hash from database

    db.update_hash(req.body.userID, req.body.pass)
        .then(() => res.end())
        .catch(next)

    // Make sure new password hash is different
})


module.exports = router;