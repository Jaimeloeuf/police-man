# Police Man
This is a generic IAM (Identity and Access Management) micro-service that you can use in a plug and play manner with your existing backend micro-service architecture/solution.  
Allowing you to create your own standalone identity provider just like if using google/facebook/github as identity providers.


## For Identity management
- This service handles all user logins/authentications and token provisioning.
- For demo purposes, the "db" used is a self built in memory key-value store.
- You can rewrite the db module to use connect to any type of database as the user Identity database
- An example for connecting to a MariaDB instance is given too in the DB directory
- Suggested attributes in the "users" table
    - userID (username or their "email")
    - password
    - salt (If assuming BCrypt is used, the salt is together with the password)
    - user_state (active/deactivated/deleted)
    - Access rights / User roles
    
    
## For Access management
- This service handles all of the user's Access rights.
- This service acts as the single source of truth about the user's roles.
- Defines what each role is allowed, its access resource rights and everything.


## Design considerations

### Why email isn't used as the username
Because of privacy reasons, every email can have a username attached to it and that username is changeable, but not the email.  
User can only log in with their username. This prevents people from logging in with email addresses if other sites are hacked.  
Email can be used as the "username" or userID because this app is designed for use with the end user.
So assuming the db is hacked, you cant really hide the email...  

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


## Future features
- MFA (Multi-Factor Authentication)
	- Starting with SMS based 2FA
	- Token based 2FA
- When user logged out for some time, or location is different from the usual location, ask the user to do a 2FA before giving access.
- Delete user account action
	- By removing all user data and blacklisting the email.
	- The row in the userDB should not be deleted, but marked as (deleted) for account status attribute.
	- The associated data stored in the other userDB's should be deleted with the eventually consistence principle.