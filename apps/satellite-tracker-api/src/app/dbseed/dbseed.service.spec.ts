import { Test, TestingModule } from '@nestjs/testing';
import { DbseedService } from './dbseed.service';

describe('DbseedService', () => {
  let service: DbseedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DbseedService],
    }).compile();

    service = module.get<DbseedService>(DbseedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
