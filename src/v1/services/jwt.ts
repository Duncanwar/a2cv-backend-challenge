import jwt, { JwtPayload } from 'jsonwebtoken'
import env from '../config/env'

export default class JWTService {
  static signToken(data: object): string {
    const token = jwt.sign(data, env.JWT_KEY as string, { expiresIn: '24h' })
    return token
  }

  static verifyToken(token: string): JwtPayload | string | null {
    let decoded: JwtPayload | string | null
    try {
      decoded = jwt.verify(token, env.JWT_KEY as string)
    } catch (err) {
      decoded = null
    }
    return decoded
  }
}
