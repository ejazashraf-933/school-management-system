import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { School } from './entities/school.entity';
import { UpdateSchoolDto } from './dto/update-school.dto';

@Injectable()
export class SchoolsService {
  constructor(
    @InjectRepository(School)
    private readonly schoolsRepository: Repository<School>,
  ) {}

  create(data: Partial<School>): Promise<School> {
    const school = this.schoolsRepository.create(data);
    return this.schoolsRepository.save(school);
  }

  findAll(): Promise<School[]> {
    return this.schoolsRepository.find();
  }

  async findOne(id: number): Promise<School> {
    const school = await this.schoolsRepository.findOne({ where: { id } });
    if (!school) {
      throw new NotFoundException(`School with id ${id} not found`);
    }
    return school;
  }

  async update(id: number, data: UpdateSchoolDto): Promise<School> {
    const school = await this.findOne(id);
    Object.assign(school, data);
    return this.schoolsRepository.save(school);
  }

  async remove(id: number): Promise<void> {
    const school = await this.findOne(id);
    await this.schoolsRepository.remove(school);
  }
}
