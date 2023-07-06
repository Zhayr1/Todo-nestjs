import { GenericCrudController } from '@/common/classes/generic-crud-controller';
import { Controller } from '@nestjs/common';
import { CreateTodoDto, UpdateTodoDto } from '../dto/create-todo.dto';
import { TodoService } from '../services/todo.service';
import { Todo } from '../entities/todo.entity';

@Controller('')
export class TodoController extends GenericCrudController<
  CreateTodoDto,
  UpdateTodoDto,
  Todo
>(TodoService, 'todo', 'Todo') {}
