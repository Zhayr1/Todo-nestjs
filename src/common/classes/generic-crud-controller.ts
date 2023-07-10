import { GetUser } from '@/auth/decorators/user.decorator';
import { User } from '@/auth/entities/user.entity';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
  Request,
  Type,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ObjectLiteral } from 'typeorm';
import { AbstractValidationPipe } from '../pipes/abstract-validation-pipe';

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
  readById(userId: number, entityId: number | string): Promise<Entity>;
  update(
    dto: UpdateDto,
    userId: number,
    entityId: number | string,
  ): Promise<Entity>;
  deleteById(userId: number, entityId: number | string): Promise<void>;
}

export interface GenericCrudController<CreateDto, UpdateDto, Entity> {
  findAllEntities(userId: number): Promise<Entity[]>;
  findOneEntity(userId: number, entityId: number | string): Promise<Entity>;
  createEntity(userId: number, dto: CreateDto): Promise<GenericResponse>;
  updateEntity(
    dto: UpdateDto,
    userId: number,
    entityId: number | string,
  ): Promise<GenericResponse>;
  deleteEntity(
    userId: number,
    entityId: number | string,
  ): Promise<GenericResponse>;
}

export function GenericCrudController<
  CreateEntityDto,
  UpdateEntityDto,
  Entity extends ObjectLiteral,
>(
  serviceObject: Type<CrudService<CreateEntityDto, UpdateEntityDto, Entity>>,
  prefix: string,
  createDto: Type<CreateEntityDto>,
  updateDto: Type<UpdateEntityDto>,
  entityName?: string,
): Type<GenericCrudController<CreateEntityDto, UpdateEntityDto, Entity>> {
  const createPipe = new AbstractValidationPipe(
    { whitelist: true, transform: true },
    { body: createDto },
  );

  const updatePipe = new AbstractValidationPipe(
    { whitelist: true, transform: true },
    { body: updateDto },
  );

  @Controller(prefix)
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  class GenericCrudControllerHost {
    constructor(
      @Inject(serviceObject)
      readonly service: CrudService<CreateEntityDto, UpdateEntityDto, Entity>,
    ) {}

    @Get()
    async findAllEntities(@GetUser('id') userId: number) {
      return this.service.read(userId);
    }

    @Get(':id')
    async findOneEntity(
      @GetUser('id') userId: number,
      @Param('id') entityId: string,
    ) {
      return this.service.readById(userId, entityId);
    }

    @Post()
    @UsePipes(createPipe)
    async createEntity(
      @GetUser('id') userId: number,
      @Body() dto: CreateEntityDto,
    ) {
      await this.service.create(dto, userId);

      return {
        statusCode: HttpStatus.CREATED,
        message: `${entityName ? entityName : 'Entity'} created successfully`,
      };
    }

    @Put(':id')
    @UsePipes(updatePipe)
    async updateEntity(
      @Body() dto: UpdateEntityDto,
      @GetUser('id') userId: number,
      @Param('id') entityId: string,
    ) {
      await this.service.update(dto, userId, entityId);

      return {
        statusCode: HttpStatus.OK,
        message: `${entityName ? entityName : 'Entity'} updated successfully`,
      };
    }

    @Delete(':id')
    async deleteEntity(
      @GetUser('id') userId: number,
      @Param('id') entityId: string,
    ) {
      await this.service.deleteById(userId, entityId);

      return {
        statusCode: HttpStatus.OK,
        message: `${entityName ? entityName : 'Entity'} deleted successfully`,
      };
    }
  }

  return GenericCrudControllerHost;
}
