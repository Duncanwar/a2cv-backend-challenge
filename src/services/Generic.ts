import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

export default class GenericService<T extends keyof PrismaClient> {
  private model: any

  constructor(model: T) {
    this.model = prisma[model]
  }

  async create(data: any) {
    return this.model.create({ data })
  }

  async findUnique(where: any, select?: any) {
    return this.model.findUnique({ where, select })
  }

  async findMany(args: any = {}) {
    return this.model.findMany(args)
  }

  async update(where: any, data: any) {
    return this.model.update({ where, data })
  }

  async delete(where: any) {
    return this.model.delete({ where })
  }

  async count(where: any = {}) {
    return this.model.count({ where })
  }
}