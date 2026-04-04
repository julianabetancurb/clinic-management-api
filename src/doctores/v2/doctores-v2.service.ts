import {
  Injectable,
  BadGatewayException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProcesoDoctorDto } from './dto/proceso-doctor.dto';

@Injectable()
export class DoctoresV2Service {
  private readonly logger = new Logger(DoctoresV2Service.name);
  private readonly siguienteApiUrl = process.env.SIGUIENTE_API_URL ?? '';

  constructor(private readonly prisma: PrismaService) {}

  async procesarMensaje(dto: ProcesoDoctorDto) {
    let doctor;

    try {
      doctor = await this.prisma.doctor.create({
        data: {
          documento: dto.documento,
          nombres: dto.nombres,
          apellidos: dto.apellidos,
          especialidad: dto.especialidad,
          duracionCitaMin: dto.duracionCitaMinutos ?? 30,
        },
      });
    } catch (err: any) {
      if (err?.code === 'P2002') {
        throw new BadRequestException(
          'Ya existe un doctor con ese documento.',
        );
      }

      this.logger.error('Error al crear el doctor en base de datos', err);
      throw new BadRequestException('Error al crear el doctor.');
    }

    const payload = {
      documento: doctor.documento,
      nombres: doctor.nombres,
      apellidos: doctor.apellidos,
      especialidad: doctor.especialidad,
      duracionCitaMinutos: doctor.duracionCitaMin,
      jsonDirector: dto.jsonDirector,
    };

    if (this.siguienteApiUrl) {
      return await this.llamarSiguienteApi(payload);
    }

    this.logger.warn(
      'SIGUIENTE_API_URL no configurada. Retornando respuesta local.',
    );

    return payload;
  }

  private async llamarSiguienteApi(body: Record<string, any>) {
    try {
      this.logger.log(`Llamando al siguiente MS: ${this.siguienteApiUrl}`);

      const response = await fetch(this.siguienteApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new BadGatewayException(
          `El siguiente microservicio respondió con error ${response.status}: ${errorText}`,
        );
      }

      return await response.json();
    } catch (err: any) {
      if (err instanceof BadGatewayException) {
        throw err;
      }

      this.logger.error('Error al llamar al siguiente microservicio', err);
      throw new BadGatewayException(
        `No se pudo contactar al siguiente microservicio: ${err.message}`,
      );
    }
  }
}