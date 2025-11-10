import { body } from 'express-validator'
import { PrismaClient } from '../generated/prisma'

const prisma = new PrismaClient()

export const registerValidators = [
  body('email')
    .isEmail().withMessage('Must be a valid email address')
    .custom(async (email : string) => {
      const exists = await prisma.user.findUnique({ where: { email } })
      if (exists) throw new Error('Email is already registered')
      return true
    }),
  body('username')
    .isAlphanumeric().withMessage('Username must be alphanumeric')
    .custom(async (username: string) => {
      const exists = await prisma.user.findUnique({ where: { username } })
      if (exists) throw new Error('Username is already taken')
      return true
    }),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must include an uppercase letter')
    .matches(/[a-z]/).withMessage('Password must include a lowercase letter')
    .matches(/[0-9]/).withMessage('Password must include a number')
    .matches(/[!@#$%^&*]/).withMessage('Password must include a special character'),
]

export const loginValidator = [
  body('email')
    .isEmail().withMessage('Must be a valid email address')
    .notEmpty().withMessage('Email is required'),
  body('password')
    .notEmpty().withMessage('Password is required'),
]
