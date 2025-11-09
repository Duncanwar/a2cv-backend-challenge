import { IPage } from "./dto";

type PrismaFindManyArgs = {
  where?: any;
  select?: any;
  include?: any;
  orderBy?: any;
  skip?: number;
  take?: number;
};

export async function paginate<
  TModel,
  TFindManyArgs extends PrismaFindManyArgs = PrismaFindManyArgs
>(
  model: any,
  args: TFindManyArgs,
  page = 0,
  size = 10
): Promise<IPage<TModel>> {
  const countArgs = {
    where: args.where,
    orderBy: args.orderBy,
  };

  const [items, totalItems] = await Promise.all([
    model.findMany({
      ...args,
      take: size,
      skip: size * page,
    }) as Promise<TModel[]>,
    model.count(countArgs),
  ]);

  return {
    items,
    totalItems,
    itemCount: items.length,
    itemsPerPage: size,
    totalPages: Math.ceil(totalItems / size),
    currentPage: page,
  };
}
