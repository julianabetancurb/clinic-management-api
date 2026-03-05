import { Test, TestingModule } from '@nestjs/testing';
import { CitasController } from './citas.controller';
import { CitasService } from './citas.service';
import { EstadoCita } from '@prisma/client';

const mockCitasService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  updateEstado: jest.fn(),
  remove: jest.fn(),
};

describe('CitasController', () => {
  let controller: CitasController;
  let service: CitasService;

  beforeEach(async () => {
    Object.values(mockCitasService).forEach((fn) => fn.mockReset());

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CitasController],
      providers: [{ provide: CitasService, useValue: mockCitasService }],
    }).compile();

    controller = module.get<CitasController>(CitasController);
    service = module.get<CitasService>(CitasService);
  });

  it('should be defined', () => {
      //fail('test fallido a propósito');

    expect(controller).toBeDefined();
 
  });

  describe('create', () => {
    it('should call service.create and return result', async () => {
      const dto = {
        pacienteId: 'p1',
        doctorId: 'd1',
        fechaInicio: '2026-03-01T10:00:00.000Z',
        fechaFin: '2026-03-01T10:30:00.000Z',
        motivo: 'Consulta',
      };
      const result = { id: 'c1', ...dto };
      mockCitasService.create.mockResolvedValue(result);

      expect(await controller.create(dto as any)).toBe(result);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return all citas', async () => {
      const result = [{ id: 'c1' }, { id: 'c2' }];
      mockCitasService.findAll.mockResolvedValue(result);

      expect(await controller.findAll()).toBe(result);
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return one cita by id', async () => {
      const result = { id: 'c1' };
      mockCitasService.findOne.mockResolvedValue(result);

      expect(await controller.findOne('c1')).toBe(result);
      expect(service.findOne).toHaveBeenCalledWith('c1');
    });

    it('should propagate NotFoundException from service', async () => {
      mockCitasService.findOne.mockRejectedValue(new Error('Cita no encontrada.'));

      await expect(controller.findOne('nope')).rejects.toThrow('Cita no encontrada.');
    });
  });

  describe('update', () => {
    it('should call service.update and return result', async () => {
      const dto = { motivo: 'Nuevo motivo' };
      const result = { id: 'c1', ...dto };
      mockCitasService.update.mockResolvedValue(result);

      expect(await controller.update('c1', dto as any)).toBe(result);
      expect(service.update).toHaveBeenCalledWith('c1', dto);
    });
  });

  describe('updateEstado', () => {
    it('should call service.updateEstado and return result', async () => {
      const dto = { estado: EstadoCita.CANCELADA };
      const result = { id: 'c1', estado: EstadoCita.CANCELADA };
      mockCitasService.updateEstado.mockResolvedValue(result);

      expect(await controller.updateEstado('c1', dto as any)).toBe(result);
      expect(service.updateEstado).toHaveBeenCalledWith('c1', dto);
    });
  });

  describe('remove', () => {
    it('should call service.remove and return deleted cita', async () => {
      const result = { id: 'c1' };
      mockCitasService.remove.mockResolvedValue(result);

      expect(await controller.remove('c1')).toBe(result);
      expect(service.remove).toHaveBeenCalledWith('c1');
    });
  });
});
