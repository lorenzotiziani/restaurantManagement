import { Test, TestingModule } from '@nestjs/testing';
import { PrenotazioniController } from './prenotazioni.controller';
import { PrenotazioniService } from './prenotazioni.service';

describe('PrenotazioniController', () => {
  let controller: PrenotazioniController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PrenotazioniController],
      providers: [PrenotazioniService],
    }).compile();

    controller = module.get<PrenotazioniController>(PrenotazioniController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
