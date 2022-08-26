import * as jwt from 'jsonwebtoken';

export interface AuthTokenPayload {
  userId: string
}

export const decodeAuthHeader = (authHeader: string): AuthTokenPayload => {
  const token = authHeader.replace('Bearer ', '')

  if (!token) {
    throw new Error('No token found!')
  }

  return jwt.verify(token, process.env.APP_SECRET!)
}
