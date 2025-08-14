import { ApiProperty } from '@nestjs/swagger';
import { AwardsDto } from './awards.dto';

export class RankingResponseDto {
  @ApiProperty({ description: 'Nome do jogador', example: 'PlayerB' })
  playerName: string;

  @ApiProperty({ description: 'Número de abates (kills) do jogador', example: 16 })
  frags: number;

  @ApiProperty({ description: 'Número de mortes do jogador', example: 4 })
  deaths: number;

  @ApiProperty({ type: AwardsDto, description: 'Prêmios recebidos na partida.' })
  awards: AwardsDto;

  @ApiProperty({ description: 'Maior sequência de abates do jogador.', example: 8 })
  killStreak: number;
}