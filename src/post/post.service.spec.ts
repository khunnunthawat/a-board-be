import { Test, TestingModule } from '@nestjs/testing';
import { PostService } from './post.service';
import { UserService } from '../user/user.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Post } from '../entities/post.entity';
import { User } from '../entities/user.entity';
import {
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { CommunityType } from '../types/community.enum';
import { CreatePostDto } from './dto/post.dto';

describe('PostService', () => {
  let postService: PostService;
  let postRepository: Repository<Post>;
  let userService: UserService;

  const mockUser: User = {
    id: '1',
    username: 'testuser',
    posts: [],
    comments: [],
    createdAt: new Date(),
  };

  const mockPost: Post = {
    id: '100',
    title: 'Test Post',
    description: 'This is a test post',
    community: CommunityType.Food,
    user: mockUser,
    comments: [],
    createdAt: new Date(),
    deletedAt: undefined,
  };

  const mockPostRepository = {
    find: jest.fn().mockResolvedValue([mockPost]),
    findOne: jest.fn(),
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation((post) => Promise.resolve(post)),
    softDelete: jest.fn(),
  };

  const mockUserService = {
    findById: jest.fn().mockResolvedValue(mockUser),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        {
          provide: getRepositoryToken(Post),
          useValue: mockPostRepository,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    postService = module.get<PostService>(PostService);
    postRepository = module.get<Repository<Post>>(getRepositoryToken(Post));
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(postService).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of posts', async () => {
      const result = await postService.findAll();
      expect(result).toEqual([mockPost]);
      expect(postRepository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('findById', () => {
    it('should return a post by ID', async () => {
      mockPostRepository.findOne.mockResolvedValue(mockPost);
      const result = await postService.findById('100');
      expect(result).toEqual(mockPost);
      expect(postRepository.findOne).toHaveBeenCalledWith({
        where: { id: '100' },
        relations: ['user', 'comments'],
      });
    });

    it('should throw NotFoundException if post not found', async () => {
      mockPostRepository.findOne.mockResolvedValue(null);
      await expect(postService.findById('999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a new post', async () => {
      const createPostDto: CreatePostDto = {
        userId: '1',
        title: 'New Post',
        description: 'This is a new post',
        community: CommunityType.Health,
      };

      const result = await postService.create(createPostDto);
      expect(result).toEqual(
        expect.objectContaining({
          title: createPostDto.title,
          description: createPostDto.description,
          community: createPostDto.community,
          user: expect.objectContaining({
            id: '1',
            username: 'testuser',
          }),
        }),
      );
      expect(userService.findById).toHaveBeenCalledWith('1');
      expect(postRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: createPostDto.title,
          description: createPostDto.description,
          community: createPostDto.community,
          user: expect.objectContaining({
            id: '1',
            username: 'testuser',
          }),
        }),
      );
      expect(postRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if title is missing', async () => {
      const createPostDto = {
        userId: '1',
        title: '',
        description: 'Missing title',
        community: CommunityType.History,
      };

      await expect(
        postService.create(createPostDto as CreatePostDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid community type', async () => {
      const createPostDto = {
        userId: '1',
        title: 'Invalid Community',
        description: 'Invalid',
        community: 'UnknownCommunity' as CommunityType,
      };

      await expect(postService.create(createPostDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw UnauthorizedException if user is invalid', async () => {
      mockUserService.findById.mockResolvedValue(null);
      const createPostDto = {
        userId: '2',
        title: 'Invalid User',
        description: 'Should fail',
        community: CommunityType.Food,
      };

      await expect(postService.create(createPostDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('deleteById', () => {
    it('should soft delete a post', async () => {
      mockPostRepository.findOne.mockResolvedValue(mockPost);
      const result = await postService.deleteById('100', '1');
      expect(result).toEqual({ message: 'Post deleted successfully' });
      expect(postRepository.softDelete).toHaveBeenCalledWith('100');
    });

    it('should throw NotFoundException if post is not found', async () => {
      mockPostRepository.findOne.mockResolvedValue(null);
      await expect(postService.deleteById('999', '1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw UnauthorizedException if user is not the owner', async () => {
      mockPostRepository.findOne.mockResolvedValue({
        ...mockPost,
        user: { id: '2' },
      });
      await expect(postService.deleteById('100', '1')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('updatePost', () => {
    it('should update a post', async () => {
      mockPostRepository.findOne.mockResolvedValue(mockPost);
      const updatedPost = await postService.updatePost('100', {
        title: 'Updated',
        userId: '1',
      });
      expect(updatedPost.title).toBe('Updated');
      expect(postRepository.save).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if user is not the owner', async () => {
      mockPostRepository.findOne.mockResolvedValue({
        ...mockPost,
        user: { id: '2' },
      });
      await expect(
        postService.updatePost('100', { title: 'Updated', userId: '1' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getPostsByUserId', () => {
    it('should return posts by user ID', async () => {
      mockPostRepository.find.mockResolvedValue([mockPost]);

      const result = await postService.getPostsByUserId('1');

      expect(result).toEqual([mockPost]);

      expect(postRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            user: expect.objectContaining({ id: '1' }),
            deletedAt: expect.any(Object), // Fix: Accepts IsNull() as an object
          }),
          relations: expect.arrayContaining(['user', 'comments']),
          order: expect.objectContaining({ createdAt: 'DESC' }),
        }),
      );
    });
  });
});
