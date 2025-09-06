import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MatchmakingModule } from './matchmaking/matchmaking.module';
import { WebsocketModule } from './websocket/websocket.module';
import { BattleModule } from './battle/battle.module';
import { PacksModule } from './packs/packs.module';
import { EconomyModule } from './economy/economy.module';
import { CollectionModule } from './collection/collection.module';
import { ProgressionModule } from './progression/progression.module';

@Module({
  imports: [
    MatchmakingModule,
    WebsocketModule,
    BattleModule,
    PacksModule,
    EconomyModule,
    CollectionModule,
    ProgressionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
