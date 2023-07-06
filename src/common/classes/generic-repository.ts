import { BadRequestException, NotFoundException, Type } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import {
  FindManyOptions,
  FindOneOptions,
  ObjectLiteral,
  Repository,
} from 'typeorm';
import { uniqueConstrainValidatorMessage } from '../utils/utils';

export interface GenericRepository<T extends ObjectLiteral> {
  repository: Repository<T>;
  find(options: FindManyOptions<T>): Promise<T[]>;
  findOne(options: FindOneOptions<T>): Promise<T>;
  save(entity: T): Promise<T>;
}

export function GenericRepository<Entity>(
  repositoryEntity: EntityClassOrSchema,
  entityName?: string,
): Type<GenericRepository<Entity>> {
  class GenericRepositoryHost {
    @InjectRepository(repositoryEntity)
    public readonly repository: Repository<Entity>;

    async find(options: FindManyOptions<Entity>) {
      return this.repository.find(options);
    }

    async findOne(options: FindOneOptions<Entity>) {
      const entity = await this.repository.findOne(options);

      if (!entity) {
        throw new NotFoundException(`${entityName || 'Entity'} not found`);
      }

      return entity;
    }

    async save(entity: Entity) {
      try {
        return await this.repository.save(entity);
      } catch (e) {
        const message = uniqueConstrainValidatorMessage(e);
        console.error('Repository.save: ', e);
        throw new BadRequestException(message);
      }
    }
  }

  return GenericRepositoryHost;
}
