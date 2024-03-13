import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entity/user.entity';
import { Repository } from 'typeorm';
import { UserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';

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
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    return usersDto;
  }

  async findOneOrFail(id: string): Promise<UserDto> {
    try {
      const user = await this.userRepository.findOneByOrFail({ id });
      console.log(user);
      const userDto: UserDto = {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      return userDto;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async findOneByUsername(username: string) {
    try {
      return await this.userRepository.findOneByOrFail({ username });
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async create(data): Promise<UserDto> {
    const hashPassword = await bcrypt.hash(data.password, 10);
    data.password = hashPassword;

    await this.userRepository.save(this.userRepository.create(data));
    const user = await this.userRepository.findOneBy({
      username: data.username,
    });
    const userDto: UserDto = {
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    return userDto;
  }

  async update(id: string, data): Promise<UserDto> {
    try {
      const oldUser = await this.userRepository.findOneByOrFail({ id });

      this.userRepository.merge(oldUser, data);

      await this.userRepository.save(oldUser);

      const user = await this.userRepository.findOneBy({
        id,
      });

      const userDto: UserDto = {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
      return userDto;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async deleteById(id: string) {
    await this.findOneOrFail(id);

    await this.userRepository.softDelete(id);
  }
}
