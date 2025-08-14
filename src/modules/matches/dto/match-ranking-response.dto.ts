import { ApiProperty } from '@nestjs/swagger';
import { RankingResponseDto } from './ranking.dto';

export class MatchRankingResponseDto {
  @ApiProperty({ description: 'O jogador que venceu a partida.', example: 'PlayerB' })
  winner: string;

  @ApiProperty({ description: 'A arma mais usada pelo vencedor.', example: 'AK47' })
  favoriteWeapon: string;

  @ApiProperty({ type: [RankingResponseDto], description: 'O ranking detalhado de todos os jogadores.' })
  ranking: RankingResponseDto[];
}