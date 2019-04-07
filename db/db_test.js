const db = require('./db2');

// Function binding
const print = console.log;

// Should pass and return a user object
db.get_user('user1')
    .then(print)
    .catch(print);

// This should fail and print an error message
db.get_user('user10')
    .then(print)
    .catch(print);