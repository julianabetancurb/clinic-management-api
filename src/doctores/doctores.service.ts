import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';

@Injectable()
export class DoctoresService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDoctorDto) {
    try {
      return await this.prisma.doctor.create({ data: dto });
    } catch (err: any) {
      if (err?.code === 'P2002') {
        throw new BadRequestException('Ya existe un doctor con ese documento.');
      }
      throw err;
    }
  }

  async findAll() {
    return this.prisma.doctor.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const doctor = await this.prisma.doctor.findUnique({ where: { id } });
    if (!doctor) throw new NotFoundException('Doctor no encontrado.');
    return doctor;
  }

  async updateByDocumento(documento: string, dto: UpdateDoctorDto) {
    try {
      return await this.prisma.doctor.update({
        where: { documento },
        data: dto,
      });
    } catch (err: any) {
      if (err?.code === 'P2025') {
        throw new NotFoundException('No existe un doctor con ese documento.');
      }
      if (err?.code === 'P2002') {
        throw new BadRequestException('Ya existe un doctor con ese documento.');
      }
      throw err;
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.doctor.delete({ where: { id } });
  }

  async getCitasByDoctor(id: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor no encontrado.');
    }

    return this.prisma.cita.findMany({
      where: { doctorId: id },
      orderBy: { fechaInicio: 'asc' },
      include: {
        paciente: true,
      },
    });
  }
}
