import { User } from '@/auth/entities/user.entity';
import * as bcrypt from 'bcrypt';

interface Props {
  username: string;
  password: string;
  role?: string;
}

export const UserStub = ({ username, password, role = 'USER' }: Props) => {
  const u = new User();

  const salt = bcrypt.genSaltSync();

  const hash = bcrypt.hashSync(password, salt);

  u.role = role;
  u.username = username;
  u.password = hash;

  return u;
};
