import request from 'supertest'
import app from '../src/index'
import prismaMock from './utils/prismaMock'
import PwdService from '../src/services/bcrypt'
import JWTService from '../src/services/jwt'

const mockedPwdService = PwdService as unknown as {
  hashPassword: jest.Mock
  checkPassword: jest.Mock
}

const mockedJWTService = JWTService as unknown as {
  signToken: jest.Mock
  verifyToken: jest.Mock
}

describe('Authentication API', () => {
  beforeEach(() => {
    mockedPwdService.checkPassword.mockReturnValue(true)
    mockedJWTService.signToken.mockReturnValue('test-jwt-token')
  })

  it('registers a new user', async () => {
    prismaMock.user.create.mockResolvedValue({
      id: 'user-1',
      email: 'john@example.com',
      username: 'john123',
    })

    const response = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'john123',
        email: 'john@example.com',
        password: 'P@ssw0rd!',
      })
      .expect(201)

    expect(response.body.success).toBe(true)
    expect(prismaMock.user.create).toHaveBeenCalledWith({
      email: 'john@example.com',
      password: 'hashed-password',
      role: 'User',
      username: 'john123',
    })
  })

  it('logs in an existing user', async () => {
    prismaMock.user.findFirst.mockResolvedValue({
      id: 'user-1',
      email: 'john@example.com',
      username: 'john123',
      password: 'hashed-password',
      role: 'User',
    })

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'john@example.com',
        password: 'P@ssw0rd!',
      })
      .expect(200)

    expect(response.body.object.token).toBe('test-jwt-token')
    expect(mockedPwdService.checkPassword).toHaveBeenCalledWith(
      'P@ssw0rd!',
      'hashed-password'
    )
  })

  it('returns 401 when credentials are invalid', async () => {
    prismaMock.user.findFirst.mockResolvedValue(null)

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'unknown@example.com',
        password: 'invalid',
      })
      .expect(401)

    expect(response.body.success).toBe(false)
    expect(response.body.message).toBe('Invalid credentials')
  })
})

