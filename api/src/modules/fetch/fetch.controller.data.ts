import { Model } from 'mongoose';
import {
  Body,
  Controller,
  Get,
  Post,
  Delete,
  Query,
  Inject,
  Param,
  Res,
} from '@nestjs/common';
import { ApiImplicitQuery } from '@nestjs/swagger';
import { FetchModel } from './fetch.model';
import FetchDataService from './fetch.service.data';
import { FetchDtoData } from './fetch.dto.data';

@Controller('data/fetchs')
export default class FetchDataController {

  constructor(private readonly fetchDataService: FetchDataService) { }

  @Post()
  async create(@Body() fetchDtoData: FetchDtoData): Promise<void> {
    this.fetchDataService.create(fetchDtoData);
  }

  @ApiImplicitQuery({ name: "offset", required: true, type: Number })
  @ApiImplicitQuery({ name: "limit", required: true, type: Number })
  @ApiImplicitQuery({ name: "value", required: false, type: String })
  @Get()
  async find(@Query() params: any): Promise<FetchModel[]> {
    return await this.fetchDataService.find(+params.offset, +params.limit, params.value);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Query() params: any): Promise<any> {
    return await this.fetchDataService.delete(id, params.searchString);
  }

  @Get('find')
  async search(@Query('search') search: string): Promise<FetchModel[]> {
    return await this.fetchDataService.search(search);
  }

}