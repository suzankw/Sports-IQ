// Typed errors: services throw these, errorHandler turns them into `{ error: { code, message, details } }`.
export class AppError extends Error {
  constructor(status, code, message, details = []) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export class ValidationError extends AppError {
  constructor(message = 'The request is invalid', details = []) {
    super(400, 'VALIDATION_ERROR', message, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Please sign in') {
    super(401, 'UNAUTHENTICATED', message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'You are not allowed to do this', code = 'FORBIDDEN') {
    super(403, code, message);
  }
}

export class NotFoundError extends AppError {
  constructor(what = 'Resource') {
    super(404, 'NOT_FOUND', `${what} not found`);
  }
}

export class ConflictError extends AppError {
  constructor(message) {
    super(409, 'CONFLICT', message);
  }
}

export class PayloadTooLargeError extends AppError {
  constructor(message = 'Photos must be 2 MB or smaller') {
    super(413, 'PAYLOAD_TOO_LARGE', message);
  }
}

export class UnsupportedMediaTypeError extends AppError {
  constructor(message = 'Upload a JPEG, PNG or WebP image') {
    super(415, 'UNSUPPORTED_MEDIA_TYPE', message);
  }
}

/** Collects domain-rule problems so one response can list them all. */
export function validationProblems() {
  const details = [];
  return {
    add: (path, message) => details.push({ path, message }),
    throwIfAny: () => {
      if (details.length) throw new ValidationError('The request is invalid', details);
    },
  };
}
