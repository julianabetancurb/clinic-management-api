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

  it('findAll should return citas list (with include)', async () => {
    prismaMock.cita.findMany.mockResolvedValue([{ id: 'c1' }]);

    const result = await service.findAll();

    expect(result).toEqual([{ id: 'c1' }]);
    expect(prismaMock.cita.findMany).toHaveBeenCalledTimes(1);
  });

  it('findOne should throw NotFoundException if cita does not exist', async () => {
    prismaMock.cita.findUnique.mockResolvedValue(null);

    await expect(service.findOne('nope')).rejects.toBeInstanceOf(NotFoundException);
  });

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
    prismaMock.cita.findFirst.mockResolvedValue({ id: 'existing' }); // overlap found

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
    prismaMock.cita.findFirst.mockResolvedValue(null); // no overlap
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

  it('updateEstado should update cita estado', async () => {
    prismaMock.cita.findUnique.mockResolvedValue({ id: 'c1' });
    prismaMock.cita.update.mockResolvedValue({ id: 'c1', estado: EstadoCita.CANCELADA });

    const result = await service.updateEstado('c1', { estado: EstadoCita.CANCELADA });

    expect(prismaMock.cita.update).toHaveBeenCalled();
    expect(result).toEqual({ id: 'c1', estado: EstadoCita.CANCELADA });
  });

  it('remove should delete cita', async () => {
    prismaMock.cita.findUnique.mockResolvedValue({ id: 'c1' });
    prismaMock.cita.delete.mockResolvedValue({ id: 'c1' });

    const result = await service.remove('c1');

    expect(prismaMock.cita.delete).toHaveBeenCalledWith({ where: { id: 'c1' } });
    expect(result).toEqual({ id: 'c1' });
  });
});