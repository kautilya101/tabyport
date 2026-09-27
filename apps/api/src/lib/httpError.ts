export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "HttpError";
  }

  static badRequest(message: string, details?: unknown) {
    return new HttpError(400, "BAD_REQUEST", message, details);
  }

  static notFound(message: string) {
    return new HttpError(404, "NOT_FOUND", message);
  }

  static conflict(message: string) {
    return new HttpError(409, "CONFLICT", message);
  }
}
