import { Test, TestingModule } from '@nestjs/testing';
import { PersonGroupController } from './person-group.controller';
import { PersonGroupService } from './person-group.service';

describe('PersonGroupController', () => {
  let controller: PersonGroupController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PersonGroupController],
      providers: [PersonGroupService],
    }).compile();

    controller = module.get<PersonGroupController>(PersonGroupController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
