// test/matches.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, BadRequestException, ConflictException } from '@nestjs/common';
import request from 'supertest';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { MatchesModule } from './../src/modules/matches/matches.module';
import { ConfigModule } from '@nestjs/config';

describe('MatchesController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: '.env.test',
          isGlobal: true,
        }),
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'localhost',
          port: 5432,
          username: process.env.DATABASE_USER,
          password: process.env.DATABASE_PASSWORD,
          database: process.env.DATABASE_NAME,
          autoLoadEntities: true,
          synchronize: true, // Use: true no ambiente de teste para criar as tabelas
        }),
        MatchesModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    
    const connection = app.get(Connection);
    await connection.query('TRUNCATE TABLE "matches", "kills" RESTART IDENTITY CASCADE;');
  });

  afterAll(async () => {
    await app.close();
  });

  it('Realiza o upload do arquivo e gerar o ranking correto!', async () => {
    const matchFileContent =
      `23/04/2023 10:00:00 - New match 123 has started\n` +
      `23/04/2023 10:01:00 - PlayerA killed PlayerB using AK47\n` +
      `23/04/2023 10:02:00 - <WORLD> killed PlayerC by DROWN\n` +
      `23/04/2023 10:03:00 - PlayerA killed PlayerD using M16\n` +
      `23/04/2023 10:04:00 - Match 123 has ended`;
      
    const uploadResponse = await request(app.getHttpServer())
        .post('/matches/upload')
        .attach('file', Buffer.from(matchFileContent), 'match.txt')
        .expect(201);

    const matchId = uploadResponse.body.data.savedMatches[0].matchId;

    const rankingResponse = await request(app.getHttpServer())
      .get(`/matches/${matchId}/ranking`)
      .expect(200);

    const expectedRanking = [
    { playerName: 'PlayerA', frags: 2, deaths: 0 },
    { playerName: 'PlayerB', frags: 0, deaths: 1 },
    { playerName: 'PlayerC', frags: 0, deaths: 1 },
    { playerName: 'PlayerD', frags: 0, deaths: 1 },
    ];

    expect(rankingResponse.body).toEqual(expect.arrayContaining(expectedRanking));

    expect(rankingResponse.body).toHaveLength(expectedRanking.length);
    });

  it('Retornar 404 para um id de match inexistente', async () => {
    await request(app.getHttpServer())
      .get('/matches/999/ranking')
      .expect(404);
  });
});