import { Response as ExpressResponse, NextFunction, Request } from 'express'
import Response from '../services/response'

export default class ErrorHandler {
  static watch(
    handler: (
      req: Request,
      res: ExpressResponse,
      next: NextFunction
    ) => Promise<void> | void
  ) {
    return async (req: Request, res: ExpressResponse, next: NextFunction) => {
      try {
        await Promise.resolve(handler(req, res, next))
      } catch (error) {
        console.log({ error })
        next(error)
      }
    }
  }

  /** Handle invalid route
   *
   * @param {Request} req - request
   * @param {ExpressResponse} res - response
   * @returns {ExpressResponse} - Error message
   */
  static notFound(req: Request, res: ExpressResponse): ExpressResponse {
    return Response.send(res, 404, 'Sorry, That route is not here!')
  }

  /** Handle Uncaught exceptions
   *
   * @param {Error} err - error object
   * @returns {void} - Logs the error
   */
  static handleUncaught(err: Error): void {
    console.error(err.stack || err.message)
    process.exit(1)
  }

  /** Handle errors
   *
   * @param {Error} err - error
   * @param {Request} req - request
   * @param {ExpressResponse} res - response
   * @param {NextFunction} next - next function
   * @returns {ExpressResponse} - Error message
   */
  // eslint-disable-next-line no-unused-vars
  static handleErrors(
    err: any,
    req: Request,
    res: ExpressResponse,
    next: NextFunction
  ): ExpressResponse {
    console.error(err.stack || err.message)
    return Response.send(
      res,
      err.statusCode || err.status || 500,
      err.message || 'Something Failed, Please try again'
    )
  }
}
