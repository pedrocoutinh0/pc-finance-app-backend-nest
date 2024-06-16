import { Controller, Get, HttpCode, UseGuards } from '@nestjs/common';

import { AuthGuard } from '../auth/auth.guard';
import { Public } from 'src/utils/decorators/public.decorator';

@Controller('Health')
export class HealthController {
  @UseGuards(AuthGuard)
  @Public()
  @HttpCode(200)
  @Get()
  async index() {
    return {
      status_code: 200,
    };
  }
}
