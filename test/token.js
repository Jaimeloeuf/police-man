'use strict'; // Enforce use of strict verion of JavaScript

/*	@Doc Module description:
    Unit test for the tokens module's create/read/sign/verify operations on a given token

    @TODO
	- look into private Keys and stuff like Asymmetric signing and verifying
    - Do a load testing
*/

// Destructure the methods out from the module for testing
const { verify_token, create_token } = require('../token');
const assert = require('assert');
// Shorthand utility binding
const print = console.log;


/*  Req object mimicking req objects before being processed by the create_token method.
    Before user have a JWT, and they just posted their credentials for a JWT */
const req = {
    // Mock user object as payload for testing purposes
    token: {
        id: 1,
        username: 'brad',
        email: 'brad@gmail.com',
        role: 'user'
    },
    res_headers: {}
}


function promise_version() {
    // Using the token module's API with Promises
    create_token(req.token)
        .then(token => {
            print(token);
            print(token.length);
            return token;
        })
        .then(verify_token)
        .then((token) => {
            print(token);
            print(token.role);
        })
        .catch(print);

    // Below's usage scenario is creating token and putting it in the header for client to use as a Cookie
    // createToken(req)
    //     .then(() => print(req))
    //     .then(() => print(req.res_headers['Set-Cookie'])) // Use a set_cookie function to pass in the things to be set
    //     .catch(print);
}


async function asyncawait_version() {
    // Using the token module's API with the Async/Await keywords
    try {
        const token = await create_token(req.token);
        print(token);
        print(token.length);
        const decoded_token = await verify_token(token);
        print(decoded_token);
        print(decoded_token.role);

        it('Decoded token matches original token', () => {
            assert.strictEqual(token, decoded_token);
        });
        it('Signature verification process works correctly', () => {
            assert.strictEqual()
            // Test that the decoded token is received and also the wrong signature case is detected
        })
    } catch (err) {
        print(err);
    }
}

asyncawait_version();

// Below promise should reject with an error due to invalid signature, as the token's signature has been modified with the additional character
// verifier(token + 'a')
//     .then((token) => {
//         print(token);
//         print(token.role);
//     })
//     .catch(print);