import type { JWTVerifyOptions } from 'jose'
import { jwtVerify, SignJWT } from 'jose'

interface SignOption {
  expiresIn: string
}

const DEFAULT_SIGN_OPTION: SignOption = {
  expiresIn: '2h',
}

export const signJwtToken = async (
  payload: Record<string, any>,
  options: SignOption = DEFAULT_SIGN_OPTION,
): Promise<string> => {
  const secretKey = new TextEncoder().encode(process.env.JWT_SECRET_KEY)
  const alg = 'HS256'
  const typ = 'JWT'

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg, typ })
    .setExpirationTime(options.expiresIn)
    .sign(secretKey)

  return token
}

export const verifyJwt = async (token: string, options: JWTVerifyOptions = {}) => {
  try {
    const secretKey = new TextEncoder().encode(process.env.JWT_SECRET_KEY)
    const { payload } = await jwtVerify(token, secretKey, options)

    return payload
  }
  catch (error) {
    console.error(`verifyJwt 錯誤: ${error}`)
    return null
  }
}
