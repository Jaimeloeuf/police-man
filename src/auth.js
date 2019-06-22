'use strict'; // Enforce use of strict verion of JavaScript

/*	@Doc
    Module that exports functions to verify user credentials against those stored in the DB
    
    High level Functions needed:
    - Password verification against the has from database
    - Create Hash from password and store in Database to update when user changes password

    Smaller functions:
    - Get password hash from DB given userID
    - Password verification against given hash
    - Password to hash given password
    - Write password hash to DB given userID

    The method used is update hash and not set hash because, when a new user entry is
    created, it is created with a default null password, which should be then updated
    with the update_hash method.

    Construct the smaller functions first and compose the higher level functions with them
*/

const bcrypt = require('bcryptjs');
const hash = require('./hash');
// Import in DB methods for reading and updating password hash from the db module
const db = require('./db/db');


/*  Function verifies a given set of credentials to return a promise that
    Resolves with the user object if verified to be correct
    Rejects with 'Wrong password' if the password was invalid
    Rejects with error code from async function calls if either the DB or BCrypt action fails.
*/
const verify_credentials = (userID, password) =>
// @Todo is this really the better solution? Where new Promise uses async function
    new Promise(async (resolve, reject) => {
        try {
            // Get the whole user object from the DB
            const user = await db.get_user(userID);

            // If the password is correct, return the user Object
            if (await bcrypt.compare(password, user.hash)) {
                delete user.hash;
                return resolve(user);
            }
            else {
                // If the password is incorrect, create an error object and reject with it
                const err = new Error('Wrong password');
                err.code = 401;
                return reject(err);
            }
        } catch (err) {
            // If db or Bcrypt throws other errors, reject with the error
            return reject(err);
        }
    });


// Figure out how the below will work
/* async function verify_credentials(userID, password) {
    try {
        // Get the whole user object from the DB
        const user = await db.get_user(userID);

        // If the password is correct, return the user Object
        if (await bcrypt.compare(password, user.hash))
            return resolve(user);
        else {
            // If the password is incorrect, create an error object and reject with it
            const err = new Error('Wrong password');
            err.code = 401;
            return reject(err);
        }
    } catch (err) {
        // If db or Bcrypt throws other errors, reject with the error
        return reject(err);
    }
} */



module.exports = {
    verify_credentials
}