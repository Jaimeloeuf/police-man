'use strict'; // Enforce use of strict verion of JavaScript

/*	@Doc
	Config.js is a Module used to create and export configuration variables,
	and allow users to use variables read from the envrionmental variables.
*/

// See if any additional acceptable environmental variables injected, Overwrite existing defaults if available.
module.exports.port = process.env.port || 80;