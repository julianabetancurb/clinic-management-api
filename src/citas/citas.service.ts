import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCitaDto } from './dto/create-cita.dto';
import { UpdateCitaDto } from './dto/update-cita.dto';
import { UpdateEstadoCitaDto } from './dto/update-estado-cita.dto';

@Injectable()
export class CitasService {
  constructor(private readonly prisma: PrismaService) {}

  private assertValidDates(fechaInicio: Date, fechaFin: Date) {
    if (Number.isNaN(fechaInicio.getTime()) || Number.isNaN(fechaFin.getTime())) {
      throw new BadRequestException('Fechas inválidas.');
    }
    if (fechaFin <= fechaInicio) {
      throw new BadRequestException('fechaFin debe ser mayor que fechaInicio.');
    }
  }

  private async ensurePacienteDoctorExist(pacienteId: string, doctorId: string) {
    const [paciente, doctor] = await Promise.all([
      this.prisma.paciente.findUnique({ where: { id: pacienteId } }),
      this.prisma.doctor.findUnique({ where: { id: doctorId } }),
    ]);
    if (!paciente) throw new NotFoundException('Paciente no encontrado.');
    if (!doctor) throw new NotFoundException('Doctor no encontrado.');
  }

  // Opcional pro: evitar solapamiento de citas del mismo doctor
  private async ensureNoOverlap(doctorId: string, fechaInicio: Date, fechaFin: Date, excludeId?: string) {
    const overlap = await this.prisma.cita.findFirst({
      where: {
        doctorId,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
        // overlap if start < existingEnd AND end > existingStart
        fechaInicio: { lt: fechaFin },
        fechaFin: { gt: fechaInicio },
      },
    });
    if (overlap) {
      throw new BadRequestException('El doctor ya tiene una cita en ese horario.');
    }
  }

  async create(dto: CreateCitaDto) {
    const fechaInicio = new Date(dto.fechaInicio);
    const fechaFin = new Date(dto.fechaFin);
    this.assertValidDates(fechaInicio, fechaFin);

    await this.ensurePacienteDoctorExist(dto.pacienteId, dto.doctorId);
    await this.ensureNoOverlap(dto.doctorId, fechaInicio, fechaFin);

    return this.prisma.cita.create({
      data: {
        pacienteId: dto.pacienteId,
        doctorId: dto.doctorId,
        fechaInicio,
        fechaFin,
        motivo: dto.motivo,
      },
      include: { paciente: true, doctor: true },
    });
  }

  async findAll() {
    return this.prisma.cita.findMany({
      orderBy: { fechaInicio: 'asc' },
      include: { paciente: true, doctor: true },
    });
  }

  async findOne(id: string) {
    const cita = await this.prisma.cita.findUnique({
      where: { id },
      include: { paciente: true, doctor: true },
    });
    if (!cita) throw new NotFoundException('Cita no encontrada.');
    return cita;
  }

  async update(id: string, dto: UpdateCitaDto) {
    await this.findOne(id);

    const fechaInicio = dto.fechaInicio ? new Date(dto.fechaInicio) : undefined;
    const fechaFin = dto.fechaFin ? new Date(dto.fechaFin) : undefined;

    if (fechaInicio && fechaFin) this.assertValidDates(fechaInicio, fechaFin);

    const pacienteId = dto.pacienteId;
    const doctorId = dto.doctorId;

    if (pacienteId || doctorId) {
      // si cambia alguno, valida existencia con los valores finales
      const current = await this.prisma.cita.findUnique({ where: { id } });
      if (!current) throw new NotFoundException('Cita no encontrada.');

      await this.ensurePacienteDoctorExist(pacienteId ?? current.pacienteId, doctorId ?? current.doctorId);
    }

    // si cambia horario o doctor, valida solapamiento
    const current = await this.prisma.cita.findUnique({ where: { id } });
    if (!current) throw new NotFoundException('Cita no encontrada.');

    const finalDoctorId = doctorId ?? current.doctorId;
    const finalInicio = fechaInicio ?? current.fechaInicio;
    const finalFin = fechaFin ?? current.fechaFin;

    await this.ensureNoOverlap(finalDoctorId, finalInicio, finalFin, id);

    return this.prisma.cita.update({
      where: { id },
      data: {
        pacienteId,
        doctorId,
        fechaInicio: fechaInicio ? fechaInicio : undefined,
        fechaFin: fechaFin ? fechaFin : undefined,
        motivo: dto.motivo,
      },
      include: { paciente: true, doctor: true },
    });
  }

  async updateEstado(id: string, dto: UpdateEstadoCitaDto) {
    await this.findOne(id);
    return this.prisma.cita.update({
      where: { id },
      data: { estado: dto.estado },
      include: { paciente: true, doctor: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.cita.delete({ where: { id } });
  }
}