const { Router } = require('express')
const isAuthenticated = require('../authenticatons/jwt.authentication')
const { signup, user, update, deleteuser, confirm, singin, signout, recoverpass, confirmrecover } = require('../controllers/users.controller')
const router = Router()

/* const {
  getUser,
  sigupMail,
  confirmEmail,
  signIn,
  forgotPassword,
  recoverPassword,
  deleteUser,
  updateUser
} = require('../controllers/users.controller') */

router.route('/signup')
  .post(signup)

router.route('/signup/:token')
  .post(confirm)

router.route('/signin')
  .post(singin)

router.route('/recover')
  .post(recoverpass)

router.route('/recover/:token')
  .post(confirmrecover)

router.route('/signout')
  .post(signout)

router.route('/:token')
  .get(user)
  .put(update)
  .delete(deleteuser)

// TODO POdemos implementar varios metods en las mismas rutas para reducir las rutas

/* router.route('/:id')
  .get(isAuthenticated, getUser)
  .delete(isAuthenticated, deleteUser)
  .put(isAuthenticated, updateUser)

router.route('/signup')
  .post(sigupMail)

router.route('/signup/:token')
  .post(confirmEmail)

router.route('/signin')
  .post(signIn)

router.route('/forgot-password')
  .post(forgotPassword)

router.route('/forgot-password/:token')
sword)
  .post(recoverPas */

module.exports = router
