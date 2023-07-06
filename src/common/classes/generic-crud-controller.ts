import { User } from '@/auth/entities/user.entity';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Request,
  Type,
} from '@nestjs/common';
import { ObjectLiteral } from 'typeorm';

export interface RequestWithUser extends Request {
  user: User;
}

export interface GenericResponse {
  statusCode: HttpStatus;
  message: string;
}

export interface CrudService<CreateDto, UpdateDto, Entity> {
  create(dto: CreateDto, userId: number): Promise<Entity>;
  read(userId: number): Promise<Entity[]>;
  readById(userId: number, entityId: number): Promise<Entity>;
  update(dto: UpdateDto, userId: number, entityId: number): Promise<Entity>;
  deleteById(userId: number, entityId: number): Promise<void>;
}

export interface GenericCrudController<CreateDto, UpdateDto, Entity> {
  findAllEntities(req: RequestWithUser): Promise<Entity[]>;
  findOneEntity(req: RequestWithUser, entityId: number): Promise<Entity>;
  createEntity(req: RequestWithUser, dto: CreateDto): Promise<GenericResponse>;
  updateEntity(
    dto: UpdateDto,
    req: RequestWithUser,
    entityId: number,
  ): Promise<GenericResponse>;
  deleteEntity(
    req: RequestWithUser,
    entityId: number,
  ): Promise<GenericResponse>;
}

export function GenericCrudController<
  CreateEntityDto,
  UpdateEntityDto,
  Entity extends ObjectLiteral,
>(
  serviceObject: CrudService<CreateEntityDto, UpdateEntityDto, Entity>,
  prefix: string,
  entityName?: string,
): Type<GenericCrudController<CreateEntityDto, UpdateEntityDto, Entity>> {
  @Controller(prefix)
  class GenericCrudControllerHost {
    constructor(
      @Inject(serviceObject)
      readonly service: CrudService<CreateEntityDto, UpdateEntityDto, Entity>,
    ) {}

    @Get()
    async findAllEntities(@Request() req: RequestWithUser) {
      return this.service.read(req.user.id);
    }

    @Get(':id')
    async findOneEntity(
      @Request() req: RequestWithUser,
      @Param('id', ParseIntPipe) entityId: number,
    ) {
      return this.service.readById(req.user.id, entityId);
    }

    @Post()
    async createEntity(
      @Request() req: RequestWithUser,
      @Body() dto: CreateEntityDto,
    ) {
      await this.service.create(dto, req.user.id);

      return {
        statusCode: HttpStatus.CREATED,
        message: `${entityName || 'Entity'} created successfully`,
      };
    }

    @Put(':id')
    async updateEntity(
      @Body() dto: UpdateEntityDto,
      @Request() req: RequestWithUser,
      @Param('id', ParseIntPipe) entityId: number,
    ) {
      await this.service.update(dto, req.user.id, entityId);

      return {
        statusCode: HttpStatus.OK,
        message: `${entityName || 'Entity'} updated successfully`,
      };
    }

    @Delete(':id')
    async deleteEntity(
      @Request() req: RequestWithUser,
      @Param('id', ParseIntPipe) entityId: number,
    ) {
      await this.service.deleteById(req.user.id, entityId);

      return {
        statusCode: HttpStatus.OK,
        message: `${entityName || 'Entity'} deleted successfully`,
      };
    }
  }

  return GenericCrudControllerHost;
}
