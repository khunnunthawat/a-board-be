import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, IsNull, Repository } from 'typeorm';
import { Post } from '../entities/post.entity';
import { UserService } from '../user/user.service';
import { CreatePostDto } from './dto/post.dto';
import { CommunityType } from '../types/community.enum';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    private userService: UserService,
  ) {}

  async findAll(search?: string, community?: string): Promise<Post[]> {
    const whereCondition: any = { deletedAt: IsNull() };

    if (community) {
      whereCondition.community = community;
    }

    if (search) {
      whereCondition.title = ILike(`%${search}%`);
    }

    return this.postRepository.find({
      where: whereCondition,
      relations: ['user', 'comments'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string) {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['user', 'comments'],
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async create(createPostDto: CreatePostDto) {
    const { userId, title, description, community } = createPostDto;

    if (!title) {
      throw new BadRequestException('Title is required');
    }

    if (!Object.values(CommunityType).includes(community as CommunityType)) {
      throw new BadRequestException(
        'Invalid community type. Must be one of: History, Food, Pets, Health, Fashion, Exercise, Others',
      );
    }

    const user = await this.userService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('Invalid user');
    }

    const post = this.postRepository.create({
      title,
      description,
      community,
      user,
    });

    return this.postRepository.save(post);
  }

  async deleteById(id: string, userId: string) {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.user.id !== userId) {
      throw new UnauthorizedException(
        'You are not authorized to delete this post',
      );
    }

    await this.postRepository.softDelete(id);

    return { message: 'Post deleted successfully' };
  }

  async updatePost(id: string, updateData: Partial<Post> & { userId: string }) {
    const { userId, ...updateFields } = updateData;

    const post = await this.findById(id);

    if (post.user.id !== userId) {
      throw new UnauthorizedException(
        'You are not authorized to update this post',
      );
    }

    Object.assign(post, updateFields);

    return this.postRepository.save(post);
  }

  async getPostsByUserId(
    userId: string,
    search?: string,
    community?: string,
  ): Promise<Post[]> {
    const whereCondition: any = { user: { id: userId }, deletedAt: IsNull() };

    if (community) {
      whereCondition.community = community;
    }

    if (search) {
      whereCondition.title = ILike(`%${search}%`);
    }

    return this.postRepository.find({
      where: whereCondition,
      relations: ['user', 'comments'],
      order: { createdAt: 'DESC' },
    });
  }
}
