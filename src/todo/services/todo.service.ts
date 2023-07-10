import { GenericRepository } from '@/common/classes/generic-repository';
import { Todo } from '../entities/todo.entity';
import { CrudService } from '@/common/classes/generic-crud-controller';
import { CreateTodoDto, UpdateTodoDto } from '../dto/create-todo.dto';
import { UserService } from '@/auth/services/user.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TodoService
  extends GenericRepository<Todo>(Todo, 'Todo')
  implements CrudService<CreateTodoDto, UpdateTodoDto, Todo>
{
  constructor(private readonly userService: UserService) {
    super();
  }

  async getById(todoId: number) {
    return this.findOne({ where: { id: todoId } });
  }

  async getByIdAndUserId(todoId: number, userId: number) {
    return this.findOne({
      where: {
        id: todoId,
        user: {
          id: userId,
        },
      },
    });
  }

  async create(dto: CreateTodoDto, userId: number): Promise<Todo> {
    const user = await this.userService.getById(userId);

    const todo = new Todo();
    todo.title = dto.title;
    todo.description = dto.description;
    todo.user = user;

    const savedTodo = await this.save(todo);

    return savedTodo;
  }

  async deleteById(userId: number, todoId: number): Promise<void> {
    const todo = await this.findOne({
      where: {
        id: todoId,
        user: {
          id: userId,
        },
      },
    });

    await this.repository.remove(todo);
  }

  read(userId: number): Promise<Todo[]> {
    return this.find({
      where: {
        user: {
          id: userId,
        },
      },
    });
  }

  async readById(userId: number, todoId: number): Promise<Todo> {
    return this.getByIdAndUserId(todoId, userId);
  }

  async update(
    dto: UpdateTodoDto,
    userId: number,
    todoId: number,
  ): Promise<Todo> {
    const todo = await this.getByIdAndUserId(todoId, userId);

    todo.description = dto.description;
    todo.title = dto.title;

    return await this.save(todo);
  }
}
