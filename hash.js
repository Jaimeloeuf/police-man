'use strict'; // Enforce use of strict verion of JavaScript

/*  @Doc
    This module exports common hash functions for my needs build on top of the bcryptjs package.
    Reason for this is because of an error caused by circular import caused dependency issue
    between the auth and db module, making it impossible for the db module to load properly.

    Purpose is to load a per-defined cost_factor number into the closure of the hash method
*/

// const bcrypt = require('bcryptjs');
const { hash } = require('bcryptjs');


/*  Cost factor variable - number of rounds used to generate the salt.
    Cost factor should be different for normal users VS admins.
    Admins cost factor should be around 14
    @Todo read from elsewhere and not pre-defined
*/
const cost_factor = 12;

const bcrypt_hash = (cost_factor) => (password) => hash(password, cost_factor);
// Partially apply the cost factor into the function
module.exports = bcrypt_hash(12);

// Partially apply the cost factor into the function
// module.exports = ((cost_factor) => (password) => hash(password, cost_factor))(12);