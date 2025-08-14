import { Test, TestingModule } from '@nestjs/testing';
import { MatchesService } from './matches.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from './entities/match.entity';
import { Kill } from './entities/kill.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Stream } from 'stream';

const mockMatchRepository = () => ({
  create: jest.fn(),
  save: jest.fn(match => match),
  findOneBy: jest.fn(),
});

const mockKillRepository = () => ({
  create: jest.fn(kill => kill),
  save: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
  })),
});

describe('MatchesService', () => {
  let service: MatchesService;
  let matchRepository: Repository<Match>;
  let killRepository: Repository<Kill>;
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchesService,
        {
          provide: getRepositoryToken(Match),
          useFactory: mockMatchRepository,
        },
        {
          provide: getRepositoryToken(Kill),
          useFactory: mockKillRepository,
        },
      ],
    }).compile();

    service = module.get<MatchesService>(MatchesService);
    matchRepository = module.get<Repository<Match>>(getRepositoryToken(Match));
    killRepository = module.get<Repository<Kill>>(getRepositoryToken(Kill));
  });


  it('Deve ser definido', () => {
    expect(service).toBeDefined();
  });

  describe('Deve processar o arquivo da partida', () => {
    const mockFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'test.txt',
      encoding: '7bit',
      mimetype: 'text/plain',
      size: 100,
      buffer: Buffer.from(
        `23/04/2023 10:00:00 - New match 1 has started\n` +
        `23/04/2023 10:01:00 - Roman killed Nick using M16\n` +
        `23/04/2023 10:02:00 - Match 1 has ended\n` +
        `23/04/2023 10:03:00 - New match 2 has started\n` +
        `23/04/2023 10:04:00 - PlayerA killed PlayerB using AK47\n` +
        `23/04/2023 10:05:00 - Match 2 has ended`
      ),
      stream: new Stream.Readable() as any,
      destination: '',
      filename: '',
      path: ''
    };

    it('Deve processar e salvar múltiplas partidas corretamente', async () => {
        (matchRepository.save as jest.Mock).mockImplementation(match => ({ ...match, id: 'uuid-' + match.matchId }));
        (killRepository.create as jest.Mock).mockImplementation(kill => ({ ...kill, id: 'kill-uuid' }));
  
        const result = await service.processMatchFile(mockFile);
  
        expect(result.savedMatches.length).toBe(2);
        expect(result.savedMatches[0].matchId).toBe(1);
        expect(result.savedMatches[1].matchId).toBe(2);
        expect(result.alreadyExists.length).toBe(0);
      });
  
      it('Deve lidar com erros de conflito e salvar as outras partidas', async () => {
        let saveCount = 0;
        (matchRepository.save as jest.Mock).mockImplementation(match => {
          saveCount++;
          if (saveCount === 1) {
            const error = new Error('duplicate key value violates unique constraint');
            (error as any).code = '23505';
            throw error;
          }
          return { ...match, id: 'uuid-' + match.matchId };
        });
        (killRepository.create as jest.Mock).mockImplementation(kill => ({ ...kill, id: 'kill-uuid' }));
  
        const result = await service.processMatchFile(mockFile);
        
        expect(result.savedMatches.length).toBe(1);
        expect(result.alreadyExists.length).toBe(1);
        expect(result.alreadyExists[0].matchId).toBe(1);
        expect(result.savedMatches[0].matchId).toBe(2);
      });

    it('Deve lançar um erro se nenhuma partida válida for encontrada', async () => {
      const invalidFile: Express.Multer.File = {
        ...mockFile,
        buffer: Buffer.from('Conteúdo de arquivo inválido sem linhas de início/fim')
      };
      
      await expect(service.processMatchFile(invalidFile)).rejects.toThrow(ConflictException);
    });
  });

  describe('Deve obter ranking da partida', () => {
      const mockMatch = { id: 'match-uuid', matchId: 1, rawLog: '', kills: [], startDate: new Date(), endDate: new Date() };

    it('Deve lançar NotFoundException se a partida não existir', async () => {
        (matchRepository.findOneBy as jest.Mock).mockResolvedValue(undefined);

        await expect(service.getMatchRanking(999)).rejects.toThrow(NotFoundException);
        expect(matchRepository.findOneBy).toHaveBeenCalledWith({ matchId: 999 });
    });

    it('Deve retornar um ranking correto ordenado por frags', async () => {
        (matchRepository.findOneBy as jest.Mock).mockResolvedValue(mockMatch);

        const fragsCount = [
            { playerName: 'PlayerA', frags: '10' },
            { playerName: 'PlayerB', frags: '5' },
            { playerName: 'PlayerC', frags: '1' },
            { playerName: 'PlayerD', frags: '0' },
        ];
        
        const deathsCount = [
            { playerName: 'PlayerB', deaths: '2' },
            { playerName: 'PlayerC', deaths: '8' },
            { playerName: 'PlayerE', deaths: '5' },
        ];
        
        const queryBuilderMock = {
            select: jest.fn().mockReturnThis(),
            addSelect: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            groupBy: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            getRawMany: jest.fn(),
        };

        (killRepository.createQueryBuilder as jest.Mock).mockReturnValue(queryBuilderMock);
        
        queryBuilderMock.getRawMany
          .mockResolvedValueOnce(fragsCount) 
          .mockResolvedValueOnce(deathsCount); 

        const ranking = await service.getMatchRanking(1);

        expect(ranking).toEqual([
            { playerName: 'PlayerA', frags: 10, deaths: 0 },
            { playerName: 'PlayerB', frags: 5, deaths: 2 },
            { playerName: 'PlayerC', frags: 1, deaths: 8 },
            { playerName: 'PlayerD', frags: 0, deaths: 0 },
            { playerName: 'PlayerE', frags: 0, deaths: 5 },
        ]);
        
        expect(killRepository.createQueryBuilder).toHaveBeenCalledTimes(2);
    });
  });

  describe('getGlobalRanking', () => {
    it('Deve retornar o ranking global ordenado por frags', async () => {
        const fragsCount = [
            { playerName: 'PlayerA', frags: '15' },
            { playerName: 'PlayerC', frags: '8' },
            { playerName: 'PlayerB', frags: '5' },
        ];
        
        const deathsCount = [
            { playerName: 'PlayerB', deaths: '2' },
            { playerName: 'PlayerC', deaths: '10' },
            { playerName: 'PlayerD', deaths: '7' },
        ];
        
        const queryBuilderMock = {
            select: jest.fn().mockReturnThis(),
            addSelect: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            groupBy: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            getRawMany: jest.fn()
                .mockResolvedValueOnce(fragsCount)  
                .mockResolvedValueOnce(deathsCount)
        };
        (killRepository.createQueryBuilder as jest.Mock).mockReturnValue(queryBuilderMock);

        const globalRanking = await service.getGlobalRanking(1,4);

        expect(globalRanking).toEqual([
            { playerName: 'PlayerA', frags: 15, deaths: 0 },
            { playerName: 'PlayerC', frags: 8, deaths: 10 },
            { playerName: 'PlayerB', frags: 5, deaths: 2 },
            { playerName: 'PlayerD', frags: 0, deaths: 7 },
        ]);
        
        expect(killRepository.createQueryBuilder).toHaveBeenCalledTimes(2);
    });

    it('Deve retornar um array vazio se nenhuma morte for encontrada', async () => {
        const emptyResult = [];
        const queryBuilderMock = {
            select: jest.fn().mockReturnThis(),
            addSelect: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            groupBy: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            getRawMany: jest.fn()
                .mockResolvedValueOnce(emptyResult)
                .mockResolvedValueOnce(emptyResult)
        };
        (killRepository.createQueryBuilder as jest.Mock).mockReturnValue(queryBuilderMock);

        const globalRanking = await service.getGlobalRanking(1,1);

        expect(globalRanking).toEqual([]);
        expect(killRepository.createQueryBuilder).toHaveBeenCalledTimes(2);
    });
  });
});