import { Test, TestingModule } from '@nestjs/testing';
import { DoctoresService } from './doctores.service';
import { PrismaService } from '../prisma/prisma.service';
import { prismaMock } from '../prisma/prisma.mock';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('DoctoresService', () => {
  let service: DoctoresService;

  beforeEach(async () => {
    Object.values(prismaMock.doctor).forEach((fn) => fn.mockReset());
    Object.values(prismaMock.cita).forEach((fn) => fn.mockReset());

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DoctoresService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<DoctoresService>(DoctoresService);
  });

  // ── findAll ──────────────────────────────────────────────────────────────
  it('findAll should return doctores list', async () => {
    prismaMock.doctor.findMany.mockResolvedValue([{ id: '1' }]);

    const result = await service.findAll();

    expect(result).toEqual([{ id: '1' }]);
    expect(prismaMock.doctor.findMany).toHaveBeenCalledTimes(1);
  });

  // ── findOne ───────────────────────────────────────────────────────────────
  it('findOne should return doctor if exists', async () => {
    prismaMock.doctor.findUnique.mockResolvedValue({ id: 'd1' });

    const result = await service.findOne('d1');

    expect(result).toEqual({ id: 'd1' });
  });

  it('findOne should throw NotFoundException if doctor does not exist', async () => {
    prismaMock.doctor.findUnique.mockResolvedValue(null);

    await expect(service.findOne('nope')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  // ── create ────────────────────────────────────────────────────────────────
  it('create should create doctor successfully', async () => {
    prismaMock.doctor.create.mockResolvedValue({ id: '1', documento: '90001' });

    const result = await service.create({
      documento: '90001',
      nombres: 'Ana',
      apellidos: 'Gomez',
      especialidad: 'Medicina General',
      duracionCitaMin: 30,
    });

    expect(prismaMock.doctor.create).toHaveBeenCalled();
    expect(result).toEqual({ id: '1', documento: '90001' });
  });

  it('create should throw BadRequestException on unique constraint (P2002)', async () => {
    prismaMock.doctor.create.mockRejectedValue({ code: 'P2002' });

    await expect(
      service.create({
        documento: '90001',
        nombres: 'Ana',
        apellidos: 'Gomez',
        especialidad: 'Medicina General',
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('create should rethrow unknown errors', async () => {
    const unknownError = new Error('DB connection error');
    prismaMock.doctor.create.mockRejectedValue(unknownError);

    await expect(
      service.create({
        documento: '1',
        nombres: 'X',
        apellidos: 'Y',
        especialidad: 'Z',
      } as any),
    ).rejects.toThrow('DB connection error');
  });

  // ── update ────────────────────────────────────────────────────────────────
  it('updateByDocumento should update doctor successfully', async () => {
    prismaMock.doctor.update.mockResolvedValue({
      id: 'd1',
      documento: '90001',
      especialidad: 'Cardiologia',
    });

    const result = await service.updateByDocumento('90001', {
      especialidad: 'Cardiologia',
    });

    expect(prismaMock.doctor.update).toHaveBeenCalledWith({
      where: { documento: '90001' },
      data: { especialidad: 'Cardiologia' },
    });
    expect(result).toEqual({
      id: 'd1',
      documento: '90001',
      especialidad: 'Cardiologia',
    });
  });

  it('updateByDocumento should throw NotFoundException if doctor does not exist', async () => {
    prismaMock.doctor.update.mockRejectedValue({ code: 'P2025' });

    await expect(
      service.updateByDocumento('nope', { especialidad: 'Nueva' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('updateByDocumento should throw BadRequestException on P2002 during update', async () => {
    prismaMock.doctor.update.mockRejectedValue({ code: 'P2002' });

    await expect(
      service.updateByDocumento('90001', { documento: 'duplicado' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('updateByDocumento should rethrow unknown errors during update', async () => {
    prismaMock.doctor.update.mockRejectedValue(new Error('DB error'));

    await expect(
      service.updateByDocumento('90001', { especialidad: 'X' }),
    ).rejects.toThrow('DB error');
  });

  // ── remove ────────────────────────────────────────────────────────────────
  it('remove should delete doctor', async () => {
    prismaMock.doctor.findUnique.mockResolvedValue({ id: 'd1' });
    prismaMock.doctor.delete.mockResolvedValue({ id: 'd1' });

    const result = await service.remove('d1');

    expect(prismaMock.doctor.delete).toHaveBeenCalledWith({
      where: { id: 'd1' },
    });
    expect(result).toEqual({ id: 'd1' });
  });

  it('remove should throw NotFoundException if doctor does not exist', async () => {
    prismaMock.doctor.findUnique.mockResolvedValue(null);

    await expect(service.remove('nope')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  // ── getCitasByDoctor ──────────────────────────────────────────────────────
  it('getCitasByDoctor should return citas of doctor', async () => {
    prismaMock.doctor.findUnique.mockResolvedValue({ id: 'd1' });
    prismaMock.cita.findMany.mockResolvedValue([{ id: 'c1', doctorId: 'd1' }]);

    const result = await service.getCitasByDoctor('d1');

    expect(prismaMock.cita.findMany).toHaveBeenCalledWith({
      where: { doctorId: 'd1' },
      orderBy: { fechaInicio: 'asc' },
      include: { paciente: true },
    });
    expect(result).toEqual([{ id: 'c1', doctorId: 'd1' }]);
  });

  it('getCitasByDoctor should throw NotFoundException if doctor does not exist', async () => {
    prismaMock.doctor.findUnique.mockResolvedValue(null);

    await expect(service.getCitasByDoctor('nope')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
