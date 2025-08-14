import { IsInt, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @Type(() => Number)
  @IsInt({ message: 'O número da página deve ser um número inteiro.' })
  @Min(1, { message: 'O número da página deve ser maior ou igual a 1.' })
  @IsOptional()
  page?: number;

  @Type(() => Number)
  @IsInt({ message: 'O limite deve ser um número inteiro.' })
  @Min(1, { message: 'O limite deve ser maior ou igual a 1.' })
  @IsOptional()
  limit?: number;
}