import { Response as ExpressResponse } from 'express'

interface ResponseData {
  message: string
  data?: object | null
}

export default class Response {
  static send(
    res: ExpressResponse,
    status: number,
    message: string,
    data?: object
  ): ExpressResponse {
    const responseData: ResponseData = {
      message,
      data: data || null,
    }
    return res.status(status).json(responseData)
  }
}
