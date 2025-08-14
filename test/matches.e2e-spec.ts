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

it('should upload a match file and get the correct ranking', async () => {
  // 1. Prepara o arquivo para upload
  const matchFileContent =
    `23/04/2023 10:00:00 - New match 123 has started\n` +
    `23/04/2023 10:01:00 - PlayerA killed PlayerB using AK47\n` +
    `23/04/2023 10:02:00 - <WORLD> killed PlayerC by DROWN\n` +
    `23/04/2023 10:03:00 - PlayerA killed PlayerD using M16\n` +
    `23/04/2023 10:04:00 - Match 123 has ended`;
    
  // 2. Faz o upload do arquivo
  const uploadResponse = await request(app.getHttpServer())
    .post('/matches/upload')
    .attach('file', Buffer.from(matchFileContent), 'match.txt')
    .expect(201);

  const matchId = uploadResponse.body.data.savedMatches[0].matchId;

  // 3. Busca o ranking da partida
  const rankingResponse = await request(app.getHttpServer())
    .get(`/matches/${matchId}/ranking`)
    .expect(200);

  // 4. Valida a estrutura completa da resposta
  expect(rankingResponse.body).toEqual(
    expect.objectContaining({
      winner: 'PlayerA',
      favoriteWeapon: expect.any(String), // ou 'AK47' se quiser ser mais específico
      ranking: expect.any(Array),
    })
  );
  
  // 5. Valida o array de ranking separadamente
  expect(rankingResponse.body.ranking).toEqual([
    { playerName: 'PlayerA', frags: 2, deaths: 0 },
    { playerName: 'PlayerB', frags: 0, deaths: 1 },
    { playerName: 'PlayerC', frags: 0, deaths: 1 },
    { playerName: 'PlayerD', frags: 0, deaths: 1 },
  ]);
});

  it('Deve retornar 404 para um matchId inexistente', async () => {
    await request(app.getHttpServer())
      .get('/matches/999/ranking')
      .expect(404);
  });

  it('Deve retornar um ranking geral por players', async () => {
      
      const response = await request(app.getHttpServer())
        .get('/matches/ranking/global')
        .expect(200);

      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('playerName');
      expect(response.body[0]).toHaveProperty('frags');
      expect(response.body[0]).toHaveProperty('deaths');
      
      expect(response.body[0].frags).toBeGreaterThanOrEqual(response.body[1].frags);
  });

});