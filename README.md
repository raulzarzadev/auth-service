# Micro servicio de login de usuarios

## nodejs - express - nodemailer - docker

Este servicio permite administrar de forma segura la creacion y de ususarios.

## Incluye:

- Signup
- Signin
- RecoverPassword

## Diseño

Esta basado en una autenticacion agíl de dos pasos.

### Sign up

1. Ingresa email
2. Recibe link en email
3. Ingresa la contraseña
4. Recibe un token

### Sing in

1. Ingresa email y contraseña
2. Recibe un token

### Forgot password

1. Ingresa email
2. Recibe link en email
3. Ingresa contraseña e email
4. Recibe token

# Variables de entorno

MONGO_NDB

MAIN_DOMAIN

SIGNUP_PORT

JWT_SECRET_TEXT

EMAIL_PASSWORD
EMAIL_USER

## Pendientes

1. Refresh token
2. Modulizar el envio de emails
3. Delete and update user

### Gracias por ser parte de este proyecto. 