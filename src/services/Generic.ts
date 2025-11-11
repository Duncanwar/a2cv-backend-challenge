import { prisma } from '../config/database'
import { PrismaClient } from '../generated/prisma'

export default class GenericService<T extends keyof PrismaClient> {
  private model: any

  constructor(model: T) {
    this.model = prisma[model]
  }

  async create(data: any) {
    return this.model.create({ data })
  }

  async findUnique(where: any, options?: { select?: any; include?: any }) {
    const query: any = { where };
    if (options?.select) query.select = options.select;
    if (options?.include) query.include = options.include;
    return this.model.findUnique(query);
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