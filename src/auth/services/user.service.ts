import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { GenericRepository } from '@/common/classes/generic-repository';

@Injectable()
export class UserService extends GenericRepository<User>(User, 'User') {
  async getById(userId) {
    return this.findOne({ where: { id: userId } });
  }
}
