import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DoctoresService } from './doctores.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';

@ApiTags('Doctores')
@Controller('doctores')
export class DoctoresController {
  constructor(private readonly doctoresService: DoctoresService) {}

  @Post()
  @ApiOperation({ summary: 'Crear doctor' })
  @ApiResponse({ status: 201, description: 'Doctor creado' })
  create(@Body() dto: CreateDoctorDto) {
    return this.doctoresService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar doctores' })
  findAll() {
    return this.doctoresService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener doctor por id' })
  @ApiParam({ name: 'id', example: 'uuid' })
  findOne(@Param('id') id: string) {
    return this.doctoresService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar doctor (parcial)' })
  update(@Param('id') id: string, @Body() dto: UpdateDoctorDto) {
    return this.doctoresService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar doctor' })
  remove(@Param('id') id: string) {
    return this.doctoresService.remove(id);
  }
}