# AUTH service rz

**Signup, signin and verify sessions for your app**

_You can get a compy or make a fork but do not forget the star_

    git clone git@github.com:raulzarzadev/signupUserService.git
    cd signupUserService/
    yarn install
    yarn dev

## This project include this and some other packages

nodejs - express - nodemailer - docker - prettier - eslint

## Variables de entorno

    MONGO_NDB
    SIGNUP_PORT
    JWT_SECRET_TEXT
    EMAIL_PASSWORD
    EMAIL_USER

# Usage

Send an email to start signup process

        POST /signup
            body: { email }

Send a new password whit the token in the email as param to confirm sigup 

        POST /signup/:token
            body:{ password }

Send the correct credetials to recive a session token
        
        POST /signin
            body:{ email, password }

Send a email for to restart your password

        POST /recover
            body: { email }

Send a new password with the token did you recive in the las email as param

        POST /recover/:token
            body:{ password }

Use token in authorization header for to validate your session or close it 

        POST /signout
            headers: { authorization: token }


        POST /session
            headers: { authorization: token }

To manage session you just going to recive  a JSON 

        {
          "status": 200,
          "type": "SESSION_VALID"
        }

        or 

        {
          "status": 401,
          "type": "SESSION_INVALID"
        }