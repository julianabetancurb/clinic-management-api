import {
  Injectable,
  BadGatewayException,
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
    // 1. Guardar doctor en BD
    const doctor = await this.prisma.doctor.create({
      data: {
        documento: dto.documento,
        nombres: dto.nombres,
        apellidos: dto.apellidos,
        especialidad: dto.especialidad,
        duracionCitaMin: dto.duracionCitaMinutos ?? 30,
      },
    });

    // 2. Armar payload para el siguiente MS
    const payload = {
      documento: doctor.documento,
      nombres: doctor.nombres,
      apellidos: doctor.apellidos,
      especialidad: doctor.especialidad,
      duracionCitaMinutos: doctor.duracionCitaMin,
      jsonDirector: dto.jsonDirector,
    };

    // 3. Llamar al siguiente MS si está configurado
    if (this.siguienteApiUrl) {
      return await this.llamarSiguienteApi(payload);
    }

    // Modo standalone (sin SIGUIENTE_API_URL configurada)
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
      if (err instanceof BadGatewayException) throw err;
      throw new BadGatewayException(
        `No se pudo contactar al siguiente microservicio: ${err.message}`,
      );
    }
  }
}