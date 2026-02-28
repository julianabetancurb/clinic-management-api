import { Test, TestingModule } from '@nestjs/testing';
import { DoctoresService } from './doctores.service';
import { PrismaService } from '../prisma/prisma.service';
import { prismaMock } from '../prisma/prisma.mock';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('DoctoresService', () => {
  let service: DoctoresService;

  beforeEach(async () => {
    Object.values(prismaMock.doctor).forEach((fn) => fn.mockReset());

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DoctoresService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<DoctoresService>(DoctoresService);
  });

  it('findAll should return doctores list', async () => {
    prismaMock.doctor.findMany.mockResolvedValue([{ id: '1' }]);

    const result = await service.findAll();

    expect(result).toEqual([{ id: '1' }]);
    expect(prismaMock.doctor.findMany).toHaveBeenCalledTimes(1);
  });

  it('findOne should throw NotFoundException if doctor does not exist', async () => {
    prismaMock.doctor.findUnique.mockResolvedValue(null);

    await expect(service.findOne('nope')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('create should create doctor', async () => {
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

  it('update should throw NotFoundException if doctor does not exist', async () => {
    prismaMock.doctor.findUnique.mockResolvedValue(null);

    await expect(service.update('id', { especialidad: 'Nueva' })).rejects.toBeInstanceOf(NotFoundException);
  });

  it('remove should delete doctor', async () => {
    prismaMock.doctor.findUnique.mockResolvedValue({ id: '1' });
    prismaMock.doctor.delete.mockResolvedValue({ id: '1' });

    const result = await service.remove('1');

    expect(prismaMock.doctor.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    expect(result).toEqual({ id: '1' });
  });
});
