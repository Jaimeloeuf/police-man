# Style Guide

## General
- Always set JS to run in strict mode
- Always start by writing either the documentation, API or tests first before writing the code
- Always try to use functional programming constructs whenever possible.
    - Use pure functions wherever possible
    - Avoid state as much as possible
    - Avoid all shared state!
- Prefer arrow functions for cleaner and more concise syntax
- Never hard code anything. However when absolutely neccessary in mean time, always record it down as technical debt and plan a version for its replacement.

## Asynchronous code
- In order of preference while using async code:
    - Async/Await
    - Promises
    - Callbacks
- Try to use the Promisify method from the utils module to convert functions that takes a callback as the last arguement into a function that returns a Promise.

#### Async/Await
- Always use return on resolve and reject statements to end code execution when the Promise is resolved or rejected. Only allow code to continue running if there is a valid reason.
- Always wrap async/await codes in a try/catch block to catch any errors, unless absolutely sure that the Promise will never reject anything. However advised to always wrap it as a precaution.