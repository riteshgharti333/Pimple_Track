import { neon, NeonQueryFunction } from '@neondatabase/serverless';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private sql: NeonQueryFunction<false, false>;

  constructor(private configService: ConfigService) {
    const databaseUrl = this.configService.get<string>('DATABASE_URL');
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    this.sql = neon(databaseUrl);
  }

  async onModuleInit() {
    console.log('✅ Neon Database Connection Initialized');
  }

  async query<T = any>(query: TemplateStringsArray, ...params: any[]) {
    return this.sql(query, ...params);
  }
}
