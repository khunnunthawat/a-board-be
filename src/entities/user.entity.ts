import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @CreateDateColumn()
  createdAt: Date;
}
