'use strict'; // Enforce use of strict verion of JavaScript

/*	@Doc
	Main server app instance module.
	This module only holds misc. routes like ping and error handling routes like for 404.
*/

const express = require('express');
const app = express();

const { port } = require('./config');
const { print } = require('./utils');
const { getPublicKey } = require('./token');

// Finalhandler module to deal with responding back to the client and closing the connection


/* Mount all the routers from the route modules onto the Express app */
app.use('/user', require('./routes/user'));
app.use(require('./routes/tokens'));
app.use(require('./routes/reset_password'));


// Route to get public key for verifying JWTs signed by complimenting private key.
// Might move the key storage to a centralized publicKey store in the future
app.get('/public-key', (req, res) => res.end(getPublicKey()));

// Ping Route to check server status
app.get('/ping', (req, res) => {
	/*	Things to return to client
		- Current number of users in DB
		- Load of the server
	*/
    res.json({
        status: 200,
        // Current server response latency of the /ping request
        // latency: get_current_latency()
    });
});

// 404 route handler
app.use((req, res) => {
    // Log error either to error logs or to a logging service
    console.error(err.stack);
    res.status(404).send("Sorry can't find that!");
});

// 500 internal server error route handler
app.use((err, req, res) => {
    // Log error either to error logs or to a logging service
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(port, () => print(`Server listening to port ${port}`));