import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { PimplesService } from './pimples.service';
import { CreatePimpleDto } from './dto/create-pimple.dto';

@Controller('pimples')
export class PimplesController {
  constructor(private readonly pimplesService: PimplesService) {}

  @Post()
  async create(@Body() body: CreatePimpleDto) {
    const data = await this.pimplesService.create(body);
    return {
      success: true,
      message: 'Pimple created successfully',
      data,
    };
  }

  @Get()
  async findAll() {
    const data = await this.pimplesService.findAll();
    return {
      success: true,
      message: 'Pimples fetched successfully',
      data,
    };
  }

  // 🔹 GET single
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.pimplesService.findOne(id);
    return {
      success: true,
      message: 'Pimple fetched successfully',
      data,
    };
  }

  // 🔹 UPDATE
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: Partial<CreatePimpleDto>,
  ) {
    const data = await this.pimplesService.update(id, body);
    return {
      success: true,
      message: 'Pimple updated successfully',
      data,
    };
  }

  // 🔹 DELETE
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = await this.pimplesService.remove(id);
    return {
      success: true,
      message: 'Pimple deleted successfully',
      data,
    };
  }
}
