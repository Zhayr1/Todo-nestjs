import { GenericRepository } from '@/common/classes/generic-repository';
import { Todo } from '../entities/todo.entity';
import { CrudService } from '@/common/classes/generic-crud-controller';
import { CreateTodoDto, UpdateTodoDto } from '../dto/create-todo.dto';

export class TodoService
  extends GenericRepository<Todo>(Todo)
  implements CrudService<CreateTodoDto, UpdateTodoDto, Todo>
{
  create(dto: CreateTodoDto, userId: number): Promise<Todo> {
    //
  }

  deleteById(userId: number, entityId: number): Promise<void> {
    //
  }

  read(userId: number): Promise<Todo[]> {
    //
  }

  readById(userId: number, entityId: number): Promise<Todo> {
    //
  }

  update(dto: UpdateTodoDto, userId: number, entityId: number): Promise<Todo> {
    //
  }
}
