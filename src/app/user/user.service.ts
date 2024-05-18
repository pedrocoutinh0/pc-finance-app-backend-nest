import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entity/user.entity';
import { Repository } from 'typeorm';
import { UserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import {
  validateEmail,
  validatePassword,
  validateUsername,
} from 'src/utils/validation/validation';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findAll(): Promise<UserDto[]> {
    const users = await this.userRepository.find();

    const usersDto: UserDto[] = users.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      verifyEmail: user.verifyEmail,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    return usersDto;
  }

  async findOneOrFail(id: string): Promise<UserDto> {
    if (!id) {
      throw new HttpException('User ID is required.', HttpStatus.BAD_REQUEST);
    }

    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new HttpException(`User ID ${id} not found.`, HttpStatus.NOT_FOUND);
    }

    const userDto: UserDto = {
      id: user.id,
      username: user.username,
      email: user.email,
      verifyEmail: user.verifyEmail,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return userDto;
  }

  async findOneByUsername(username: string) {
    const user = await this.userRepository.findOneBy({ username });

    if (!user) {
      throw new HttpException(
        `User username ${username} not found.`,
        HttpStatus.NOT_FOUND,
      );
    }

    return user;
  }

  async findOneByEmail(email: string): Promise<UserDto> {
    if (!email) {
      throw new HttpException(
        'User email is required.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.userRepository.findOneBy({ email });

    if (!user) {
      throw new HttpException(
        `User email ${email} not found.`,
        HttpStatus.NOT_FOUND,
      );
    }

    const userDto: UserDto = {
      id: user.id,
      username: user.username,
      email: user.email,
      verifyEmail: user.verifyEmail,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    return userDto;
  }

  async create(data): Promise<RegisterUserDto> {
    if (!validatePassword(data.password)) {
      throw new HttpException(
        'Password must contain at least 8 characters, including at least one uppercase letter, one lowercase letter, one number, and one special character.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashPassword = await bcrypt.hash(data.password, 10);
    data.password = hashPassword;

    if (!validateUsername(data.username)) {
      throw new HttpException(
        'Invalid username format. Username can only contain letters, numbers, and underscores.',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!validateEmail(data.email)) {
      throw new HttpException('Invalid email format.', HttpStatus.BAD_REQUEST);
    }

    const userIsAlreadyCreated = await this.userRepository.findOneBy({
      username: data.username,
    });

    if (userIsAlreadyCreated) {
      throw new HttpException(
        'Username is already created.',
        HttpStatus.CONFLICT,
      );
    }

    const emailIsAlreadyUsed = await this.userRepository.findOneBy({
      email: data.email,
    });

    if (emailIsAlreadyUsed) {
      throw new HttpException('Email is already used.', HttpStatus.CONFLICT);
    }

    await this.userRepository.save(this.userRepository.create(data));

    const registerUserDto: RegisterUserDto = {
      username: data.username,
      email: data.email,
    };
    return registerUserDto;
  }

  async update(id: string, data): Promise<UpdateUserDto> {
    if (!validateUsername(data.username)) {
      throw new HttpException(
        'Invalid username format.',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!validateEmail(data.email)) {
      throw new HttpException('Invalid email format.', HttpStatus.BAD_REQUEST);
    }

    const oldUser = await this.userRepository.findOneBy({ id });

    if (!oldUser) {
      throw new HttpException(`User ID ${id} not found.`, HttpStatus.NOT_FOUND);
    }

    const userIsAlreadyCreated = await this.userRepository.findOneBy({
      username: data.username,
    });

    if (userIsAlreadyCreated && userIsAlreadyCreated.id !== oldUser.id) {
      throw new HttpException(
        'Username is already created.',
        HttpStatus.CONFLICT,
      );
    }

    const emailIsAlreadyUsed = await this.userRepository.findOneBy({
      email: data.email,
    });

    if (emailIsAlreadyUsed && emailIsAlreadyUsed.id !== oldUser.id) {
      throw new HttpException('Email is already used.', HttpStatus.CONFLICT);
    }

    this.userRepository.merge(oldUser, data);

    await this.userRepository.save(oldUser);

    const updateUserDto: UpdateUserDto = {
      username: data.username,
      email: data.email,
      activeService: data.activeUser,
    };
    return updateUserDto;
  }

  async deleteById(id: string) {
    await this.findOneOrFail(id);

    await this.userRepository.delete(id);
  }

  async initializeInitialUser(): Promise<void> {
    const usersCount = await this.userRepository.count();
    if (usersCount === 0) {
      const hashPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

      const user_admin = new UserEntity();
      user_admin.username = process.env.ADMIN_USERNAME;
      user_admin.email = process.env.ADMIN_EMAIL;
      user_admin.password = hashPassword;
      user_admin.activeUser = true;

      await this.userRepository.save(this.userRepository.create(user_admin));
      console.log('Usuário inicial criado com sucesso.');
    }
  }
}
