import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findById(id: string) {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByUsername(username: string): Promise<User | null> {
    return await this.userRepository.findOneBy({ username });
  }

  async signIn(createUserDto: UserDto) {
    const existingUser = await this.findByUsername(createUserDto.username);

    if (existingUser) {
      return { message: 'User already exists', user: existingUser };
    }

    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }
}
