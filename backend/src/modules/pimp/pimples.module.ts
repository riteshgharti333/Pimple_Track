import { Module } from '@nestjs/common';
import { PimplesController } from './pimples.controller';
import { PimplesService } from './pimples.service';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [PimplesController],
  providers: [PimplesService],
})
export class PimplesModule {}
