import { Test, TestingModule } from '@nestjs/testing';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { Post as PostEntity } from '../entities/post.entity';
import { NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/post.dto';
import { CommunityType } from '../types/community.enum';

describe('PostController', () => {
  let postController: PostController;
  let postService: PostService;

  const mockPost: PostEntity = {
    id: '100',
    title: 'Test Post',
    description: 'This is a test post',
    community: CommunityType.Food,
    user: {
      id: '1',
      username: 'testuser',
      posts: [],
      comments: [],
      createdAt: new Date(),
    },
    comments: [],
    createdAt: new Date(),
    deletedAt: undefined,
  };

  const mockPostService = {
    findAll: jest.fn().mockResolvedValue([mockPost]),
    findById: jest.fn().mockResolvedValue(mockPost),
    create: jest.fn().mockResolvedValue(mockPost),
    deleteById: jest
      .fn()
      .mockResolvedValue({ message: 'Post deleted successfully' }),
    updatePost: jest
      .fn()
      .mockResolvedValue({ ...mockPost, title: 'Updated Title' }),
    getPostsByUserId: jest.fn().mockResolvedValue([mockPost]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostController],
      providers: [
        {
          provide: PostService,
          useValue: mockPostService,
        },
      ],
    }).compile();

    postController = module.get<PostController>(PostController);
    postService = module.get<PostService>(PostService);
  });

  it('should be defined', () => {
    expect(postController).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of posts', async () => {
      const result = await postController.findAll();
      expect(result).toEqual([mockPost]);
      expect(postService.findAll).toHaveBeenCalled();
    });

    it('should call findAll with search and community filters', async () => {
      await postController.findAll('Test', 'Food');
      expect(postService.findAll).toHaveBeenCalledWith('Test', 'Food');
    });
  });

  describe('findById', () => {
    it('should return a post by ID', async () => {
      const result = await postController.findById('100');
      expect(result).toEqual(mockPost);
      expect(postService.findById).toHaveBeenCalledWith('100');
    });

    it('should throw NotFoundException if post is not found', async () => {
      mockPostService.findById.mockRejectedValueOnce(new NotFoundException());
      await expect(postController.findById('999')).rejects.toThrow(
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

      const result = await postController.create(createPostDto);
      expect(result).toEqual(mockPost);
      expect(postService.create).toHaveBeenCalledWith(createPostDto);
    });
  });

  describe('deleteById', () => {
    it('should delete a post', async () => {
      const result = await postController.deleteById('100', '1');
      expect(result).toEqual({ message: 'Post deleted successfully' });
      expect(postService.deleteById).toHaveBeenCalledWith('100', '1');
    });
  });

  describe('updatePost', () => {
    it('should update a post', async () => {
      const updateData = { title: 'Updated Title', userId: '1' };

      const result = await postController.updatePost('100', updateData);
      expect(result).toEqual({ ...mockPost, title: 'Updated Title' });
      expect(postService.updatePost).toHaveBeenCalledWith('100', updateData);
    });
  });

  describe('getPostsByUserId', () => {
    it('should return posts by user ID', async () => {
      const result = await postController.getPostsByUserId('1');
      expect(result).toEqual([mockPost]);
      expect(postService.getPostsByUserId).toHaveBeenCalledWith(
        '1',
        undefined,
        undefined,
      );
    });

    it('should call getPostsByUserId with filters', async () => {
      await postController.getPostsByUserId('1', 'SearchQuery', 'Health');
      expect(postService.getPostsByUserId).toHaveBeenCalledWith(
        '1',
        'SearchQuery',
        'Health',
      );
    });
  });
});
