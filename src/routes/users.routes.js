const { Router } = require('express')
const {
  signup,
  user,
  update,
  deleteuser,
  confirm,
  singin,
  signout,
  recoverpass,
  confirmrecover,
  isSessionActive
} = require('../controllers/users.controller')
const router = Router()

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

router.route('/session')
  .post(isSessionActive)

router.route('/:token')
  .get(user)
  .put(update)
  .delete(deleteuser)

module.exports = router
