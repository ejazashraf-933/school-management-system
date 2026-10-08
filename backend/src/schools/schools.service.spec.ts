import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { School } from './entities/school.entity';
import { SchoolsService } from './schools.service';

describe('SchoolsService', () => {
  let service: SchoolsService;

  // A fake repository. Each method is a Jest mock we can program per test.
  const repository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const school = {
    id: 1,
    code: 'LHR-001',
    name: 'City Model School',
    city: 'Lahore',
    phone: '042-1234567',
    email: 'office@citymodel.example',
    isActive: true,
    createdAt: new Date('2026-01-01T00:00:00Z'),
  } as School;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchoolsService,
        // Wherever Nest would inject the real School repository, give it the fake.
        { provide: getRepositoryToken(School), useValue: repository },
      ],
    }).compile();

    service = module.get(SchoolsService);
  });

  describe('create', () => {
    it('saves the school and returns it', async () => {
      const input = { code: 'LHR-001', name: 'City Model School' };
      repository.create.mockReturnValue(school);
      repository.save.mockResolvedValue(school);

      const result = await service.create(input);

      expect(repository.create).toHaveBeenCalledWith(input);
      expect(repository.save).toHaveBeenCalledWith(school);
      expect(result).toEqual(school);
    });
  });

  describe('findAll', () => {
    it('returns every school from the repository', async () => {
      repository.find.mockResolvedValue([school]);

      await expect(service.findAll()).resolves.toEqual([school]);
    });
  });

  describe('findOne', () => {
    it('returns the school when it exists', async () => {
      repository.findOne.mockResolvedValue(school);

      const result = await service.findOne(1);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(school);
    });

    it('throws NotFoundException when the school does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('throws NotFoundException and deletes nothing when the school is missing', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
      expect(repository.remove).not.toHaveBeenCalled();
    });
  });
});
