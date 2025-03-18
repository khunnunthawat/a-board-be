import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto, UpdateCommentDto } from './dto/comment.dto';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get(':commentId')
  async getCommentById(@Param('commentId') commentId: string) {
    return this.commentService.findOne(commentId);
  }

  @Post()
  async createComment(@Body() createCommentDto: CreateCommentDto) {
    return this.commentService.create(createCommentDto);
  }

  @Patch(':commentId')
  async updateComment(
    @Param('commentId') commentId: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentService.update(commentId, updateCommentDto);
  }

  @Delete(':commentId')
  async deleteComment(@Param('commentId') commentId: string) {
    return this.commentService.deleteById(commentId);
  }

  @Get('/post/:postId')
  async getCommentsByPostId(@Param('postId') postId: string) {
    return this.commentService.getCommentsByPostId(postId);
  }
}
