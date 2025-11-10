import { Response as ExpressResponse } from 'express'

interface ResponseData {
  success: boolean
  errors?: string[] | null
  object?: object | null
  message: string
}

export default class Response {
  static send(
    res: ExpressResponse,
    status: number,
    success: boolean,
    message: string,
    object?: object | null,
    errors?: string[] | null
  ): ExpressResponse {
    const responseData: ResponseData = {
      success,
      message,
      errors: errors || null,
      object: object || null,
    }
    return res.status(status).json(responseData)
  }
}
