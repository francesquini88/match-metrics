import { Test, TestingModule } from '@nestjs/testing';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Stream } from 'stream';

const mockMatchesService = () => ({
  processMatchFile: jest.fn(),
  getMatchRanking: jest.fn(),
});

describe('MatchesController', () => {
  let controller: MatchesController;
  let service: ReturnType<typeof mockMatchesService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MatchesController],
      providers: [
        {
          provide: MatchesService,
          useFactory: mockMatchesService,
        },
      ],
    }).compile();

    controller = module.get<MatchesController>(MatchesController);
    service = module.get(MatchesService);
  });

  it('deve ser definido', () => {
    expect(controller).toBeDefined();
  });

  describe('enviarArquivo', () => {
    const mockFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'match-test.txt',
      encoding: '7bit',
      mimetype: 'text/plain',
      size: 100,
      buffer: Buffer.from('test log content'),
      stream: new Stream.Readable() as any,
      destination: '',
      filename: '',
      path: ''
    };

    it('deve chamar processMatchFile e retornar uma mensagem de sucesso', async () => {
      const serviceResult = { message: 'success', data: {} };
      service.processMatchFile.mockResolvedValue(serviceResult);

      const result = await controller.uploadFile(mockFile);

      expect(service.processMatchFile).toHaveBeenCalledWith(mockFile);
      expect(result).toEqual({ message: 'Arquivo processado com sucesso.', data: serviceResult });
    });

    it('deve lançar BadRequestException se nenhum arquivo for enviado', async () => {
      await expect(controller.uploadFile(null)).rejects.toThrow(BadRequestException);
    });
    
    it('deve lançar BadRequestException para um tipo de arquivo inválido', async () => {
      const invalidFile = { ...mockFile, mimetype: 'application/json' };
      await expect(controller.uploadFile(invalidFile)).rejects.toThrow(BadRequestException);
    });
  });

  describe('obterRankingDaPartida', () => {
    it('deve chamar getMatchRanking e retornar os dados do ranking', async () => {
      const mockRanking = [{ playerName: 'Player1', frags: 10, deaths: 2 }];
      service.getMatchRanking.mockResolvedValue(mockRanking);

      const result = await controller.getMatchRanking(123);

      expect(service.getMatchRanking).toHaveBeenCalledWith(123);
      expect(result).toEqual(mockRanking);
    });
  });
});