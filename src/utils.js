'use strict'; // Enforce use of strict verion of JavaScript

/*	@Doc
	Utilies module.
*/

/* Utility function bindings */
module.exports.print = console.log;
module.exports.write = process.stdout.write;

// Wrapper function over JSON.stringify to catch potential errors with a try/catch block
module.exports.JSON_string = function (object) {
    try {
        return JSON.stringify(object);
    } catch (err) { console.error(err); } // Log errors if any and continue
}

// Curried function for custom error logger
module.exports.JSON_string2 = (error_log) => (object) => {
    try {
        return JSON.stringify(object);
    } catch (err) {
        // Log errors if any with the given error logger
        error_log(err);
    }
}