'use strict'; // Enforce use of strict verion of JavaScript

/*	@Doc
    Module to expose simple, straightforward pre-defined interfaces for accessing data in the DB
    
    @Todo
    - Decide on the structure of all the functions, like if they are Promise based.. / async/await basied
    - Build error handling into these functions
    - Fix the way username and password are passed to the DB to make connections
    - See if using a DBaaS for this service is better? Something like Azure?
*/

const mariadb = require('mariadb');
const { print, error } = require('../utils');

// Create the connection pool to the database
const pool = mariadb.createPool({
    host: 'mydb.com',
    user: 'myUser',
    password: 'myPassword',
    connectionLimit: 5
});

// Returns the password hash from the userDB with userID
const get_hash = (userID) => query_db(`select user from userDB with ${userID}`);

// Simple query_db method, not suited if many queries are executed at the same time
// Get a connection from pool, execute a query and release connection.
// Is pool.query a sync process? Does this need to be awaited?
const query_db = (query) => pool.query(query);

// Module exposed function to get a connection thread to the DB for multiple queries
const get_connection = async () => await pool.getConnection();

// Query function if you already have a connection thread
const query_db2 = async (conn, query) => await conn.query(query);


module.exports = {
    // Methods that deals with password hashes' CRUD operations
    get_hash,
    update_hash,

    // Methods to deal with reading user details
    get_user,
    create_user
}





/* Code below this block comment are example codes */

// Example on how multi query usage would be done
function query_db3(query) {
    let conn;
    let res;
    try {

        // Get a connection from the connection pool
        conn = await pool.getConnection();
        // Make a query with the connection and wait for the results
        res = await conn.query(query);

    } catch (err) {
        // To change error logging to log to central error event log
        error()
    } finally {
        // If connection successfully taken from the pool, end the connection to free up the resource
        if (conn)
            return conn.end();
        return res;
    }
}

async function asyncFunction() {
    let conn;
    try {
        // Get a connection from the connection pool
        conn = await pool.getConnection();
        // Make a query with the connection and wait for the results
        const rows = await conn.query("SELECT 1 as val");
        console.log(rows); //[ {val: 1}, meta: ... ]
        const res = await conn.query("INSERT INTO myTable value (?, ?)", [1, "mariadb"]);
        console.log(res); // { affectedRows: 1, insertId: 1, warningStatus: 0 }
    } catch (err) {
        // Let any errors bubble up
        throw err;
    } finally {
        // If connection successfully taken from the pool, end the connection to free up the resource
        if (conn)
            return conn.end();
    }
}