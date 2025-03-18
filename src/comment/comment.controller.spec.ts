import { Test, TestingModule } from '@nestjs/testing';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { Comment } from '../entities/comment.entity';
import { NotFoundException } from '@nestjs/common';
import { CreateCommentDto, UpdateCommentDto } from './dto/comment.dto';
import { CommunityType } from '../types/community.enum';

describe('CommentController', () => {
  let commentController: CommentController;
  let commentService: CommentService;

  const mockComment: Comment = {
    id: '200',
    description: 'This is a test comment',
    user: {
      id: '1',
      username: 'testuser',
      posts: [],
      comments: [],
      createdAt: new Date(),
    },
    post: {
      id: '100',
      title: 'Test Post',
      description: 'This is a test post',
      user: {
        id: '1',
        username: 'testuser',
        posts: [],
        comments: [],
        createdAt: new Date(),
      },
      comments: [],
      createdAt: new Date(),
      community: CommunityType.Food,
      deletedAt: undefined,
    },
    createdAt: new Date(),
    deletedAt: undefined,
  };

  const mockCommentService = {
    findOne: jest.fn().mockResolvedValue(mockComment),
    create: jest.fn().mockResolvedValue(mockComment),
    update: jest
      .fn()
      .mockResolvedValue({ ...mockComment, description: 'Updated comment' }),
    deleteById: jest
      .fn()
      .mockResolvedValue({ message: 'Comment deleted successfully' }),
    getCommentsByPostId: jest.fn().mockResolvedValue([mockComment]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentController],
      providers: [
        {
          provide: CommentService,
          useValue: mockCommentService,
        },
      ],
    }).compile();

    commentController = module.get<CommentController>(CommentController);
    commentService = module.get<CommentService>(CommentService);
  });

  it('should be defined', () => {
    expect(commentController).toBeDefined();
  });

  describe('getCommentById', () => {
    it('should return a comment by ID', async () => {
      const result = await commentController.getCommentById('200');

      expect(result).toEqual(mockComment);
      expect(commentService.findOne).toHaveBeenCalledWith('200');
    });

    it('should throw NotFoundException if comment is not found', async () => {
      mockCommentService.findOne.mockRejectedValueOnce(new NotFoundException());
      await expect(commentController.getCommentById('999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createComment', () => {
    it('should create a new comment', async () => {
      const createCommentDto: CreateCommentDto = {
        userId: '1',
        postId: '100',
        description: 'New comment',
      };

      const result = await commentController.createComment(createCommentDto);

      expect(result).toEqual(mockComment);
      expect(commentService.create).toHaveBeenCalledWith(createCommentDto);
    });
  });

  describe('updateComment', () => {
    it('should update and return the updated comment', async () => {
      const updateCommentDto: UpdateCommentDto = {
        description: 'Updated comment',
      };

      const result = await commentController.updateComment(
        '200',
        updateCommentDto,
      );

      expect(result).toEqual(
        expect.objectContaining({ description: 'Updated comment' }),
      );
      expect(commentService.update).toHaveBeenCalledWith(
        '200',
        updateCommentDto,
      );
    });
  });

  describe('deleteComment', () => {
    it('should delete a comment successfully', async () => {
      const result = await commentController.deleteComment('200');

      expect(result).toEqual({ message: 'Comment deleted successfully' });
      expect(commentService.deleteById).toHaveBeenCalledWith('200');
    });

    it('should throw NotFoundException if comment does not exist', async () => {
      mockCommentService.deleteById.mockRejectedValueOnce(
        new NotFoundException(),
      );
      await expect(commentController.deleteComment('999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getCommentsByPostId', () => {
    it('should return comments for a given post ID', async () => {
      const result = await commentController.getCommentsByPostId('100');

      expect(result).toEqual([mockComment]);
      expect(commentService.getCommentsByPostId).toHaveBeenCalledWith('100');
    });

    it('should throw NotFoundException if post does not exist', async () => {
      mockCommentService.getCommentsByPostId.mockRejectedValueOnce(
        new NotFoundException(),
      );
      await expect(
        commentController.getCommentsByPostId('999'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