describe('Products API', () => {
  it('creates a product as admin', async () => {
    prismaMock.product.create.mockResolvedValue({
      id: 'prod-1',
      name: 'Laptop',
      description: 'Powerful machine',
      price: 1200,
      stock: 5,
      category: 'Electronics',
      userId: 'admin-id',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    const response = await request(app)
      .post('/api/products')
      .set('Authorization', 'Bearer admin-token')
      .send({
        name: 'Laptop',
        description: 'Powerful machine',
        price: 1200,
        stock: 5,
        category: 'Electronics',
      })
      .expect(201)

    expect(response.body.object.name).toBe('Laptop')
    expect(prismaMock.product.create).toHaveBeenCalled()
  })

  it('lists products with pagination', async () => {
    prismaMock.product.findMany.mockResolvedValue([
      {
        id: 'prod-1',
        name: 'Laptop',
        description: 'Powerful machine',
        price: 1200,
        stock: 5,
        category: 'Electronics',
      },
    ])
    prismaMock.product.count.mockResolvedValue(1)

    const response = await request(app).get('/api/products?page=1&limit=10').expect(200)

    expect(response.body.object.products).toHaveLength(1)
    expect(response.body.object.totalProducts).toBe(1)
  })

  it('retrieves a product by id', async () => {
    prismaMock.product.findUnique.mockResolvedValue({
      id: 'prod-1',
      name: 'Laptop',
      description: 'Powerful machine',
      price: 1200,
      stock: 5,
      category: 'Electronics',
    })

    const response = await request(app).get('/api/products/prod-1').expect(200)

    expect(response.body.object.id).toBe('prod-1')
  })

  it('returns 404 when product is missing', async () => {
    prismaMock.product.findUnique.mockResolvedValue(null)

    const response = await request(app).get('/api/products/unknown').expect(404)

    expect(response.body.message).toBe('Product not found')
  })

  it('updates a product', async () => {
    prismaMock.product.findUnique.mockResolvedValue({
      id: 'prod-1',
      name: 'Laptop',
      description: 'Powerful machine',
      price: 1200,
      stock: 5,
      category: 'Electronics',
    })
    prismaMock.product.update.mockResolvedValue({
      id: 'prod-1',
      name: 'Laptop Pro',
      description: 'Updated description',
      price: 1500,
      stock: 10,
      category: 'Electronics',
    })

    const response = await request(app)
      .put('/api/products/prod-1')
      .set('Authorization', 'Bearer admin-token')
      .send({
        name: 'Laptop Pro',
        description: 'Updated description',
        price: 1500,
        stock: 10,
      })
      .expect(200)

    expect(response.body.object.name).toBe('Laptop Pro')
    expect(prismaMock.product.update).toHaveBeenCalledWith(
      {
        where: { id: 'prod-1' },
        data: {
        name: 'Laptop Pro',
        description: 'Updated description',
        price: 1500,
        stock: 10,
        },
      }
    )
  })

  it('deletes a product', async () => {
    prismaMock.product.findUnique.mockResolvedValue({
      id: 'prod-1',
      name: 'Laptop',
      description: 'Powerful machine',
      price: 1200,
      stock: 5,
      category: 'Electronics',
    })
    prismaMock.product.delete.mockResolvedValue({})

    const response = await request(app)
      .delete('/api/products/prod-1')
      .set('Authorization', 'Bearer admin-token')
      .expect(200)

    expect(response.body.message).toBe('Product deleted successfully')
    expect(prismaMock.product.delete).toHaveBeenCalledWith({ where: { id: 'prod-1' } })
  })
})

describe('Orders API', () => {
  it('creates an order', async () => {
    const productsInTx = [
      { id: 'prod-1', name: 'Laptop', price: 1000, stock: 5, description: '', category: 'Electronics' },
      { id: 'prod-2', name: 'Mouse', price: 50, stock: 10, description: '', category: 'Accessories' },
    ]

    prismaMock.$transaction.mockImplementation(async (callback: any) => {
      const txProduct = {
        findMany: jest.fn().mockResolvedValue(productsInTx),
        update: jest.fn().mockResolvedValue(null),
      }
      const txOrder = {
        create: jest.fn().mockResolvedValue({
          id: 'order-1',
          userId: 'user-id',
          totalPrice: 1100,
          status: 'pending',
        }),
        findUnique: jest.fn().mockResolvedValue({
          id: 'order-1',
          userId: 'user-id',
          totalPrice: 1100,
          status: 'pending',
          createdAt: new Date().toISOString(),
          items: [
            {
              id: 'item-1',
              productId: 'prod-1',
              quantity: 1,
              price: 1000,
              product: {
                id: 'prod-1',
                name: 'Laptop',
                description: '',
                category: 'Electronics',
              },
            },
          ],
        }),
      }
      const txProductOrder = {
        create: jest.fn().mockResolvedValue(null),
      }
      return callback({
        product: txProduct,
        order: txOrder,
        productOrder: txProductOrder,
      })
    })

    const response = await request(app)
      .post('/api/orders')
      .set('Authorization', 'Bearer user-token')
      .send([
        { productId: 'prod-1', quantity: 1 },
        { productId: 'prod-2', quantity: 2 },
      ])
      .expect(201)

    expect(response.body.object.id).toBe('order-1')
    expect(prismaMock.$transaction).toHaveBeenCalled()
  })

  it('fetches user order history', async () => {
    prismaMock.order.findMany.mockResolvedValue([
      {
        id: 'order-1',
        status: 'pending',
        totalPrice: 1100,
        createdAt: new Date().toISOString(),
      },
    ])

    const response = await request(app)
      .get('/api/orders')
      .set('Authorization', 'Bearer user-token')
      .expect(200)

    expect(response.body.object).toHaveLength(1)
    expect(prismaMock.order.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-id' },
      select: {
        id: true,
        status: true,
        totalPrice: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  })

  it('requires authentication for orders', async () => {
    const response = await request(app).get('/api/orders').expect(401)
    expect(response.body.success).toBe(false)
  })
})

