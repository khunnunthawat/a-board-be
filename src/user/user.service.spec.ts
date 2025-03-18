import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { NotFoundException } from '@nestjs/common';
import { UserDto } from './dto/user.dto';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            find: jest.fn(),
            findOneBy: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get(getRepositoryToken(User));
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users: User[] = [{ id: '1', username: 'testuser' } as User];

      userRepository.find.mockResolvedValue(users);

      expect(await userService.findAll()).toEqual(users);
      expect(userRepository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('findById', () => {
    it('should return a user when found', async () => {
      const user: User = { id: '1', username: 'testuser' } as User;

      userRepository.findOneBy.mockResolvedValue(user);

      expect(await userService.findById('1')).toEqual(user);
      expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: '1' });
    });

    it('should throw NotFoundException when user is not found', async () => {
      userRepository.findOneBy.mockResolvedValue(null);

      await expect(userService.findById('2')).rejects.toThrow(
        NotFoundException,
      );
      expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: '2' });
    });
  });

  describe('findByUsername', () => {
    it('should return a user when found by username', async () => {
      const user: User = { id: '1', username: 'testuser' } as User;

      userRepository.findOneBy.mockResolvedValue(user);

      expect(await userService.findByUsername('testuser')).toEqual(user);
      expect(userRepository.findOneBy).toHaveBeenCalledWith({
        username: 'testuser',
      });
    });

    it('should return null when user is not found', async () => {
      userRepository.findOneBy.mockResolvedValue(null);

      expect(await userService.findByUsername('unknownuser')).toBeNull();
    });
  });

  describe('signIn', () => {
    it('should return existing user if already registered', async () => {
      const existingUser: User = { id: '1', username: 'testuser' } as User;

      jest.spyOn(userService, 'findByUsername').mockResolvedValue(existingUser);

      const dto: UserDto = { username: 'testuser' };

      expect(await userService.signIn(dto)).toEqual({
        message: 'User already exists',
        user: existingUser,
      });

      expect(userService.findByUsername).toHaveBeenCalledWith(dto.username);
      expect(userRepository.create).not.toHaveBeenCalled();
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('should create and save a new user when username does not exist', async () => {
      jest.spyOn(userService, 'findByUsername').mockResolvedValue(null);

      const newUser: User = { id: '2', username: 'newuser' } as User;
      userRepository.create.mockReturnValue(newUser);
      userRepository.save.mockResolvedValue(newUser);

      const dto: UserDto = { username: 'newuser' };
      const result = await userService.signIn(dto);

      expect(userRepository.create).toHaveBeenCalledWith(dto);
      expect(userRepository.save).toHaveBeenCalledWith(newUser);
      expect(result).toEqual(newUser);
    });
  });
});
