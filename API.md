# List of APIs for this app
The APIs are organized by HTTP request methods.


## Advice on how to use and host these endpoints
- These APIs should be versioned, to prevent breaking changes. But this should not be that big an issue if your app is web-app based or if this is used API is depended by other services, because that can be easily updated compared to a mobile phone app.
- It is adviced that all endpoints for this service be served with "/api/" prepended to it, or hosted under the api.example.com subdomain of your website.


## Exposed APIs endpoints
- Authenticate that a user's credential is correct against credentials stored in the database
- (First sign on, give both JWT and refresh token) Get a token with a given set of credentials. JWT is used to prove his/her identity and access private data in other services and a refresh token to get a new JWT from another endpoint
- POST valid refresh token to get a new JWT / refresh-token pair


## GET
/user/:userID
- Endpoint with userID as part of the URL.
- To obtain user information related to the user with the given userID


## POST
/login
- POST login credentials here to get a token after successful authentication

/token
- POST credentials to get a token if valid.
- This is route is special because it is not for direct client access.
- It should be used for service requests. So other service should call to this route if they would like to obtain a token.

/token/refresh
- POST refresh tokens here to get back a new token/refresh-token pair if given refresh is valid.


## PUT
- Update password


## DELETE
- Delete user account from the system.
    - Note that this deletes the user's credential from the IAM system/database.
    - It does not remove all user information that is stored in the other microservices.