import { User } from '@/auth/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Todo {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @ManyToOne(() => User)
  user: User;

  @Column()
  title: string;

  @Column()
  description: string;
}
