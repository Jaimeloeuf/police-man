'use strict'; // Enforce use of strict verion of JavaScript

/*	@Doc
    API routes for users
    Routes in this module will provide expose the user CRUD operations via RESTful APIs
    All URL endpoints will have a '/user' prefixed to the routes

    Services provided to clients:
    - GET/Read entire user object
    - DEL/Deactivate user from the system by adding a deactivated tag to the user object

    Can I store a user object in a SQL DB? Is it I read already, then I recreate it into JS Obj
    using something like a ORM? Or Scheme?
    
    @Todo
    - Modify the user route to be JWT protected
    - Check if all the status code are correct
    - Create a new /user route without the userID, which basically just
      accepts a req from the client, read its JWT to check for the userID
      and then redirects the client to the route that holds their userID
*/

const express = require('express');
const router = express.Router();
const { verify_token } = require('../token');
const db = require('../db/db');

// Next function is not needed, as it will be called automatically by express
async function jwt_mw(req, res) {
    try {
        // Verify that token is valid and replace the token in request object with this one
        // Can we use a cookie parser to get the token into the request object instead
        req.token = await verify_token(req.token);
    } catch (err) {
        // Log error to error file or logging service

        // End the request
        res.status(401).end();
    }
}

// (READ) Route to get the user object back from the DB
router.get('/:userID', (req, res) => {
    const { userID } = req.params;

    db.get_user(userID)
        .then(res.json)
        .catch(error => res.status(error.code).send(error.message)); // Expects error thrown to be an object
});

// (READ) Route to get the user object back from the DB
router.get('/:userID', (req, res) => {
    res.json({ userID: req.params.userID });
});

module.exports = router;