import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Comment } from '../entities/comment.entity';
import { CreateCommentDto, UpdateCommentDto } from './dto/comment.dto';
import { PostService } from '../post/post.service';
import { UserService } from '../user/user.service';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,

    @Inject(forwardRef(() => PostService))
    private readonly postService: PostService,
    private readonly userService: UserService,
  ) {}

  async findOne(id: string): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['user', 'post'],
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    return comment;
  }

  async create(createCommentDto: CreateCommentDto) {
    const [user, post] = await Promise.all([
      this.userService.findById(createCommentDto.userId),
      this.postService.findById(createCommentDto.postId),
    ]);

    if (!user)
      throw new NotFoundException(
        `User with ID ${createCommentDto.userId} not found`,
      );

    if (!post)
      throw new NotFoundException(
        `Post with ID ${createCommentDto.postId} not found`,
      );

    if (!createCommentDto.description.trim()) {
      throw new BadRequestException('Comment description cannot be empty');
    }

    const comment = await this.commentRepository.save(
      this.commentRepository.create({
        description: createCommentDto.description.trim(),
        user,
        post,
        createdAt: new Date(),
      }),
    );

    if (!comment?.id)
      throw new InternalServerErrorException('Failed to save the comment');

    return comment;
  }

  async update(
    id: string,
    updateCommentDto: UpdateCommentDto,
  ): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id },
    });

    if (!comment) throw new NotFoundException('Comment not found');

    this.commentRepository.merge(comment, updateCommentDto);

    return this.commentRepository.save(comment);
  }

  async deleteById(id: string) {
    const deleteResult = await this.commentRepository.delete(id);

    if (!deleteResult.affected) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    return { message: 'Comment deleted successfully' };
  }

  async getCommentsByPostId(postId: string): Promise<Comment[]> {
    const post = await this.postService.findById(postId);

    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    const comment = await this.commentRepository.find({
      where: { post: { id: postId }, deletedAt: IsNull() },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });

    return comment;
  }
}
