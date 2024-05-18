import { Controller, Post, Query } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailDto } from './dto/email.dto';

@Controller('emails')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  async sendEmail(@Query('email') to: string): Promise<EmailDto> {
    return await this.emailService.sendEmailVerification(to);
  }
}
