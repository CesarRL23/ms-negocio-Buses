import { Test, TestingModule } from '@nestjs/testing';
import { PersonGroupService } from './person-group.service';

describe('PersonGroupService', () => {
  let service: PersonGroupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PersonGroupService],
    }).compile();

    service = module.get<PersonGroupService>(PersonGroupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
