import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CitasService } from './citas.service';
import { CreateCitaDto } from './dto/create-cita.dto';
import { UpdateCitaDto } from './dto/update-cita.dto';
import { UpdateEstadoCitaDto } from './dto/update-estado-cita.dto';

@ApiTags('Citas')
@Controller('citas')
export class CitasController {
  constructor(private readonly citasService: CitasService) {}

  @Post()
  @ApiOperation({ summary: 'Crear cita' })
  @ApiResponse({ status: 201, description: 'Cita creada' })
  create(@Body() dto: CreateCitaDto) {
    return this.citasService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar citas' })
  findAll() {
    return this.citasService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener cita por id' })
  @ApiParam({ name: 'id', example: 'uuid' })
  findOne(@Param('id') id: string) {
    return this.citasService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar cita (reprogramar/cambiar motivo)' })
  update(@Param('id') id: string, @Body() dto: UpdateCitaDto) {
    return this.citasService.update(id, dto);
  }

  @Patch(':id/estado')
  @ApiOperation({ summary: 'Actualizar estado de una cita' })
  updateEstado(@Param('id') id: string, @Body() dto: UpdateEstadoCitaDto) {
    return this.citasService.updateEstado(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar cita' })
  remove(@Param('id') id: string) {
    return this.citasService.remove(id);
  }
}