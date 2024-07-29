import {
  UnprocessableEntityException,
  ValidationError,
  ValidationPipe,
  ValidationPipeOptions,
} from '@nestjs/common';

export function customValidationPipe(options?: ValidationPipeOptions) {
  return new ValidationPipe({
    transform: true,
    disableErrorMessages: false,
    errorHttpStatusCode: 422,
    stopAtFirstError: true,
    exceptionFactory: (errors: ValidationError[]) => {
      return new UnprocessableEntityException({
        status: 'error',
        message: 'Validation failed',
        detail: errors.map((error) => ({
          field: error.property,
          constraints: Object.values(error.constraints)[0],
        })),
      });
    },
    ...options,
  });
}
