import { Module } from '@nestjs/common';
import { BattleEngineService } from './battle-engine.service';

@Module({
  providers: [BattleEngineService],
  exports: [BattleEngineService],
})
export class BattleModule {}

