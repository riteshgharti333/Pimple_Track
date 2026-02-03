import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { AuthService, UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [DatabaseModule],
  providers: [UsersService, AuthService],
  controllers: [UsersController],
  exports: [UsersService, AuthService],
})
export class UsersModule {}
