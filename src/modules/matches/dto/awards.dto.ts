import { ApiProperty } from '@nestjs/swagger';

export class AwardsDto {
  @ApiProperty({ description: 'Indica se o jogador venceu sem morrer.', example: true })
  NoDeathAward: boolean;

  @ApiProperty({ description: 'Indica se o jogador fez 5 abates em 1 minuto.', example: false })
  SpeedKillerAward: boolean;
}