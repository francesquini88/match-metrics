import { ApiProperty } from '@nestjs/swagger';

export class RankingResponseDto {
  @ApiProperty({
    description: 'Nome do jogador',
    example: 'PlayerA',
  })
  playerName: string;

  @ApiProperty({
    description: 'Número de abates (kills) do jogador',
    example: 15,
  })
  frags: number;

  @ApiProperty({
    description: 'Número de mortes do jogador',
    example: 5,
  })
  deaths: number;
}