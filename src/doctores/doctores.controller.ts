import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
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

  @Patch(':documento')
  @ApiOperation({ summary: 'Actualizar doctor por documento (parcial)' })
  @ApiParam({ name: 'documento', example: '987654321' })
  update(@Param('documento') documento: string, @Body() dto: UpdateDoctorDto) {
    return this.doctoresService.updateByDocumento(documento, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar doctor' })
  remove(@Param('id') id: string) {
    return this.doctoresService.remove(id);
  }

  @Get(':id/citas')
  @ApiOperation({ summary: 'Obtener citas de un doctor' })
  getCitas(@Param('id') id: string) {
    return this.doctoresService.getCitasByDoctor(id);
  }
}
