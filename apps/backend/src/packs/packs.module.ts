import { Module } from '@nestjs/common';
import { PackManagerService } from './pack-manager.service';

@Module({
  providers: [PackManagerService],
  exports: [PackManagerService],
})
export class PacksModule {}

