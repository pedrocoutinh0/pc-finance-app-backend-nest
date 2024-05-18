import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '../auth/auth.guard';
import { Public } from 'src/utils/decorators/public.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard)
  @Public()
  @Get()
  async index() {
    return await this.userService.findAll();
  }

  @Public()
  @Post('register')
  async register(@Body() body: RegisterUserDto) {
    return await this.userService.create(body);
  }

  @Get('show')
  async show(@Query('id') id: string) {
    return await this.userService.findOneOrFail(id);
  }

  @Get('show/email')
  async emailVerify(@Query('email') email: string) {
    return await this.userService.findOneByEmail(email);
  }

  @Public()
  @Put()
  async update(@Query('id') id: string, @Body() body: UpdateUserDto) {
    return await this.userService.update(id, body);
  }

  @Public()
  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async destroy(@Query('id') id: string) {
    await this.userService.deleteById(id);
  }
}
