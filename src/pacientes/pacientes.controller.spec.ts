import { Test, TestingModule } from '@nestjs/testing';
import { PacientesController } from './pacientes.controller';
import { PacientesService } from './pacientes.service';

const mockPacientesService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  getCitasByPaciente: jest.fn(),
};

describe('PacientesController', () => {
  let controller: PacientesController;
  let service: PacientesService;

  beforeEach(async () => {
    Object.values(mockPacientesService).forEach((fn) => fn.mockReset());

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PacientesController],
      providers: [{ provide: PacientesService, useValue: mockPacientesService }],
    }).compile();

    controller = module.get<PacientesController>(PacientesController);
    service = module.get<PacientesService>(PacientesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create and return result', async () => {
      const dto = {
        documento: '123',
        nombres: 'Ana',
        apellidos: 'Gomez',
        telefono: '300',
        email: 'ana@mail.com',
      };
      const result = { id: 'p1', ...dto };
      mockPacientesService.create.mockResolvedValue(result);

      expect(await controller.create(dto as any)).toBe(result);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return all pacientes', async () => {
      const result = [{ id: 'p1' }, { id: 'p2' }];
      mockPacientesService.findAll.mockResolvedValue(result);

      expect(await controller.findAll()).toBe(result);
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return one paciente by id', async () => {
      const result = { id: 'p1' };
      mockPacientesService.findOne.mockResolvedValue(result);

      expect(await controller.findOne('p1')).toBe(result);
      expect(service.findOne).toHaveBeenCalledWith('p1');
    });

    it('should propagate NotFoundException from service', async () => {
      mockPacientesService.findOne.mockRejectedValue(new Error('Paciente no encontrado.'));

      await expect(controller.findOne('nope')).rejects.toThrow('Paciente no encontrado.');
    });
  });

  describe('update', () => {
    it('should call service.update and return result', async () => {
      const dto = { telefono: '310' };
      const result = { id: 'p1', ...dto };
      mockPacientesService.update.mockResolvedValue(result);

      expect(await controller.update('p1', dto as any)).toBe(result);
      expect(service.update).toHaveBeenCalledWith('p1', dto);
    });
  });

  describe('remove', () => {
    it('should call service.remove and return deleted paciente', async () => {
      const result = { id: 'p1' };
      mockPacientesService.remove.mockResolvedValue(result);

      expect(await controller.remove('p1')).toBe(result);
      expect(service.remove).toHaveBeenCalledWith('p1');
    });
  });

  describe('getCitas', () => {
    it('should return citas of a paciente', async () => {
      const result = [{ id: 'c1', pacienteId: 'p1' }];
      mockPacientesService.getCitasByPaciente.mockResolvedValue(result);

      expect(await controller.getCitas('p1')).toBe(result);
      expect(service.getCitasByPaciente).toHaveBeenCalledWith('p1');
    });

    it('should propagate NotFoundException if paciente does not exist', async () => {
      mockPacientesService.getCitasByPaciente.mockRejectedValue(new Error('Paciente no encontrado.'));

      await expect(controller.getCitas('nope')).rejects.toThrow('Paciente no encontrado.');
    });
  });
});
