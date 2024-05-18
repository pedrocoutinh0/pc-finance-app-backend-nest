import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { UserService } from '../user/user.service';
import { EmailDto } from './dto/email.dto';

@Injectable()
export class EmailService {
  constructor(
    private readonly mailerService: MailerService,
    private userService: UserService,
  ) {}

  async sendEmailVerification(to: string): Promise<EmailDto> {
    const user = await this.userService.findOneByEmail(to);

    if (!user) {
      throw new HttpException('Usuário não encontrado.', HttpStatus.NOT_FOUND);
    }

    const verificationCode = user.verifyEmail;

    try {
      await this.mailerService.sendMail({
        to: to,
        subject: 'Código de Verificação Finance',
        text: `Seu código de verificação Finance é: ${verificationCode}`,
        html: `<p>Seu código de verificação Finance é: <strong>${verificationCode}</strong></p>`,
      });

      return { message: 'Email enviado com sucesso' };
    } catch (error) {
      throw new HttpException(
        'Erro ao enviar email de verificação.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
