import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from '../entities/user.entity';
import { UserDto } from './dto/user.dto';
import { NotFoundException } from '@nestjs/common';

describe('UserController', () => {
  let userController: UserController;
  let userService: jest.Mocked<UserService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
            signIn: jest.fn(),
          },
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get(UserService);
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users: User[] = [{ id: '1', username: 'testuser' } as User];

      userService.findAll.mockResolvedValue(users);

      const result = await userController.findAll();
      expect(result).toEqual(users);
      expect(userService.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findById', () => {
    it('should return a user if found', async () => {
      const user: User = { id: '1', username: 'testuser' } as User;

      userService.findById.mockResolvedValue(user);

      const result = await userController.findById('1');
      expect(result).toEqual(user);
      expect(userService.findById).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if user is not found', async () => {
      userService.findById.mockRejectedValue(new NotFoundException());

      await expect(userController.findById('2')).rejects.toThrow(
        NotFoundException,
      );
      expect(userService.findById).toHaveBeenCalledWith('2');
    });
  });

  describe('signIn', () => {
    it('should return existing user message if user exists', async () => {
      const existingUser = { id: '1', username: 'testuser' } as User;
      const dto: UserDto = { username: 'testuser' };

      userService.signIn.mockResolvedValue({
        message: 'User already exists',
        user: existingUser,
      });

      const result = await userController.signIn(dto);
      expect(result).toEqual({
        message: 'User already exists',
        user: existingUser,
      });
      expect(userService.signIn).toHaveBeenCalledWith(dto);
    });

    it('should create and return a new user if username does not exist', async () => {
      const newUser = { id: '2', username: 'newuser' } as User;
      const dto: UserDto = { username: 'newuser' };

      userService.signIn.mockResolvedValue(newUser);

      const result = await userController.signIn(dto);
      expect(result).toEqual(newUser);
      expect(userService.signIn).toHaveBeenCalledWith(dto);
    });
  });
});
