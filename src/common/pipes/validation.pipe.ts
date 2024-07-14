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
      const messages = errors.map((error) => ({
        property: error.property,
        constraints: Object.values(error.constraints),
      }));
      return new UnprocessableEntityException({
        message: 'Validation failed',
        errors: messages,
        statusCode: 422,
      });
    },
    ...options,
  });
}
