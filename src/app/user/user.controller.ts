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

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard)
  @Get()
  async index() {
    return await this.userService.findAll();
  }

  @Post('register')
  async register(@Body() body: RegisterUserDto) {
    return await this.userService.create(body);
  }

  @Get('show')
  async show(@Query('id') id: string) {
    return await this.userService.findOneOrFail(id);
  }

  @Put()
  async update(@Query('id') id: string, @Body() body: UpdateUserDto) {
    return await this.userService.update(id, body);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async destroy(@Query('id') id: string) {
    await this.userService.deleteById(id);
  }
}
