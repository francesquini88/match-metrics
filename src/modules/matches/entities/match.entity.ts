import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Kill } from './kill.entity';

@Entity({ name: 'matches' })
export class Match {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'match_id', unique: true })
  matchId: number;

  @Column({ name: 'start_date', type: 'timestamp with time zone' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'timestamp with time zone' })
  endDate: Date;

  @Column({ type: 'text', nullable: true })
  rawLog: string;
  
  @OneToMany(() => Kill, kill => kill.match, { cascade: true })
  kills: Kill[];
}