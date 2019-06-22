'use strict'; // Enforce use of strict verion of JavaScript

/*	@Doc
    API routes for registering a new user
    All URL endpoints have "/user" route prefixed when router is mounted onto server app


    @Flow (Of registering a new user)
    - User goes to the register page.
    - User enters email and click enter, the details are POSTed from SPA to server via AJAX
    - Server creates a one time, short lived JWT with permissions to register only and
      send this JWT to the user's email address as a clickable registration link.
    - User opens email and clicks on the link
    - User is sent to the registration page to fill in all user details.
    - After filling in the details, user clicks enter.
    - User details are POSTed to server via AJAX
    - If user is successfully created on the server, server responds with a redirect
      back to the login page.
      Else if creation failed, respond with a failure and ask user to try again later.

    ^ Endpoints needed:
    - POST: email posting endpoint
    - GET: endpoint where the user goes to with the JWT in the URL directly to fill in details
        - Server responds with the web-app and JWT in the cookie.
    - POST: Final endpoint for user to post all user details before being redirected to login page


    @Todo
    - Verify if all the status code sent back are right and informative
    - Should the email posting route, get the email in the URL? Would that be better than using json?
    - Change the hostname from localhost to the actual hostname.
        ^ How can this be done automatically? Env variables or?
*/

const express = require('express');
const router = express.Router();
const { create_token, verify_token } = require('../token');
const db = require('../db/db');

// POST route to get email address
router.post('/register', express.json({ limit: "500" }), (req, res) => {
    /*  @Doc
        This route accepts a email from or User identifier from the SPA, to
        generate a one time use JWT and send the token to the user via email.

        @Flow
        - Check if email is valid against the DB
        - Create JWT for temporary registration use
        - Send JWT over to email
        - Respond with a 200 ok if no problem
    */

    const { email } = req.body;

    // Check if email is valid


    // Create JWT for the user
    // Create a create_token function that have the registration signOption partially applied to it
    const signOptions = {
        issuer: 'auth-backend',
        // subject: email,
        audience: 'registration',
        expiresIn: '10m', // 10min lifetime
        algorithm: 'RS256' // Must be RS256 as using asymmetric signing
    };
    const token = create_token({ sub: email });

    // Create HTML template and send JWT over. Either render the HTML here or request for it in mail service
    const link = `https://localhost:3000/user/register/${token}`;

    // Use a templating engine to inject the link in.
    // The developer of this service should add a HTML template that accepts a link.
    // @TODO implement the above


    res.status(200);
});


/*  On the register page:

    Route to get static register page. It depends if the app is a single page app or a site with static navigation links. If static based site is used with this service then the below GET /register route needed, else the SPA should just update itself to show the register page without server call.
    
    // router.get('/register', (req, res) => { });

    ^ The full path for the above route is "/user/register"
*/


router.get('/register/:token', async (req, res) => {
    /*  @Doc
        This is the route accessed by client when clicking on the link sent to their email for registration.
    
        @Flow
        - Verify token sent in the URL
        - If JWT is valid, redirect to enter user details for registration page, if SPA, it means to send response asking client web-app to load that page register page. Most likely sending the whole App back and loading that page on startup. Make sure that the token is now set in the client's cookie
        - Else send back a "Sorry link invalid" with redirect to register page again.
            ^ Should the redirect be done with the web-app? So server only respond with fail and web-app redirects
    */

    try {
        // Decode and verify token
        const decoded_token = verify_token(req.params.token);

        // Send username back to the web-app to display
        res.send(decoded_token.username);
    } catch (err) {
        // Log error to log file or logging service


        // Send error back along with error code
        res.status(401).send(err);
    }
});


// POST route that takes user details and insert to DB
router.post('/register/details', express.json({ limit: "1kb" }), (req, res) => {
    /*  @Doc
        This route is the final route to complete user registration.
        User posts the rest of the user details to the server to store and can now log in.

        The size of the request body is limited for security reasons.
        Size limit can be changed but only do so if you are sure that the user details exceed the limit

	@Flow
	- Check the JWT in the request cookie to be valid.
	- Check that the user object exists in the DB right now
	- Insert the data into the user details database and response with insertion status.
    */

    // Call the DB function and pass it the user details object in the request body
    db.new_user(req.body.user)
        .then(() => {
            // On successful user insertion, send confirmation to user email
            // Redirect user to login page too.
            // Should redirect be done by using response headers or requesting fron-end app to do so?
            res.status(201); // 201 to indicate successful creation of user
        })
        .catch((err) => {
            // If there is an error, send error back to client and end the req cycle
            res.status(500).send(err);
            // ^ Perhaps just log the error and dont send it back to client for security concerns.
        });


    try {
        // Call the DB function and pass it the user details object in the request body
        await db.new_user(req.body.user);

        // On successful user insertion, send confirmation to user email and redirect user to login page.
        // @TODO Should redirect be done by using response headers or requesting fron-end app to do so?
        res.status(201); // 201 to indicate successful creation of user
    } catch (err) {
        // If there is an error, send error back to client and end the req cycle
        // @TODO Or Perhaps just log the error and dont send it back to client for security concerns.
        res.status(500).send(err);
    }
});


module.exports = router;