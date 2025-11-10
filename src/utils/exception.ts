export class CustomException extends Error {
  name: string
  statusCode: number

  constructor(message: string, name: string, statusCode: number) {
    super(message)
    this.name = name
    this.statusCode = statusCode
  }
}

export class BadRequestException extends CustomException {
  constructor(message?: string) {
    super(message || 'Bad Request', 'BadRequestException', 400)
  }
}

export class UnauthorizedException extends CustomException {
  constructor(message?: string) {
    super(message || 'Unauthorized', 'UnauthorizedException', 401)
  }
}

export class ForbiddenException extends CustomException {
  constructor(message?: string) {
    super(message || 'Forbidden', 'ForbiddenException', 403)
  }
}

export class NotFoundException extends CustomException {
  constructor(message?: string) {
    super(message || 'Not Found', 'NotFoundException', 404)
  }
}

export class ConflictException extends CustomException {
  constructor(message?: string) {
    super(message || 'Conflict', 'ConflictException', 409)
  }
}

export class TooManyRequestsException extends CustomException {
  constructor(message?: string) {
    super(message || 'Too Many Requests', 'TooManyRequestsException', 429)
  }
}

export class ServerErrorException extends CustomException {
  constructor(message?: string) {
    super(message || 'Server Error', 'ServerErrorException', 500)
  }
}

export class BadGatewayException extends CustomException {
  constructor(message?: string) {
    super(message || 'Bad Gateway', 'BadGatewayException', 502)
  }
}
