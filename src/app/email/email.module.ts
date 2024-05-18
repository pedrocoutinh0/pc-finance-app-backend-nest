import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';

@Module({
  imports: [UserModule],
  controllers: [EmailController],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
