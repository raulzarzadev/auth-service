import formatResponse from '../helpers/formatResponse'
import {
  JWTverify,
  JWTgenerate,
  JWTIsClean,
  JWTVerifyAndInvalidate
} from '../helpers/JWTutils'
import sendEmail from '../helpers/sendEmail'
import ActiveSession from '../models/ActiveSession'
import User from '../models/User'

export const user = () => {
  console.log('user')
}

/* .-°'*,.-°'*,.-°'*,.-°'*,.-°'*,.-°'*,.-°'*, */
/*           SIGNUP            */
/* .-°'*,.-°'*,.-°'*,.-°'*,.-°'*,.-°'*,.-°'rz */

export const signup = async (req, res) => {
  const { email } = req.body
  console.log('req.body', req.body)

  const { host } = req.headers
  if (!email) return res.json(formatResponse(200, 'EMAIL_EMPTY'))
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
    link: `https://${host}/signup/${token}`,
    title: 'Concluir Registro'
  })

  // not exist or is not active
  return res.json(formatResponse(200, 'EMAIL_SENT'))
  // send email with token
}

/* .-°'*,.-°'*,.-°'*,.-°'*,.-°'*,.-°'*,.-°'*, */
/*           CONFIRM SIGN UP             */
/* .-°'*,.-°'*,.-°'*,.-°'*,.-°'*,.-°'*,.-°'rz */

export const confirm = async (req, res) => {
  const { token } = req.params
  const { password } = req.body

  console.log('token,password', token, password)

  const { isValid, isClean, payload } = await JWTVerifyAndInvalidate(token)

  if (!isValid || !isClean) {
    console.log('invalido')

    return res.json(formatResponse(200, 'TOKEN_INVALID'))
  }
  // resive email, token and pass and update user {email, password , active=true}
  // set pass to user
  const user = await User.findOne({ email: payload?.email })

  const newPassword = await user.encryptPassword(password)
  await User.findByIdAndUpdate(user._id, {
    email: payload?.email,
    password: newPassword,
    active: true
  })
  /*   await User.updateOne({
    email: payload?.email,
    password: newPassword,
    active: true
  }) */
  // send signin-token
  return res.json(formatResponse(200, 'PASSWORD_UPDATED'))
}
/* .-°'*,.-°'*,.-°'*,.-°'*,.-°'*,.-°'*,.-°'*, */
/*           SIGN IN            */
/* .-°'*,.-°'*,.-°'*,.-°'*,.-°'*,.-°'*,.-°'rz */

export const singin = async (req, res) => {
  const { email, password } = req.body
  console.log('email, password', email, password)

  // user and password match
  const user = await User.findOne({ email })
  const match = user.active && (await user.matchPassword(password))

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
/* .-°'*,.-°'*,.-°'*,.-°'*,.-°'*,.-°'*,.-°'*, */
/*           SIGN OUT            */
/* .-°'*,.-°'*,.-°'*,.-°'*,.-°'*,.-°'*,.-°'rz */

export const signout = async (req, res) => {
  const { authorization } = req.headers

  const { isValid, isClean, payload } = await JWTVerifyAndInvalidate(
    authorization
  )
  if (!isValid || !isClean) {
    return res.json(formatResponse(200, 'TOKEN_INVALID'))
  }
  console.log('isValid, isClean, payload', isValid, isClean, payload)
  await ActiveSession.findByIdAndRemove(payload?.session)
  return res.json(formatResponse(200, 'SIGNOUT_OK'))
}

/* .-°'*,.-°'*,.-°'*,.-°'*,.-°'*,.-°'*,.-°'*, */
/*           RECOVER PASS            */
/* .-°'*,.-°'*,.-°'*,.-°'*,.-°'*,.-°'*,.-°'rz */

export const recoverpass = async (req, res) => {
  const { email } = req.body
  const token = JWTgenerate({ email })
  if (!email) return formatResponse(200, 'EMAIL_EMPTY')
  // resive email

  // find user
  const user = await User.findOne({ email, active: true })

  // user NOT exist or is NOT active
  if (!user) return res.json(formatResponse(200, 'EMAIL_SENT*'))
  console.log('recover token', token)

  // send email whit token
  sendEmail({
    to: email,
    subject: 'Recover Password',
    link: `https://localhost:3015/recover/${token}`,
    title: 'Recuperando Contraseña'
  })
  res.json(formatResponse(200, 'EMAIL_SENT'))
}

/* .-°'*,.-°'*,.-°'*,.-°'*,.-°'*,.-°'*,.-°'*, */
/*           CONFIRM RECOVER            */
/* .-°'*,.-°'*,.-°'*,.-°'*,.-°'*,.-°'*,.-°'rz */

export const confirmrecover = async (req, res) => {
  const { token } = req.params
  const { password } = req.body
  // verifica token
  const { isValid, isClean, payload } = await JWTVerifyAndInvalidate(token)

  if (!isValid || !isClean) {
    return res.json(formatResponse(200, 'ERROR'))
  }
  const user = await User.findOne(
    { email: payload.email },
    { email: 1, active: 1, password: 1 }
  )
  const newPassword = await user.encryptPassword(password)
  // update password
  await User.findOneAndUpdate({ email: user.email }, { password: newPassword })
  // send session token
  const newToken = JWTgenerate({ email: user.email })
  return res.json(formatResponse(200, 'PASSWORD_UPDATED', { token: newToken }))
}

/* .-°'*,.-°'*,.-°'*,.-°'*,.-°'*,.-°'*,.-°'*, */
/*           VERIFY SESSION            */
/* .-°'*,.-°'*,.-°'*,.-°'*,.-°'*,.-°'*,.-°'rz */

export const isSessionActive = async (req, res) => {
  const { authorization } = req.headers
  const { authtoken } = req.body
  const { isValid, isClean } = await JWTVerifyAndInvalidate(
    authorization || authtoken,
    { invalidateToken: false }
  )

  if (isValid && isClean) {
    return res.json(formatResponse(200, 'SESSION_ACTIVE'))
  } else {
    return res.json(formatResponse(401, 'SESSION_NOT_ACTIVE'))
  }
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
