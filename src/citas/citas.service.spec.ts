import { Test, TestingModule } from '@nestjs/testing';
import { CitasService } from './citas.service';
import { PrismaService } from '../prisma/prisma.service';
import { prismaMock } from '../prisma/prisma.mock';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EstadoCita } from '@prisma/client';

describe('CitasService', () => {
  let service: CitasService;

  beforeEach(async () => {
    Object.values(prismaMock.cita).forEach((fn) => fn.mockReset());
    Object.values(prismaMock.paciente).forEach((fn) => fn.mockReset());
    Object.values(prismaMock.doctor).forEach((fn) => fn.mockReset());

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CitasService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<CitasService>(CitasService);
  });

  // ── findAll ───────────────────────────────────────────────────────────────
  it('findAll should return citas list (with include)', async () => {
    prismaMock.cita.findMany.mockResolvedValue([{ id: 'c1' }]);

    const result = await service.findAll();

    expect(result).toEqual([{ id: 'c1' }]);
    expect(prismaMock.cita.findMany).toHaveBeenCalledTimes(1);
  });

  // ── findOne ───────────────────────────────────────────────────────────────
  it('findOne should return cita if exists', async () => {
    prismaMock.cita.findUnique.mockResolvedValue({ id: 'c1' });

    const result = await service.findOne('c1');

    expect(result).toEqual({ id: 'c1' });
  });

  it('findOne should throw NotFoundException if cita does not exist', async () => {
    prismaMock.cita.findUnique.mockResolvedValue(null);

    await expect(service.findOne('nope')).rejects.toBeInstanceOf(NotFoundException);
  });

  // ── create ────────────────────────────────────────────────────────────────
  it('create should throw BadRequestException if fechaFin <= fechaInicio', async () => {
    await expect(
      service.create({
        pacienteId: 'p1',
        doctorId: 'd1',
        fechaInicio: '2026-03-01T10:00:00.000Z',
        fechaFin: '2026-03-01T10:00:00.000Z',
        motivo: 'Consulta',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('create should throw BadRequestException if fechas are invalid', async () => {
    await expect(
      service.create({
        pacienteId: 'p1',
        doctorId: 'd1',
        fechaInicio: 'not-a-date',
        fechaFin: 'also-not-a-date',
        motivo: 'Consulta',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('create should throw NotFoundException if paciente does not exist', async () => {
    prismaMock.paciente.findUnique.mockResolvedValue(null);
    prismaMock.doctor.findUnique.mockResolvedValue({ id: 'd1' });

    await expect(
      service.create({
        pacienteId: 'p1',
        doctorId: 'd1',
        fechaInicio: '2026-03-01T10:00:00.000Z',
        fechaFin: '2026-03-01T10:30:00.000Z',
        motivo: 'Consulta',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('create should throw NotFoundException if doctor does not exist', async () => {
    prismaMock.paciente.findUnique.mockResolvedValue({ id: 'p1' });
    prismaMock.doctor.findUnique.mockResolvedValue(null);

    await expect(
      service.create({
        pacienteId: 'p1',
        doctorId: 'd1',
        fechaInicio: '2026-03-01T10:00:00.000Z',
        fechaFin: '2026-03-01T10:30:00.000Z',
      } as any),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('create should throw BadRequestException if doctor schedule overlaps', async () => {
    prismaMock.paciente.findUnique.mockResolvedValue({ id: 'p1' });
    prismaMock.doctor.findUnique.mockResolvedValue({ id: 'd1' });
    prismaMock.cita.findFirst.mockResolvedValue({ id: 'existing' });

    await expect(
      service.create({
        pacienteId: 'p1',
        doctorId: 'd1',
        fechaInicio: '2026-03-01T10:00:00.000Z',
        fechaFin: '2026-03-01T10:30:00.000Z',
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('create should create cita if valid and no overlap', async () => {
    prismaMock.paciente.findUnique.mockResolvedValue({ id: 'p1' });
    prismaMock.doctor.findUnique.mockResolvedValue({ id: 'd1' });
    prismaMock.cita.findFirst.mockResolvedValue(null);
    prismaMock.cita.create.mockResolvedValue({ id: 'c1' });

    const result = await service.create({
      pacienteId: 'p1',
      doctorId: 'd1',
      fechaInicio: '2026-03-01T10:00:00.000Z',
      fechaFin: '2026-03-01T10:30:00.000Z',
      motivo: 'Consulta',
    });

    expect(prismaMock.cita.create).toHaveBeenCalled();
    expect(result).toEqual({ id: 'c1' });
  });

  // ── update ────────────────────────────────────────────────────────────────
  it('update should update cita motivo without changing dates', async () => {
    const existingCita = {
      id: 'c1',
      doctorId: 'd1',
      pacienteId: 'p1',
      fechaInicio: new Date('2026-03-01T10:00:00.000Z'),
      fechaFin: new Date('2026-03-01T10:30:00.000Z'),
    };
    // findOne (llamado 2 veces: una en update, otra para overlap)
    prismaMock.cita.findUnique.mockResolvedValue(existingCita);
    prismaMock.cita.findFirst.mockResolvedValue(null); // no overlap
    prismaMock.cita.update.mockResolvedValue({ ...existingCita, motivo: 'Nuevo motivo' });

    const result = await service.update('c1', { motivo: 'Nuevo motivo' });

    expect(result.motivo).toBe('Nuevo motivo');
  });

  it('update should validate dates when both are provided', async () => {
    const existingCita = {
      id: 'c1',
      doctorId: 'd1',
      pacienteId: 'p1',
      fechaInicio: new Date('2026-03-01T10:00:00.000Z'),
      fechaFin: new Date('2026-03-01T10:30:00.000Z'),
    };
    prismaMock.cita.findUnique.mockResolvedValue(existingCita);

    await expect(
      service.update('c1', {
        fechaInicio: '2026-03-01T11:00:00.000Z',
        fechaFin: '2026-03-01T10:00:00.000Z', // fin antes que inicio
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('update should validate paciente/doctor existence if changed', async () => {
    const existingCita = {
      id: 'c1',
      doctorId: 'd1',
      pacienteId: 'p1',
      fechaInicio: new Date('2026-03-01T10:00:00.000Z'),
      fechaFin: new Date('2026-03-01T10:30:00.000Z'),
    };
    // findOne pasa, pero findUnique para paciente/doctor retorna null
    prismaMock.cita.findUnique.mockResolvedValue(existingCita);
    prismaMock.paciente.findUnique.mockResolvedValue(null);
    prismaMock.doctor.findUnique.mockResolvedValue({ id: 'd2' });

    await expect(
      service.update('c1', { pacienteId: 'p-nuevo' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('update should throw NotFoundException if cita does not exist', async () => {
    prismaMock.cita.findUnique.mockResolvedValue(null);

    await expect(service.update('nope', { motivo: 'X' })).rejects.toBeInstanceOf(NotFoundException);
  });

  it('update should throw BadRequestException if overlap with another cita', async () => {
    const existingCita = {
      id: 'c1',
      doctorId: 'd1',
      pacienteId: 'p1',
      fechaInicio: new Date('2026-03-01T10:00:00.000Z'),
      fechaFin: new Date('2026-03-01T10:30:00.000Z'),
    };
    prismaMock.cita.findUnique.mockResolvedValue(existingCita);
    prismaMock.cita.findFirst.mockResolvedValue({ id: 'c2' }); // overlap encontrado

    await expect(
      service.update('c1', { motivo: 'Reprogramar' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  // ── updateEstado ──────────────────────────────────────────────────────────
  it('updateEstado should update cita estado', async () => {
    prismaMock.cita.findUnique.mockResolvedValue({ id: 'c1' });
    prismaMock.cita.update.mockResolvedValue({ id: 'c1', estado: EstadoCita.CANCELADA });

    const result = await service.updateEstado('c1', { estado: EstadoCita.CANCELADA });

    expect(prismaMock.cita.update).toHaveBeenCalled();
    expect(result).toEqual({ id: 'c1', estado: EstadoCita.CANCELADA });
  });

  it('updateEstado should throw NotFoundException if cita does not exist', async () => {
    prismaMock.cita.findUnique.mockResolvedValue(null);

    await expect(service.updateEstado('nope', { estado: EstadoCita.CANCELADA })).rejects.toBeInstanceOf(NotFoundException);
  });

  // ── remove ────────────────────────────────────────────────────────────────
  it('remove should delete cita', async () => {
    prismaMock.cita.findUnique.mockResolvedValue({ id: 'c1' });
    prismaMock.cita.delete.mockResolvedValue({ id: 'c1' });

    const result = await service.remove('c1');

    expect(prismaMock.cita.delete).toHaveBeenCalledWith({ where: { id: 'c1' } });
    expect(result).toEqual({ id: 'c1' });
  });

  it('remove should throw NotFoundException if cita does not exist', async () => {
    prismaMock.cita.findUnique.mockResolvedValue(null);

    await expect(service.remove('nope')).rejects.toBeInstanceOf(NotFoundException);
  });
});