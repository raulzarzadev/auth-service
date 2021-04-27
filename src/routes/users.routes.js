const { Router } = require('express')
const isAuthenticated = require('../authenticatons/jwt.authentication')
const router = Router()

const {
  getUser,
  sigupMail,
  confirmEmail,
  signIn,
  forgotPassword,
  recoverPassword,
  deleteUser,
  updateUser
} = require('../controllers/users.controller')

// TODO POdemos implementar varios metods en las mismas rutas para reducir las rutas

router.route('/:id')
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
  .post(recoverPassword)

module.exports = router
