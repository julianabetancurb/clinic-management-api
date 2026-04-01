import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DoctoresV2Service } from './doctores-v2.service';
import { ProcesoDoctorDto } from './dto/proceso-doctor.dto';

@ApiTags('Doctores v2')
@Controller({ path: 'doctores', version: '2' })
export class DoctoresV2Controller {
  constructor(private readonly doctoresV2Service: DoctoresV2Service) {}

  @Post('proceso')
  @ApiOperation({
    summary: 'Procesar mensaje en la cadena multicloud',
    description:
      'Guarda el doctor en BD, arma el payload con jsonDirector y lo reenvía al siguiente microservicio.',
  })
  @ApiResponse({ status: 201, description: 'Mensaje procesado y enviado al siguiente MS' })
  @ApiResponse({ status: 502, description: 'Error al contactar el siguiente microservicio' })
  procesarMensaje(@Body() dto: ProcesoDoctorDto) {
    return this.doctoresV2Service.procesarMensaje(dto);
  }
}