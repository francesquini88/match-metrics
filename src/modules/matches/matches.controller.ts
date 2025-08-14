import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException, Get, Param } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MatchesService } from './matches.service';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody, ApiParam } from '@nestjs/swagger';
import { RankingResponseDto } from './dto/ranking-response.dto';

import 'multer';

@ApiTags('matches')
@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Faz o upload de um arquivo de log de partida' }) 
  @ApiConsumes('multipart/form-data') 
  @ApiBody({
    description: 'Arquivo de log (.txt) contendo os dados da partida',
    required: true,
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Arquivo processado e partidas salvas com sucesso.', 
    schema: {
      example: {
        "message": "Arquivo processado com sucesso.",
        "data": {
          "message": "2 partidas salvas, 1 já existentes.",
          "savedMatches": [],
          "alreadyExists": []
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Requisição inválida ou arquivo mal formatado.',
    schema: {
      example: {
        statusCode: 400,
        timestamp: '2025-08-14T00:07:58.318Z',
        path: '/matches/999/ranking',
        message: "Nenhum arquivo enviado.",
      },
    },
  })  
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) { 
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado.');
    }

    if (file.mimetype !== 'text/plain') {
      throw new BadRequestException('Apenas arquivos de texto (.txt) são permitidos.');
    }

    try {
      const result = await this.matchesService.processMatchFile(file);
      return {
        message: 'Arquivo processado com sucesso.',
        data: result,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get(':matchId/ranking')
  @ApiOperation({ summary: 'Obtém o ranking de uma partida específica' })
  @ApiParam({ name: 'matchId', description: 'ID da partida para a qual o ranking será gerado' })
  @ApiResponse({ status: 200, description: 'Ranking da partida retornado com sucesso.', type: [RankingResponseDto] })
  @ApiResponse({
    status: 404,
    description: 'Partida não encontrada.',
    schema: {
      example: {
        statusCode: 404,
        timestamp: '2025-08-14T00:07:58.318Z',
        path: '/matches/999/ranking',
        message: "Partida com o ID '999' não encontrada.",
      },
    },
  })
  async getMatchRanking(@Param('matchId') matchId: number) {
    const ranking = await this.matchesService.getMatchRanking(matchId);
    return ranking;
  }

}