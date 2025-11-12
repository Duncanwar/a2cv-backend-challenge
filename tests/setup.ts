import prismaMock, { resetPrismaMock } from './utils/prismaMock'

process.env.NODE_ENV = 'test'
process.env.JWT_KEY = process.env.JWT_KEY || 'test-secret'

jest.mock('../src/config/database', () => ({
  prisma: prismaMock,
  connectDatabase: jest.fn(),
  disconnectDatabase: jest.fn(),
}))

jest.mock('../src/services/bcrypt', () => ({
  __esModule: true,
  default: {
    hashPassword: jest.fn(() => 'hashed-password'),
    checkPassword: jest.fn(() => true),
  },
}))

jest.mock('../src/services/jwt', () => ({
  __esModule: true,
  default: {
    signToken: jest.fn(() => 'test-jwt-token'),
    verifyToken: jest.fn(() => ({ id: 'user-id', role: 'User' })),
  },
}))

jest.mock('../src/middleware/authHandler', () => ({
  authenticate: (req: any, res: any, next: any) => {
    const header = req.headers['authorization']
    if (!header) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
        object: null,
        errors: null,
      })
    }
    const token = header.replace('Bearer ', '')
    if (token === 'admin-token') {
      req.user = { id: 'admin-id', role: 'Admin' }
    } else if (token === 'user-token') {
      req.user = { id: 'user-id', role: 'User' }
    } else {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
        object: null,
        errors: null,
      })
    }
    next()
  },
}))

jest.mock('../src/validators/authValidator', () => {
  const noop = (_req: any, _res: any, next: any) => next()
  return {
    registerValidators: [noop],
    loginValidator: [noop],
  }
})

jest.mock('../src/controller/product/product', () => {
  const actual = jest.requireActual('../src/controller/product/product')
  const noop = (_req: any, _res: any, next: any) => next()
  return {
    __esModule: true,
    ...actual,
    createProductValidators: [noop],
    updateProductValidators: [noop],
  }
})

afterEach(() => {
  resetPrismaMock()
  jest.clearAllMocks()
})

