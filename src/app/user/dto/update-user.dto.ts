import { IsNotEmpty } from 'class-validator';
import { RegisterUserDto } from './register-user.dto';

export class UpdateUserDto extends RegisterUserDto {
  @IsNotEmpty()
  activeService: boolean;
}
