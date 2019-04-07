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
// Import in DB methods for reading and updating password hash from the db module
const { get_hash, update_hash } = require('./db/db');

/*  Cost factor variable - number of rounds used to generate the salt.
    Cost factor should be different for normal users VS admins.
    Admins cost factor should be around 14
    @Todo read from elsewhere and not pre-defined
*/
const cost_factor = 12;


// Given userID and password, update hash in database with the new password hash.
async function update_hash(userID, password) {  // Sequenced Async to function caller
    try {
        // Create the hash, insert it into the database and return the result of the insertion
        return await db.update_hash(userID, await bcrypt.hash(password, cost_factor));
    } catch (err) {
        // Log the error, either to error logs or to logging service
        console.error(err);

        // If the hashing DB update_hash method failed, return error to function caller
        return err;
    }
}

// Given userID and password, update hash in database with the new password hash.
// Sequenced Async to function caller
const update_hash = async (userID, password) =>
    new Promise((resolve, reject) => {
        try {
            /*  Create the hash, insert it into the database and return the result of the insertion
                Note:    
                - db.update_hash method Verifys if user with 'userID' exists first in the background
                - Can potentially resolve with an error? If db.update_hash throws an error, will
                it be caught by the try catch block? since the await call is made in the resolve param.
            */
            return resolve(await db.update_hash(userID, await bcrypt.hash(password, cost_factor)));
        } catch (err) {
            // Log the error, either to error logs or to logging service
            console.error(err);

            // If the hashing DB update_hash method failed, return error to function caller
            return reject(err);
        }
    });



/*  Function verifies a given set of credentials to return a promise that
    Resolves with the user object if verified to be correct
    Rejects with 'ERR: Wrong password' if the password was invalid
    Rejects with error code from async function calls if either the DB or BCrypt action fails.
*/
const verify_credentials = async (userID, password) =>
    new Promise((resolve, reject) => {
        try {
            // Get the whole user object from the DB
            const user = await db.get_user(userID);
            // If the password is correct, return the user Object
            if (await bcrypt.compare(password, user.hash))
                return resolve(user);
            else
                return reject('ERR: Wrong password'); // Reject with error


            // Below is the old method, which only verifies if the password is correct
            // const hash_from_db = await db.get_hash(userID);
            // return await bcrypt.compare(password, hash_from_db);

            // Single line call of the above old method
            // return await bcrypt.compare(password, await db.get_hash(userID));
        } catch (err) {
            // If the database throws an error or if Bcrypt throws error when comparison fails

            // Log the error, either to log file or to logging service
            console.error(err);

            // Reject with the error
            return reject(err);
        }
    });


module.exports = {
    verify_credentials,
    update_hash
}