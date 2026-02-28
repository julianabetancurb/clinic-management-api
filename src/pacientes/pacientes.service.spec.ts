import { Test, TestingModule } from '@nestjs/testing';
import { PacientesService } from './pacientes.service';
import { PrismaService } from '../prisma/prisma.service';
import { prismaMock } from '../prisma/prisma.mock';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('PacientesService', () => {
  let service: PacientesService;

  beforeEach(async () => {
    // Limpia llamadas entre tests
    Object.values(prismaMock.paciente).forEach((fn) => fn.mockReset());

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PacientesService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<PacientesService>(PacientesService);
  });

  it('findAll should return pacientes list', async () => {
    prismaMock.paciente.findMany.mockResolvedValue([{ id: '1' }]);

    const result = await service.findAll();

    expect(result).toEqual([{ id: '1' }]);
    expect(prismaMock.paciente.findMany).toHaveBeenCalledTimes(1);
  });

  it('findOne should throw NotFoundException if paciente does not exist', async () => {
    prismaMock.paciente.findUnique.mockResolvedValue(null);

    await expect(service.findOne('nope')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('create should create paciente', async () => {
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

  it('update should throw NotFoundException if paciente does not exist', async () => {
    prismaMock.paciente.findUnique.mockResolvedValue(null);

    await expect(service.update('id', { nombres: 'New' })).rejects.toBeInstanceOf(NotFoundException);
  });

  it('remove should delete paciente', async () => {
    prismaMock.paciente.findUnique.mockResolvedValue({ id: '1' });
    prismaMock.paciente.delete.mockResolvedValue({ id: '1' });

    const result = await service.remove('1');

    expect(prismaMock.paciente.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    expect(result).toEqual({ id: '1' });
  });
});