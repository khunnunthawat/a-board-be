import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Post } from './post.entity';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  description: string;

  @ManyToOne(() => User, (user) => user.comments, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  user: User;

  @ManyToOne(() => Post, (post) => post.comments, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  post: Post;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
