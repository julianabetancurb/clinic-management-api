import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePacienteDto } from './dto/create-paciente.dto';
import { UpdatePacienteDto } from './dto/update-paciente.dto';

@Injectable()
export class PacientesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePacienteDto) {
    try {
      return await this.prisma.paciente.create({ data: dto });
    } catch (err: any) {
      // Unique constraint (documento)
      if (err?.code === 'P2002') {
        throw new BadRequestException('Ya existe un paciente con ese documento.');
      }
      throw err;
    }
  }

  async findAll() {
    return this.prisma.paciente.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const paciente = await this.prisma.paciente.findUnique({ where: { id } });
    if (!paciente) throw new NotFoundException('Paciente no encontrado.');
    return paciente;
  }

  async update(id: string, dto: UpdatePacienteDto) {
    await this.findOne(id);
    try {
      return await this.prisma.paciente.update({
        where: { id },
        data: dto,
      });
    } catch (err: any) {
      if (err?.code === 'P2002') {
        throw new BadRequestException('Documento ya está en uso por otro paciente.');
      }
      throw err;
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.paciente.delete({ where: { id } });
  }
}