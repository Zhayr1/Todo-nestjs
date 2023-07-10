import { User } from '@/auth/entities/user.entity';
import { Todo } from '@/todo/entities/todo.entity';

interface Props {
  title?: string;
  description?: string;
  user?: User;
}

export const TodoStub = ({ title, description = '', user }: Props) => {
  const to = new Todo();

  to.title = title;
  to.description = description;
  to.user = user ?? null;

  return to;
};
