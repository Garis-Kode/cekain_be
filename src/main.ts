import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { customValidationPipe } from './common/pipes/validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(customValidationPipe());
  await app.listen(3000);
}
bootstrap();
