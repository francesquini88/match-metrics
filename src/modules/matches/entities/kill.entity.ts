import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Match } from './match.entity';

@Entity({ name: 'kills' })
export class Kill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'killer_name', type: 'varchar' })
  killerName: string;

  @Column({ name: 'victim_name', type: 'varchar' })
  victimName: string;

  @Column({ name: 'weapon_name', type: 'varchar', nullable: true })
  weaponName: string;
  
  @Column({ name: 'kill_time', type: 'timestamp with time zone' })
  killTime: Date;

  @ManyToOne(() => Match, match => match.kills, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'match_id' })
  match: Match;
}