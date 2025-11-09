import bcrypt from 'bcryptjs'

export default class PwdService {
  /** Hash user password
   *
   * @param {string} password - Password to hash
   * @returns {string} - Password hash
   */
  static hashPassword(password: string): string {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10))
  }

  /** Compare password with hash
   *
   * @param {string} password - Password to compare
   * @param {string} hashed - Hashed password to compare with
   * @returns {boolean} - Result of the comparison
   */
  static checkPassword(password: string, hashed: string | null): boolean {
    if (hashed) {
      return bcrypt.compareSync(password, hashed)
    }
    return false
  }
}
