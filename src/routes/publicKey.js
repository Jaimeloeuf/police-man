'use strict'; // Enforce use of strict verion of JavaScript

/*	@Doc
    API routes for publicKey
    All routes here should be mounted on Root URL "/"
    
    @Todo
    - Perhaps implement method to cache the public Key
*/

const router = require('express').Router();
const { getPublicKey } = require('../token');


// Route to get public key for verifying JWTs signed by complimenting private key.
// Might move the key storage to a centralized publicKey store in the future
router.get('/public-key', (req, res) => res.end(getPublicKey()));


module.exports = router;