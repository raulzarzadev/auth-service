import JWT from 'jsonwebtoken'
import InvalidToken from '../models/InvalidToken'
const JWT_SECRET = process.env.JWT_SECRET_TEXT

export const JWTverify = async (token) => {
  try {
    const res = JWT.verify(token, JWT_SECRET)
    return { isValid: true, payload: res }
  } catch (error) {
    return { isValid: false }
  }
}

export const JWTgenerate = (payload = {}, expireInHrs = 24) => {
  return JWT.sign(payload, JWT_SECRET, {
    expiresIn: 60 * 60 * expireInHrs // expires in 24 hours
  })
}

export const JWTIsClean = async (token) => {
  const tokenExistInBlacklist = await InvalidToken.findOne({ token })
  // if exist in invalid token list is dirty
  return !tokenExistInBlacklist
}

export const JWTInvalidate = async (token) => {
  const newInvalidToken = new InvalidToken({ token })
  await newInvalidToken.save()
  return 'INVALID_TOKE_SAVED'
}

export const JWTVerifyAndInvalidate = async (token) => {
  const tokenValidated = await JWTverify(token)

  const tokenIsClean = await JWTIsClean(token)

  await JWTInvalidate(token)
  const payload = tokenValidated.payload
  const isValid = !!tokenValidated.isValid
  const isClean = !!tokenIsClean

  return { isValid, isClean, payload }
}
