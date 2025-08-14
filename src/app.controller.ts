import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Check')
@Controller('healthcheck')
export class AppController {
  constructor(private readonly appService: AppService) {}
  @ApiOperation({ summary: 'Realiza healthcheck do micro serviço' }) 
  @ApiResponse({ status: 200, description: 'Hello World!' })

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
