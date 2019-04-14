'use strict'; // Enforce use of strict verion of JavaScript

/*	@Doc
    Fake demo DB implementation
    Module that exposes interface to interact with a fake demo in memory Database
    
    @Todo
    - Make userID to use email instead
*/

const hash = require('../hash');
const { print } = require('../utils');

// User DB will be a object, to simulate a key-value pair store or Document DB
const userDB = {
    // Jaime: {
    //     userID: 'Jaime',
    //     hash: 'uoouoio' // Assuming hash is a BCrypt hash with salt built into the hash
    // }
};

// Get user object given a userID
function get_user(userID) {
    return new Promise((resolve, reject) => {
        if (userDB[userID])
            return resolve(userDB[userID]);
        else {
            // If user does not exist, create an error object and reject with it
            const err = new Error('User does not exist');
            err.code = 404;
            return reject(err);
        }
    });
}

// Inserts new user object into the database
function new_user(user) {
    return new Promise(async (resolve, reject) => {
        /* Perhaps check for email too instead of user ID */

        // Check if the user with user.userID currently exists or not.
        if (userDB[user.userID])
            return reject(new Error('User already exists'));

        // Create the hash of the user object
        user.hash = await hash(user.password);
        // Remove the password from the user object
        delete user.password;

        // Insert user object into the database as value of the userID key
        userDB[user.userID] = user;

        // Log it out as a debug
        console.log(userDB);

        return resolve(); // Resolves without anything to end the Promise.
    });
}

function update_hash(userID, password) {
    return new Promise(async (resolve, reject) => {
        try {
            // If user with userID does not exists, throw error
            if (!userDB[userID]) {
                const err = new Error('User does not exist');
                err.code = 404;
                return reject(err);
            }

            // Create and insert new hash into the database
            userDB[userID].hash = await hash(password);

            // Log it out as a debug
            console.log(userDB);

            return resolve(true); // Resolves with True to indicate success
        } catch (err) {
            return reject(err);
        }
    });
}


module.exports = {
    get_user,
    new_user,
    update_hash
}