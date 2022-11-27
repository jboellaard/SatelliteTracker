import { Test, TestingModule } from '@nestjs/testing';
import { SatelliteService } from './satellite.service';

describe('SatelliteService', () => {
  let service: SatelliteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SatelliteService],
    }).compile();

    service = module.get<SatelliteService>(SatelliteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
