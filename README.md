# Police Man
This is a standalone IAM (Identity and Access Management) microservice, built to easily integrate into your existing backend microservice architecture/solution so you don't have to think about building your own IAM solution, which is tedious and difficult.  
This allows you to be your own standalone identity provider just like using google/facebook/github as identity providers for social logins, except that now you are no longer dependant on other platforms and infrastructure for your user's identity.  
This Backend microservice is API based, designed only for providing Identity and Access management of user accounts over its API.  
This project is open source and available free of charge to use, but hopefully will be offering a freemium service after first stable major release is out!  
View the current status/progress of the project below in section "Current Progress / News"


## Table of Contents
- [Current progress and news](#Current-progress-and-News)
- [Stakeholders of this Service](#service-stakeholder-definitions)
- [Definitions for the components in this IAM](#IAM-Definition)
- [Data storage and schema](#Data-storage-and-schema)
- [Design notes and considerations](#Design-notes-and-considerations)
- [Q&A / F.A.Q section](#qa)
- [Repo layout](#repo-layout)
- [Going Forward](#going-forward)
- [License and Contributing](#License,-Author-and-Contributing)


## Current progress and News
Current state of the project:  pre-alpha
- Right now the Identity Management part is being implemented right now. It is the part where users can get signed Identity tokens in exchange for valid credentials, and using this access token they can then access other resources in your microservice cluster.
    - Expected date of completion (releasing as alpha stage): Mid 2020


## Service stakeholder definitions
This section defines the definition of the different stakeholders that will be interacting with this service.  
Like the type of users and what they can do with the service.

- Developer / Dev:
    - A "developer" is defined as the person who is creating the application
    - A developer is also referenced as the person who can build upon the API for their app
- User / Client:
    - A "user" is defined as a user of the developer's application
    - The app that users use, is defined as the "Client"
    - Clients can be Single page applications in browsers or Mobile apps, and they are able to communicate with the service via APIs
- Account Admin:
    - An "Account Admin" is defined as someone who has access to modify settings in the IAM but is not neccesarily a developer, although a developer is also an account admin.
- Organization
    - "Organization" is defined as either a company that collectively publishes application(s), or a group of people who have control over a set of applications.
    - Admin accounts can be grouped together by their organizations.

--------------------------------------------------
## IAM Definition
Definitions for "IAM and how this project treats this definition".  
Below are the 2 parts to this IAM story, Identity provisioning and Authorization/Access-management.

## Identity management
The sole purpose of Identity Managment is to:
- Store and manage your users' credentials tied to their User UUIDs.
- Act as the single source of truth for the user's credential and as the only valid identity token provider.
- Handle all user logins/authentications and token provisioning.
    - Return a signed token pair in exchange for valid user credentials.
    - Refresh token pair given a valid refresh token.
- Account management
    - Delete user accounts when requested
    - Update user accounts. Like update of passwords and/or user roles


## For Access management
The sole purpose of Access Management is to:
- Act as the single source of truth for the user's roles.
- Handles all of the user's Access rights.
    - CRUD operations on the User's access rights.
- Handle user object's state property
    - Maintain the state of either active/deactivated/deleted
    - Allow API caller to do CRUD operations on the state
- Defines every single role
    - What the role is allowed to do
    - Resource Access rights of each role

The configurations for access management can be viewed and modified through a web-portal (Admin Portal coming soon) for admin accounts.

--------------------------------------------------

## Data storage and schema
In this section we will talk about the database and storage choices for a service like this, and also discuss some F.A.Qs on this topic. Main focus of this is to explain the preferred choice of data storage of user creds and more.

- There are 2 datastores owned by this service. 1 for Identity management and 1 for access rights management.  
    - Note that I said Datastore and not Database. Because it means that there are 2 types of data that are stored but they can be stored on the same database. You can think of it as meaning 2 tables in a relational database.
- NoSQL is suggested as the choice of database, thanks to the abundance of NoSQL based DBaaS that offer great scalibility and ease of use for developers.
- However if your business model requires you to use SQL/Relational-Databases for whatever reasons, it's fine too. In fact it is really simple to replace the NoSQL DB connector with a SQL DB connector. You can refer to the current DB connector and simply rewrite it in SQL with any of your preferred SQL DB connector. Watch this repo, as I will be writing out an example SQL connector for reference in the future.

### Access management, role and action definitions Datastore/Document
- Access management owns a datastore, to store the defitintions of every single type of user-role/user-group.  
- Data is modified by API calls made from the web-portal

### User Datastore/Document
- Identity management owns the user datastore, to store the user Objects.  
- The database for this service only deals with the Users'
    - unique Identifier or a "userID" (username or their "email")
        - Email, however is not suggested because if DB is ever hacked, all the emails are exposed and can be used for things like spam which can damage the reputation of your brand. Even a simple hash of the emails is more preferable.
    - corresponding credential hash and salt
        - Assuming if BCrypt is used, the salt is together with the password, thus there will be no need for a salt attribute
    - Access rights (a.k.a roles in your application) (an array of enumerated values of roles and permissions assigned to the user)
    - Account usage statistics, these details are available to Developer or Account Admins to view. Details include:
        - account_status
            - An Enum of either active, archived or deleted
        - created_at
            - timestamp for when the user account is created
        - created_by
            - The service or whatever thing that created the account through the API
            - This value will be either the ID of an Account Admin or a Machine/Service ID
        - last_login
            - timestamp of the last successful login by the user
        - last_login_attempt
            - timestamp of last login attempt by the user regardless if the attempt is successful or not
            - If the last login attempt is successful, then this value should be the same as "last_login"

To deal with allowing users to use one account and still access multiple different apps offered by your organization. Every single application is a role. Example, users can use both "my_app" and "his_app", you just give user's a role depending on which app they use and the permission within that app. So if both my_app and his_app are used, then the user will have 2 groups of roles.

To keep the database clean and the schema relatively flat. There should not be too much nesting. Instead of nesting application specific roles as an array that is binded to the application as a role and storing the full name of the role every single time, we should store an enumerated item representing all the roles.
So like create an enum of possible roles, and then store the enumerate value in the user DB so that the user DB is really flat and simple. And this also have added security benefits too, if the user DB is hacked, you cant't tell which user has what role, because all of the enumerated values are stored in the roles database instead. And since these are 2 seperate databases, there is an added layer of security.

Below is an example on how the "User datastore (Key Value pair document based storage form)" will look like:
```js
{
    user_UID : {
        user_UID: "",
        credential_hash: "",
        roles: ["my_app:admin", "his_app:user"],

        account_status: "enum of either active/archive/deleted",
        created_at: "1559347200",
        created_by: "john_the_admin@your_app.com",
        last_login_attempt: "1559380000",
        last_login: "1559380000",
   }
}
```
Legend:
- user_UID
    - This must be an **unique identifier** for every single user that MUST be unique in the whole datastore. Generally speaking each organization gets 1 set of datastore, but they can choose to create more.
    - "user_UID" is used as the key for user objects
- credential_hash
    - This is the hash of the user's password. There can be an additional attribute for the salt used for the hash, but since BCrypt is used and BCrypt stores the hash and salt together, the additional attribute is not needed with this BCrypt implementation.
- roles
    - This is an array of roles that is assigned to this user account.
    - As mentioned above, this is kept as flat as possible with the elements in this array being enumerated values too.


### Database/Datastore notes
- Hash used for credentials
    - Currently the BCrypt algorithm is being used for password hashing, but you can easily rewrite it to use other hashing algorithm such as Argon2 or Scrypt. Currently using BCrypt because it is one of the most popular algorithm with wide support.
- To keep the persisted state clean and lean. Nothing else is included, not even other user details.
    - Because this service is purely for identity matching and token provisioning, application specific user details should be handled seperately by a "user service" that does application specific user details management in your application's microservice architecture. Thus the police man service WILL NOT store any application specific user state for you.
    - It is important to note that this Auth service is, and has to be independant from the rest of your services.
- Client services or client code calling API of this service must make sure that they have a unique and valid user ID.  
    - If it is a new user, then another service like a user service should deal with account creation first, this service only deals with auth and credentials. You need to have a UID to use the identity management.
    - If your app accepts anonymous users you may encounter a problem on how to uniquely identify this user.
        - In this case it is most likely that you have an app, and that app allows users to use and store data without needing to create an account. To deal with this situation, you would still need to be able to uniquely identify this user in order to provide Access management.
        - To do so, you should either generate 2 true random strings to use as their UID and password, or take a System value like IMEI that is unique to the mobile app user. You should then create an account for that user using that unique identifier and store that UID on the user's device too. So everytime you want to get a token for this user, send the UID & password to the service for a token. Thus achieving a Identity for the anonymous user.
        - Once the user decides to create an account, you can use the previously used Credentials to update the service with new credentials that are created by the user or your user service.
- What about new users?? How do they create an account?
    - Since we assume that all communication with policeman about user accounts have a Unique ID already, the datastore only deals with userID and the corresponding credentials. As mentioned in the previous point, creation of users needs to be dealt by your user service. You only send the user details over to police-man to create an identity for this user that you can trust.

--------------------------------------------------

## Design notes and considerations
This section will be dedicated to questions and answers about the design choices made in building this IAM and also what are some of the considerations for both users of this service and those who wish to extend this service.
### Why email is not suggested to be used as the user_ID
- Although every user most likely will have a unique email in most cases, it is not suggested to be used as such due to reasons concerning privacy and security.
- For security reasons, if a user uses the same set of email and password combination across many different sites and if one of them is hacked, the attacker can very easily use the stolen credentials to log in to your site.
- Also, assuming the worse case attack and failure scenario, if an attacker manage to hack the Database of this service and gain read access, they would be able to see all email address in plain text. Even if they can't access the credential pair, they would be able to take all the email to sell for spamming purposes, invading the user's privacy.
- Thus instead of using the email address of the user as the unique "user_ID", a suggested way is the use a unique username set by the user, and make login only available through usernames and not email addresses.

A identity is essentially a user account tied to a single user, or at least tied to a single unique user_ID.

### Info required for sign up:
- username (unique)
    - Username if present can be used by your app to present it as the user_ID of your user's account/identity.
- email (unique)
    - Email is needed for things like password resets and user account creation confirmation's
    - In the future, there would most likely be an API available for you to do 2FA with the user's Email address.
- password (min. strength required)
    - Although the police-man service itself does not enforce any hard/specific password strength requirement, it is recommended that your application enforces such a requirement for security purposes.

### Signup flow
After signup:
- A first login token link will be sent to the user's Email for user to visit
- Upon using the login token, user's account will be activated
- User will be redirected to the login page with a banner showing activation successful.

### Why is "account_status" attribute needed in the user datastore
The "Account status" attribute is needed or at least recommended to be used because it helps in things like preventing duplicate usernames creations and also malicious account takeovers.  
For example if your application only allow one user per email address, it would be unwise to delete the user account from the Identity service. Because if the another user tries to create a new account with the same email address, you would not be able to tell if it was the same user, or if the email has ever been used before in the past for account creation!  
Suggested User account status to be one of a few enumerations, examples would be:
- Active
    - Means that the account is being actively used
- Archived
    - It means user account is "de-activated" but with the possiblity of being re-activated again
- De-activated
    - User data in the your application's user service is deleted, but the identity account is still left in the DB to blacklist both the user_ID and the email used for account creation.
    - You should can choose not to have this field and allow users to freely re-use email addresses and user_IDs but its up to your own application's specific needs and expectations.

--------------------------------------------------

## Q&A
- Assuming that there are different roles for Client type and for Service type requests. How will the services create and use an account? Since they are fully automated?  
    - (A) You can create the accounts for M2M communication in the web portal and generate secret keys which you can then put in a file for deployment.  
    - (Follow-up) Is there a better way to do this? Such as secret key management API? Like a service/container that only deals with secret key management.

--------------------------------------------------

## Repo layout
Layout of this repo with descriptions to easily navigate through the code.  
Since this is a Express JS server app implementation, it follows some conventions from the community too.  

- src (All source files are placed in this directory)
    - db/ (Connectors and other code for interfacing with the database)
    - middleware/ (Middlewares used for the Express JS app, refactored out to make it more granular)
    - routes/ (Routes of the app, seperated out to keep the server file clean)
    - index.js (Main server app, with middleware + routes mounting and some miscellaneous routes/middlewares defined)
    - auth.js (Module for verifying user credentials against those in the DB)
    - config.js (Executable Configuration file for the server app)
    - hash.js (Simplified / Stripped down hash functions needed)
    - token.js (Wraps over jwt module to inject default sign and verify values)
    - utils.js (Utility functions modularised for repeated uses)
- test (All tests placed here. Only tests for police-man as a whole like integration tests)
- archived (Archived files, still kept for referencing only)

--------------------------------------------------

## Going Forward
Currently since this project is in pre-alpha stage, the focus will be building out the MvP. The MVP aims to provide Identity management and stateless authentication. MVP includes:
- JWT provisioning in exchange for valid user credentials.
- Either write client SDKs for communicating with the service or use a IDL like apigee/RAML for HTTP APIs to auto generate client code.
    - gRPC can also be considered for easy client stubs generation from their protobuf definition files.

### Backlog for Future features
- Implement rate limiting for the APIs to prevent DDoS. And perhaps secure for the /ping endpoint.
- MFA (Multi-Factor Authentication)
	- Give users option to connect their own service for MFA or use Token based 2FA generation through shared keys.
- When user logged out for some time, or location is different from the usual location, ask the user to do a 2FA before giving access.
- Delete user account action
	- By removing all user data and blacklisting the email.
	- The row in the userDB should not be deleted, but marked as (deleted) for account status attribute.
	- The associated data stored in the other userDB's should be deleted with the eventually consistence principle.
- Create polyglot version of this project. Re-write in:
    - Go
    - Elixir
    - Scala
    - Clojure
- Create a logging side car. This sidecar will provide RPC to the main code to send stuff to log, then we can configure how the logging works for each individual logging sidecar.

--------------------------------------------------

## License, Author and Contributing
This project is developed under the "BSD 3-Clause License"  
Feel free to use this project as you see fit and do contribute your changes too!  
If you have any questions feel free to contact me via [email](mailto:jaimeloeuf@gmail.com) as I know that although this is a lengthy README, it might still lack some details and can be confusing too.  
2019 - [Jaime Loeuf](https://github.com/Jaimeloeuf)