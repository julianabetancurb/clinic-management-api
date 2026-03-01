import { Test, TestingModule } from '@nestjs/testing';
import { PacientesService } from './pacientes.service';
import { PrismaService } from '../prisma/prisma.service';
import { prismaMock } from '../prisma/prisma.mock';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('PacientesService', () => {
  let service: PacientesService;

  beforeEach(async () => {
    Object.values(prismaMock.paciente).forEach((fn) => fn.mockReset());
    Object.values(prismaMock.cita).forEach((fn) => fn.mockReset());

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PacientesService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<PacientesService>(PacientesService);
  });

  // ── findAll ───────────────────────────────────────────────────────────────
  it('findAll should return pacientes list', async () => {
    prismaMock.paciente.findMany.mockResolvedValue([{ id: '1' }]);

    const result = await service.findAll();

    expect(result).toEqual([{ id: '1' }]);
    expect(prismaMock.paciente.findMany).toHaveBeenCalledTimes(1);
  });

  // ── findOne ───────────────────────────────────────────────────────────────
  it('findOne should return paciente if exists', async () => {
    prismaMock.paciente.findUnique.mockResolvedValue({ id: 'p1' });

    const result = await service.findOne('p1');

    expect(result).toEqual({ id: 'p1' });
  });

  it('findOne should throw NotFoundException if paciente does not exist', async () => {
    prismaMock.paciente.findUnique.mockResolvedValue(null);

    await expect(service.findOne('nope')).rejects.toBeInstanceOf(NotFoundException);
  });

  // ── create ────────────────────────────────────────────────────────────────
  it('create should create paciente successfully', async () => {
    prismaMock.paciente.create.mockResolvedValue({ id: '1', documento: '123' });

    const result = await service.create({
      documento: '123',
      nombres: 'Ana',
      apellidos: 'Gomez',
      telefono: '300',
      email: 'ana@mail.com',
    });

    expect(prismaMock.paciente.create).toHaveBeenCalled();
    expect(result).toEqual({ id: '1', documento: '123' });
  });

  it('create should throw BadRequestException on unique constraint (P2002)', async () => {
    prismaMock.paciente.create.mockRejectedValue({ code: 'P2002' });

    await expect(
      service.create({
        documento: '123',
        nombres: 'Ana',
        apellidos: 'Gomez',
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('create should rethrow unknown errors', async () => {
    const unknownError = new Error('DB connection error');
    prismaMock.paciente.create.mockRejectedValue(unknownError);

    await expect(
      service.create({ documento: '1', nombres: 'X', apellidos: 'Y' } as any),
    ).rejects.toThrow('DB connection error');
  });

  // ── update ────────────────────────────────────────────────────────────────
  it('update should update paciente successfully', async () => {
    prismaMock.paciente.findUnique.mockResolvedValue({ id: 'p1' });
    prismaMock.paciente.update.mockResolvedValue({ id: 'p1', telefono: '310' });

    const result = await service.update('p1', { telefono: '310' });

    expect(prismaMock.paciente.update).toHaveBeenCalledWith({
      where: { id: 'p1' },
      data: { telefono: '310' },
    });
    expect(result).toEqual({ id: 'p1', telefono: '310' });
  });

  it('update should throw NotFoundException if paciente does not exist', async () => {
    prismaMock.paciente.findUnique.mockResolvedValue(null);

    await expect(service.update('nope', { nombres: 'New' })).rejects.toBeInstanceOf(NotFoundException);
  });

  it('update should throw BadRequestException on P2002 during update', async () => {
    prismaMock.paciente.findUnique.mockResolvedValue({ id: 'p1' });
    prismaMock.paciente.update.mockRejectedValue({ code: 'P2002' });

    await expect(service.update('p1', { documento: 'duplicado' })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('update should rethrow unknown errors during update', async () => {
    prismaMock.paciente.findUnique.mockResolvedValue({ id: 'p1' });
    prismaMock.paciente.update.mockRejectedValue(new Error('DB error'));

    await expect(service.update('p1', { nombres: 'X' })).rejects.toThrow('DB error');
  });

  // ── remove ────────────────────────────────────────────────────────────────
  it('remove should delete paciente', async () => {
    prismaMock.paciente.findUnique.mockResolvedValue({ id: 'p1' });
    prismaMock.paciente.delete.mockResolvedValue({ id: 'p1' });

    const result = await service.remove('p1');

    expect(prismaMock.paciente.delete).toHaveBeenCalledWith({ where: { id: 'p1' } });
    expect(result).toEqual({ id: 'p1' });
  });

  it('remove should throw NotFoundException if paciente does not exist', async () => {
    prismaMock.paciente.findUnique.mockResolvedValue(null);

    await expect(service.remove('nope')).rejects.toBeInstanceOf(NotFoundException);
  });

  // ── getCitasByPaciente ────────────────────────────────────────────────────
  it('getCitasByPaciente should return citas of paciente', async () => {
    prismaMock.paciente.findUnique.mockResolvedValue({ id: 'p1' });
    prismaMock.cita.findMany.mockResolvedValue([{ id: 'c1', pacienteId: 'p1' }]);

    const result = await service.getCitasByPaciente('p1');

    expect(prismaMock.cita.findMany).toHaveBeenCalledWith({
      where: { pacienteId: 'p1' },
      orderBy: { fechaInicio: 'asc' },
      include: { doctor: true },
    });
    expect(result).toEqual([{ id: 'c1', pacienteId: 'p1' }]);
  });

  it('getCitasByPaciente should throw NotFoundException if paciente does not exist', async () => {
    prismaMock.paciente.findUnique.mockResolvedValue(null);

    await expect(service.getCitasByPaciente('nope')).rejects.toBeInstanceOf(NotFoundException);
  });
});