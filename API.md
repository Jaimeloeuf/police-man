# List of APIs for this app

The APIs will be organized by HTTP request methods
All URLs will have, "/api/" prepended to it.
The "api" in the URLs will have a version attached to it.

    - Look into HTTP signing like what Amazon does, better than JWTs?

## Functions exposed to external users by the service (What the API users)  API endpoints
- An API endpoint to
    - Authenticate that a user's credential is correct
    - (FIrst sign on, give both JWT and refresh token) Get a token with a given set of credentials. JWT is used to prove his/her identity and access private data in other services and a refresh token to get a new JWT from another endpoint
    - Get a new JWT given a valid refresh token

## GET

/user/:userID
    Get the general stat of the user with :userID

## POST

/login
    API endpoint for posting login credentials to get a token after successful authentication
/token

## PUT

## DELETE