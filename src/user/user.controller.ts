import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '../entities/user.entity';
import { UserDto } from './dto/user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Post('/signin')
  signIn(@Body() userDto: UserDto) {
    return this.userService.signIn(userDto);
  }
}
