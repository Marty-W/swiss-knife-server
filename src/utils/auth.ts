import * as jwt from 'jsonwebtoken'

export interface AuthTokenPayload {
  id: string
  iat: number
  exp: number
}

export const decodeAuthHeader = (authHeader: string): string => {
  const token = authHeader.replace('Bearer ', '')

  if (!token) {
    throw new Error('No token found!')
  }

  const { id } = jwt.verify(token, process.env.APP_SECRET!) as AuthTokenPayload

  return id
}
