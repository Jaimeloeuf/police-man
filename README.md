# README for Auth/User_accs service

- This service handles all user logins/authentications and token provisioning.
- The database owned by this service is a SQL based, relational DB, e.g. MariaDB
- DB name is UserDB
- Attributes in the "users" table
    - userID (username or their "email")
    - password
    - salt
    - user_state



## Design considerations

### Why email isn't used as the username

Because of privacy reasons
So every email can have a username attached to it and that username is changeable

User can only log in with their username. This prevents people from logging in with email addresses if other sites are hacked

Email can be user as the "username" or userID because this app is designed for use with the end user.
So assuming the db is hacked, you cant really hide the email...

*email = username = userID

Info required for sign up:
- username (unique)
- email (unique)
- password (min. strength required)

After signup:
- A first login token link will be sent to the user's Email for user to visit
- Upon using the login token, user's account will be activated
- User will be redirected to the login page with a banner showing activation successful.

User account state:
- Active (Actively used)
- dormant (Sometime since last login / use)
- De-activated (Deleted data, but email still black listed for now, but username now free for others to use)


## Features to implement
- When the user have not logged in for some time, or the location is different, ask the user to do a 2FA for authentication purposes.
- Delete user account, by removing all data and blacklisting the email.  -->  The row in the userDB should not be deleted, however it should be marked as (deleted) for the status attribute