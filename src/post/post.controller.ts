import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/post.dto';
import { Post as PostEntity } from '../entities/post.entity';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('community') community?: string,
  ): Promise<PostEntity[]> {
    return this.postService.findAll(search, community);
  }

  @Get(':postId')
  findById(@Param('postId') postId: string): Promise<PostEntity> {
    return this.postService.findById(postId);
  }

  @Post()
  create(@Body() createPostDto: CreatePostDto) {
    return this.postService.create(createPostDto);
  }

  @Delete(':postId')
  deleteById(@Param('postId') postId: string, @Body('userId') userId: string) {
    return this.postService.deleteById(postId, userId);
  }

  @Patch(':postId')
  updatePost(
    @Param('postId') postId: string,
    @Body() updateData: Partial<PostEntity> & { userId: string },
  ) {
    return this.postService.updatePost(postId, updateData);
  }

  @Get('/user/:userId')
  async getPostsByUserId(
    @Param('userId') userId: string,
    @Query('search') search?: string,
    @Query('community') community?: string,
  ) {
    return this.postService.getPostsByUserId(userId, search, community);
  }
}
