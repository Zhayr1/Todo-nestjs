import { Module } from '@nestjs/common';
import { TodoController } from './controllers/todo.controller';
import { TodoService } from './services/todo.service';
import { AuthModule } from '@/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Todo } from './entities/todo.entity';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Todo])],
  controllers: [TodoController],
  providers: [TodoService],
  exports: [TodoService],
})
export class TodoModule {}
