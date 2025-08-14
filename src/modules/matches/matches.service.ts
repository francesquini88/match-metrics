import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from './entities/match.entity';
import { Kill } from './entities/kill.entity';

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
    @InjectRepository(Kill)
    private readonly killRepository: Repository<Kill>,
  ) {}

  async processMatchFile(file: Express.Multer.File) {
    const fileContent = file.buffer.toString('utf-8');
    const lines = fileContent.split('\n');

    const matchMap = new Map<string, Partial<Match>>();

    const startRegex = /(\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}) - New match (\d+) has started/;
    const endRegex = /(\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}) - Match (\d+) has ended/;
     const killRegex = /(\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}) - (.+) killed (.+)(?: using| by) (.+)/;

    
    let currentMatchId: string | null = null;

    for (const line of lines) {
      const startMatch = line.match(startRegex);
      if (startMatch) {
        currentMatchId = startMatch[2];
        const startDateString = startMatch[1];
        
        matchMap.set(currentMatchId, {
          matchId: parseInt(currentMatchId, 10),
          startDate: new Date(startDateString.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1')),
          rawLog: line,
          kills: []
        });
      }

      const endMatch = line.match(endRegex);
      if (endMatch) {
        const matchId = endMatch[2];
        const endDateString = endMatch[1];
        
        const existingMatch = matchMap.get(matchId);
        if (existingMatch) {
          existingMatch.endDate = new Date(endDateString.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1'));
        }
        currentMatchId = null;
      }
      
      const killMatch = line.match(killRegex);
      if (killMatch && currentMatchId) {
        const [fullMatch, killTimeString, killerName, victimName, weaponName] = killMatch;
        
        const kill = {
          killerName,
          victimName,
          weaponName,
          killTime: new Date(killTimeString.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1')),
        };

        const existingMatch = matchMap.get(currentMatchId);
        if (existingMatch) {
            if (!existingMatch.kills) {
                existingMatch.kills = [];
            }
            const newKill = this.killRepository.create(kill);
            existingMatch.kills.push(newKill);
        }
      }
    }
    
    const matchesToSave = Array.from(matchMap.values());
    
    if (matchesToSave.length === 0) {
      throw new ConflictException('Nenhuma partida válida foi encontrada no arquivo.');
    }
    
    const successfullySaved: Match[] = []; 
    const alreadyExists: { matchId: number; status: string; }[] = []; 

    for (const match of matchesToSave) {
      try {
        const result = await this.matchRepository.save(match);
        successfullySaved.push(result);
      } catch (error) {
        if (error.code === '23505') {
          alreadyExists.push({
            matchId: match.matchId!,
            status: 'Já existe no banco de dados.',
          });
        } else {
          throw error;
        }
      }
    }
    
    return {
      message: `${successfullySaved.length} partidas salvas, ${alreadyExists.length} já existentes.`,
      savedMatches: successfullySaved,
      alreadyExists: alreadyExists,
    };
  }

  async getMatchRanking(matchId: number) {
    const match = await this.matchRepository.findOneBy({ matchId });
    if (!match) {
      throw new NotFoundException(`Partida com o ID '${matchId}' não encontrada.`);
    }

    const fragsCount = await this.killRepository
      .createQueryBuilder('kill')
      .select('killer_name', 'playerName')
      .addSelect('COUNT(kill.killer_name)', 'frags')
      .where('kill.match_id = :matchId', { matchId: match.id })
      .andWhere("kill.killer_name != '<WORLD>'")
      .groupBy('killer_name')
      .getRawMany();

    const deathsCount = await this.killRepository
        .createQueryBuilder('kill')
        .select('victim_name', 'playerName')
        .addSelect('COUNT(kill.victim_name)', 'deaths')
        .where('kill.match_id = :matchId', { matchId: match.id })
        .groupBy('victim_name')
        .getRawMany();
        
    const allUniquePlayers = [...new Set([
      ...fragsCount.map(p => p.playerName), 
      ...deathsCount.map(d => d.playerName)
    ])];
    
    const fullRanking = allUniquePlayers
      .map(playerName => {
        const frags = fragsCount.find(p => p.playerName === playerName);
        const deaths = deathsCount.find(d => d.playerName === playerName);
        return {
          playerName,
          frags: frags ? parseInt(frags.frags) : 0,
          deaths: deaths ? parseInt(deaths.deaths) : 0
        };
      })
      .sort((a, b) => b.frags - a.frags);
    
  // Encontrar o jogador com mais frags
    const winner = fullRanking.length > 0 ? fullRanking[0].playerName : null;

    // Se houver um vencedor, buscar sua arma favorita
    const favoriteWeapon = winner 
        ? await this.getWinnersFavoriteWeapon(match.id)
        : 'N/A';

    return {
        winner: winner,
        favoriteWeapon: favoriteWeapon,
        ranking: fullRanking,
    };
  }

  async getGlobalRanking(page: number, limit: number) {
    const fragsCount = await this.killRepository
      .createQueryBuilder('kill')
      .select('killer_name', 'playerName')
      .addSelect('COUNT(kill.killer_name)', 'frags')
      .where("kill.killer_name != '<WORLD>'")
      .groupBy('killer_name')
      .getRawMany();

    const deathsCount = await this.killRepository
        .createQueryBuilder('kill')
        .select('victim_name', 'playerName')
        .addSelect('COUNT(kill.victim_name)', 'deaths')
        .groupBy('victim_name')
        .getRawMany();
        
    const allUniquePlayers = [...new Set([
      ...fragsCount.map(p => p.playerName), 
      ...deathsCount.map(d => d.playerName)
    ])];
    
    const fullRanking = allUniquePlayers
      .map(playerName => {
        const frags = fragsCount.find(p => p.playerName === playerName);
        const deaths = deathsCount.find(d => d.playerName === playerName);
        return {
          playerName,
          frags: frags ? parseInt(frags.frags) : 0,
          deaths: deaths ? parseInt(deaths.deaths) : 0
        };
      })
      .sort((a, b) => b.frags - a.frags);
    
    const offset = (page - 1) * limit;
    const paginatedRanking = fullRanking.slice(offset, offset + limit);
    
    return paginatedRanking;
  }

  async getWinnersFavoriteWeapon(matchId: string): Promise<string> {
  const winner = await this.killRepository
    .createQueryBuilder('kill')
    .select('killer_name', 'playerName')
    .addSelect('COUNT(killer_name)', 'frags')
    .where('kill.match_id = :matchId', { matchId })
    .andWhere("kill.killer_name != '<WORLD>'")
    .groupBy('killer_name')
    .orderBy('frags', 'DESC')
    .limit(1)
    .getRawOne();
    
  if (!winner) {
    return 'N/A';
  }

    const favoriteWeapon = await this.killRepository
      .createQueryBuilder('kill')
      .select('weapon_name', 'weaponName')
      .addSelect('COUNT(weapon_name)', 'usageCount')
      .where('kill.match_id = :matchId', { matchId })
      .andWhere('kill.killer_name = :winnerName', { winnerName: winner.playerName })
      .groupBy('weapon_name')
      .orderBy('COUNT(weapon_name)', 'DESC') // <-- Correção aqui
      .limit(1)
      .getRawOne();

  return favoriteWeapon ? favoriteWeapon.weaponName : 'N/A';
}

}

