import {
  Injectable,
  BadGatewayException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProcesoDoctorDto } from './dto/proceso-doctor.dto';

type DatosDoctorNuevo = Required<
  Pick<ProcesoDoctorDto, 'nombres' | 'apellidos' | 'especialidad'>
>;

@Injectable()
export class DoctoresV2Service {
  private readonly logger = new Logger(DoctoresV2Service.name);
  private readonly siguienteApiUrl = process.env.SIGUIENTE_API_URL ?? '';

  constructor(private readonly prisma: PrismaService) {}

  async procesarMensaje(dto: ProcesoDoctorDto) {
    const doctorExistente = await this.prisma.doctor.findUnique({
      where: { documento: dto.documento },
    });

    let doctor = doctorExistente;

    if (!doctor) {
      this.validarDatosDoctorNuevo(dto);
      doctor = await this.crearDoctor(dto);
    }

    const payload = {
      name: dto.name,
      jsonDoctor: {
        documento: doctor.documento,
        nombres: doctor.nombres,
        apellidos: doctor.apellidos,
        especialidad: doctor.especialidad,
        duracionCitaMinutos: doctor.duracionCitaMin,
      },
    };

    if (this.siguienteApiUrl) {
      return await this.llamarSiguienteApi(payload);
    }

    this.logger.warn(
      'SIGUIENTE_API_URL no configurada. Retornando respuesta local.',
    );
    return payload;
  }

  private validarDatosDoctorNuevo(
    dto: ProcesoDoctorDto,
  ): asserts dto is ProcesoDoctorDto & DatosDoctorNuevo {
    const camposFaltantes = [
      ['nombres', dto.nombres],
      ['apellidos', dto.apellidos],
      ['especialidad', dto.especialidad],
    ]
      .filter(([, valor]) => !valor?.trim())
      .map(([campo]) => campo);

    if (camposFaltantes.length > 0) {
      throw new BadRequestException(
        `Para crear un doctor nuevo debe enviar: ${camposFaltantes.join(', ')}.`,
      );
    }
  }

  private crearDoctor(dto: ProcesoDoctorDto & DatosDoctorNuevo) {
    return this.prisma.doctor.create({
      data: {
        documento: dto.documento,
        nombres: dto.nombres,
        apellidos: dto.apellidos,
        especialidad: dto.especialidad,
        duracionCitaMin: dto.duracionCitaMinutos ?? 30,
      },
    });
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
