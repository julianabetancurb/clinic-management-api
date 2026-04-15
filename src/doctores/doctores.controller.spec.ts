import { Test, TestingModule } from '@nestjs/testing';
import { DoctoresController } from './doctores.controller';
import { DoctoresService } from './doctores.service';

const mockDoctoresService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  updateByDocumento: jest.fn(),
  remove: jest.fn(),
  getCitasByDoctor: jest.fn(),
};

describe('DoctoresController', () => {
  let controller: DoctoresController;
  let service: DoctoresService;

  beforeEach(async () => {
    Object.values(mockDoctoresService).forEach((fn) => fn.mockReset());

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DoctoresController],
      providers: [{ provide: DoctoresService, useValue: mockDoctoresService }],
    }).compile();

    controller = module.get<DoctoresController>(DoctoresController);
    service = module.get<DoctoresService>(DoctoresService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create and return result', async () => {
      const dto = {
        documento: '90001',
        nombres: 'Ana',
        apellidos: 'Gomez',
        especialidad: 'Medicina General',
        duracionCitaMin: 30,
      };
      const result = { id: 'd1', ...dto };
      mockDoctoresService.create.mockResolvedValue(result);

      expect(await controller.create(dto as any)).toBe(result);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return all doctores', async () => {
      const result = [{ id: 'd1' }, { id: 'd2' }];
      mockDoctoresService.findAll.mockResolvedValue(result);

      expect(await controller.findAll()).toBe(result);
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return one doctor by id', async () => {
      const result = { id: 'd1' };
      mockDoctoresService.findOne.mockResolvedValue(result);

      expect(await controller.findOne('d1')).toBe(result);
      expect(service.findOne).toHaveBeenCalledWith('d1');
    });

    it('should propagate NotFoundException from service', async () => {
      mockDoctoresService.findOne.mockRejectedValue(
        new Error('Doctor no encontrado.'),
      );

      await expect(controller.findOne('nope')).rejects.toThrow(
        'Doctor no encontrado.',
      );
    });
  });

  describe('update', () => {
    it('should call service.updateByDocumento and return result', async () => {
      const dto = { especialidad: 'Cardiologia' };
      const result = { id: 'd1', documento: '90001', ...dto };
      mockDoctoresService.updateByDocumento.mockResolvedValue(result);

      expect(await controller.update('90001', dto as any)).toBe(result);
      expect(service.updateByDocumento).toHaveBeenCalledWith('90001', dto);
    });
  });

  describe('remove', () => {
    it('should call service.remove and return deleted doctor', async () => {
      const result = { id: 'd1' };
      mockDoctoresService.remove.mockResolvedValue(result);

      expect(await controller.remove('d1')).toBe(result);
      expect(service.remove).toHaveBeenCalledWith('d1');
    });
  });

  describe('getCitas', () => {
    it('should return citas of a doctor', async () => {
      const result = [{ id: 'c1', doctorId: 'd1' }];
      mockDoctoresService.getCitasByDoctor.mockResolvedValue(result);

      expect(await controller.getCitas('d1')).toBe(result);
      expect(service.getCitasByDoctor).toHaveBeenCalledWith('d1');
    });

    it('should propagate NotFoundException if doctor does not exist', async () => {
      mockDoctoresService.getCitasByDoctor.mockRejectedValue(
        new Error('Doctor no encontrado.'),
      );

      await expect(controller.getCitas('nope')).rejects.toThrow(
        'Doctor no encontrado.',
      );
    });
  });
});
