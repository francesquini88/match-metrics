import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'; 

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Match Metrics API')
    .setDescription('API para processamento e ranking de partidas')
    .setVersion('1.0')
    .addTag('matches', 'Operações relacionadas a partidas')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document); 
 

  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
bootstrap();