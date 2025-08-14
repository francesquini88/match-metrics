import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { Match } from './entities/match.entity';
import { Kill } from './entities/kill.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Match, Kill]),
  ],
  controllers: [MatchesController],
  providers: [MatchesService],
})
export class MatchesModule {}