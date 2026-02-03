import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseService } from './database.service'; 
import { DatabaseModule } from './database/database.module';
import { PimplesModule } from './modules/pimp/pimples.module';
import { UsersModule } from './modules/user/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    DatabaseModule,
    PimplesModule,
    UsersModule,
  ],
  providers: [DatabaseService],
})
export class AppModule {}