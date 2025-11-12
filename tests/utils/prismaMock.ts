const createMockFn = () => jest.fn()

const prismaMock = {
  user: {
    findUnique: createMockFn(),
    findFirst: createMockFn(),
    create: createMockFn(),
  },
  product: {
    findMany: createMockFn(),
    count: createMockFn(),
    findUnique: createMockFn(),
    create: createMockFn(),
    update: createMockFn(),
    delete: createMockFn(),
  },
  order: {
    findMany: createMockFn(),
    create: createMockFn(),
    findUnique: createMockFn(),
  },
  productOrder: {
    create: createMockFn(),
  },
  $transaction: createMockFn(),
}

export const resetPrismaMock = () => {
  Object.values(prismaMock).forEach((model) => {
    if (typeof model === 'function' && 'mockReset' in model) {
      model.mockReset()
      return
    }

    if (model && typeof model === 'object') {
      Object.values(model).forEach((fn) => {
        if (typeof fn === 'function' && 'mockReset' in fn) {
          fn.mockReset()
        }
      })
    }
  })
}

export default prismaMock

