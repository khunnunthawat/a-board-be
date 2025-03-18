import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Comment } from '../entities/comment.entity';
import { CommentService } from './comment.service';
import { PostService } from '../post/post.service';
import { UserService } from '../user/user.service';
import { CreateCommentDto, UpdateCommentDto } from './dto/comment.dto';
import { Post } from '../entities/post.entity';
import { User } from '../entities/user.entity';
import { CommunityType } from '../types/community.enum';

describe('CommentService', () => {
  let commentService: CommentService;
  let commentRepository: Repository<Comment>;
  let postService: PostService;
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

  const mockComment: Comment = {
    id: '200',
    description: 'This is a test comment',
    user: mockUser,
    post: mockPost,
    createdAt: new Date(),
    deletedAt: undefined,
  };

  const mockUpdatedComment: Comment = {
    ...mockComment,
    description: 'Updated comment',
  };

  const mockCommentRepository = {
    findOne: jest.fn(),
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockResolvedValue(mockComment),
    delete: jest.fn().mockResolvedValue({ affected: 1 }),
    find: jest.fn().mockResolvedValue([mockComment]),
    merge: jest.fn(),
  };

  const mockPostService = {
    findById: jest.fn().mockResolvedValue(mockPost),
  };

  const mockUserService = {
    findById: jest.fn().mockResolvedValue(mockUser),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentService,
        {
          provide: getRepositoryToken(Comment),
          useValue: mockCommentRepository,
        },
        {
          provide: PostService,
          useValue: mockPostService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    commentService = module.get<CommentService>(CommentService);
    commentRepository = module.get<Repository<Comment>>(
      getRepositoryToken(Comment),
    );
    postService = module.get<PostService>(PostService);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(commentService).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a comment by ID', async () => {
      mockCommentRepository.findOne.mockResolvedValue(mockComment);
      const result = await commentService.findOne('200');

      expect(result).toEqual(mockComment);
      expect(commentRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: '200',
            deletedAt: expect.any(Object),
          }),
          relations: expect.arrayContaining(['user', 'post']),
        }),
      );
    });

    it('should throw NotFoundException if comment not found', async () => {
      mockCommentRepository.findOne.mockResolvedValue(null);
      await expect(commentService.findOne('999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create and return a comment', async () => {
      const createCommentDto: CreateCommentDto = {
        userId: '1',
        postId: '100',
        description: 'New comment',
      };

      const result = await commentService.create(createCommentDto);
      expect(result).toEqual(mockComment);
      expect(userService.findById).toHaveBeenCalledWith('1');
      expect(postService.findById).toHaveBeenCalledWith('100');
      expect(commentRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          description: createCommentDto.description,
          user: mockUser,
          post: mockPost,
        }),
      );
      mockCommentRepository.findOne.mockResolvedValue(mockComment);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockUserService.findById.mockResolvedValue(null);
      const createCommentDto: CreateCommentDto = {
        userId: '999',
        postId: '100',
        description: 'New comment',
      };

      await expect(commentService.create(createCommentDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if post does not exist', async () => {
      mockPostService.findById.mockResolvedValue(null);
      const createCommentDto: CreateCommentDto = {
        userId: '1',
        postId: '999',
        description: 'New comment',
      };

      await expect(commentService.create(createCommentDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update and return the updated comment', async () => {
      mockCommentRepository.findOne.mockResolvedValue(mockComment);

      const updateCommentDto: UpdateCommentDto = {
        description: 'Updated comment',
      };

      mockCommentRepository.save.mockImplementation((comment) =>
        Promise.resolve({ ...comment, ...updateCommentDto }),
      );

      const result = await commentService.update('200', updateCommentDto);

      expect(result).toEqual(
        expect.objectContaining({ description: 'Updated comment' }),
      );
      expect(commentRepository.findOne).toHaveBeenCalledWith({
        where: { id: '200' },
      });
      expect(commentRepository.merge).toHaveBeenCalledWith(
        mockComment,
        updateCommentDto,
      );
      expect(commentRepository.save).toHaveBeenCalledWith(mockComment);
    });

    it('should throw NotFoundException if comment does not exist', async () => {
      mockCommentRepository.findOne.mockResolvedValue(null);

      await expect(
        commentService.update('999', { description: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteById', () => {
    it('should delete a comment successfully', async () => {
      mockCommentRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await commentService.deleteById('200');

      expect(result).toEqual({ message: 'Comment deleted successfully' });
      expect(commentRepository.delete).toHaveBeenCalledWith('200');
    });

    it('should throw NotFoundException if comment does not exist', async () => {
      mockCommentRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(commentService.deleteById('999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getCommentsByPostId', () => {
    it('should return comments for a given post ID', async () => {
      mockPostService.findById.mockResolvedValue(mockPost);
      mockCommentRepository.find.mockResolvedValue([mockComment]);

      const result = await commentService.getCommentsByPostId('100');

      expect(result).toEqual([mockComment]);
      expect(postService.findById).toHaveBeenCalledWith('100');
      expect(commentRepository.find).toHaveBeenCalledWith({
        where: { post: { id: '100' }, deletedAt: expect.any(Object) },
        relations: ['user'],
        order: { createdAt: 'DESC' },
      });
    });

    it('should throw NotFoundException if post does not exist', async () => {
      mockPostService.findById.mockResolvedValue(null);

      await expect(commentService.getCommentsByPostId('999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
