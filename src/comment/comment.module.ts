import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { Comment } from '../entities/comment.entity';
import { UserModule } from '../user/user.module';
import { PostModule } from '../post/post.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment]),
    UserModule,
    forwardRef(() => PostModule),
  ],
  controllers: [CommentController],
  providers: [CommentService],
  exports: [CommentService],
})
export class CommentModule {}
