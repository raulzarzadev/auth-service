import { content, htmlContent, subject } from "../EMAIL'S/signup"
import formatResponse from '../helpers/formatResponse'
import {
  JWTverify,
  JWTgenerate,
  JWTIsClean,
  JWTInvalidate,
  JWTVerifyAndInvalidate
} from '../helpers/JWTutils'
import sendEmail from '../helpers/sendEmail'
import ActiveSession from '../models/ActiveSession'
import InvalidToken from '../models/InvalidToken'
import User from '../models/User'

export const user = () => {
  console.log('user')
}
export const signup = async (req, res) => {
  const { email } = req.body
  // find user
  const user = await User.findOne({ email }, { active: 1, _id: 1 })
  // if not exist ,  create user {email, active=flase}

  if (!user) {
    const newUser = new User({ email, active: false })
    newUser.save()
  }
  if (user?.active) {
    // if exist and is actve
    return res.json(
      formatResponse(200, 'SIGNUP_FAIL', 'This email already active')
    )
  }

  const payload = { email }
  const token = JWTgenerate(payload, 0.1)
  console.log('token', token)

  sendEmail({
    to: email,
    subject: 'Solicitud de Registr0',
    link: `https://localhost:3015/signup/${token}`,
    title: 'Concluir Registro'
  })

  // not exist or is not active
  res.json(formatResponse(200, 'EMAIL_SENT'))
  // send email with token
}

export const confirm = async (req, res) => {
  const { token } = req.params
  const { password } = req.body
  const { isValid, isClean, payload } = await JWTVerifyAndInvalidate(token)

  if (!isValid || !isClean) return res.json(formatResponse(200, 'TOKEN_INVALID'))
  // resive email, token and pass and update user {email, password , active=true}
  // set pass to user
  const user = await User.findOne({ email: payload?.email })

  const newPassword = await user.encryptPassword(password)
  await User.updateOne({
    email: payload?.email,
    password: newPassword,
    active: true
  })
  // send signin-token
  res.json(formatResponse(200, 'PASSWORD_UPDATED'))
}

export const singin = async (req, res) => {
  const { email, password } = req.body
  // user and password match
  const user = await User.findOne({ email })
  const match = await user.matchPassword(password)
  // if NOT match
  if (!match) {
    return res.json(formatResponse(200, 'SIGNIN_FAIL'))
  }
  const expireInHours = (hours) => {
    const currentTime = new Date().getTime()
    const expireIn = hours * 1000 * 60 * 60
    return currentTime + expireIn // hour * ms
  }
  // close other sessions
  await ActiveSession.findOneAndRemove({ email })
  const newSession = new ActiveSession({
    email,
    expire_at: expireInHours(24)
  })
  // send session to activeSession
  await newSession.save()
  // send new token
  const newToken = JWTgenerate({ email, session: newSession._id })
  res.json(formatResponse(200, 'SIGNIN_OK', { token: newToken }))
}

export const signout = async (req, res) => {
  const { authorization } = req.headers

  const { isValid, isClean, payload } = await JWTVerifyAndInvalidate(
    authorization
  )
  if (!isValid || !isClean) return res.json(formatResponse(200, 'TOKEN_INVALID'))
  console.log('isValid, isClean, payload', isValid, isClean, payload)
  await ActiveSession.findByIdAndRemove(payload?.session)
  return res.json(formatResponse(200, 'SIGNOUT_OK'))

  /*   const tokenValidated = await JWTverify(authorization || token)
  const tokenIsClean = await JWTIsClean(authorization || token)
  console.log('token', token) */

  // resive token, validate sesion
  /* if (!tokenIsClean || !tokenValidated.isValid) {
    return res.json(formatResponse(200, 'ERROR'))
  }
  // remove session
  const sessionId = tokenValidated?.payload?.session
  if (sessionId) await ActiveSession.findByIdAndRemove(sessionId)
  res.json(formatResponse(200, 'SIGNOUT_OK')) */
}

export const recoverpass = async (req, res) => {
  const { email } = req.body
  const token = JWTgenerate({ email })

  // find user
  const user = await User.findOne({ email, active: true })

  // user NOT exist or is NOT active
  if (!user) return res.json(formatResponse(200, 'EMAIL_SENT*'))
  console.log('recover token', token)

  sendEmail({
    to: email,
    subject: 'Recover Password',
    link: `https://localhost:3015/recover/${token}`,
    title: 'Recuperando Contraseña'
  })
  res.json(formatResponse(200, 'EMAIL_SENT'))

  // resive email
  // send email whit token
}
export const confirmrecover = async (req, res) => {
  const { token } = req.params
  const { password } = req.body
  // verifica token
  const { isValid, isClean, payload } = await JWTVerifyAndInvalidate(token)
  console.log('isValid, isClean', isValid, isClean, payload)

  if (!isValid || !isClean) {
    return res.json(formatResponse(200, 'ERROR'))
  }
  const user = await User.findOne(
    { email: payload.email },
    { email: 1, active: 1, password: 1 }
  )
  const newPassword = await user.encryptPassword(password)
  await User.findOneAndUpdate({ email: user.email }, { password: newPassword })
  const newToken = JWTgenerate({ email: user.email })
  return res.json(formatResponse(200, 'PASSWORD_UPDATED', { token: newToken }))

  // update password

  // send session token
}

export const update = (req, res) => {
  const { token } = req.params
  console.log('token', token)
  console.log('update')
}

export const deleteuser = (req, res) => {
  const { token } = req.params
  console.log('token', token)
  console.log('delete')
}
