import { GenericCrudController } from '@/common/classes/generic-crud-controller';
import { CreateTodoDto, UpdateTodoDto } from '../dto/create-todo.dto';
import { TodoService } from '../services/todo.service';
import { Todo } from '../entities/todo.entity';

const prefix = 'todo';

export class TodoController extends GenericCrudController<
  CreateTodoDto,
  UpdateTodoDto,
  Todo
>(TodoService, prefix, CreateTodoDto, UpdateTodoDto, 'Todo') {}
