import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PlaybooksModule } from './playbooks/playbooks.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'sales-playbook-development-secret',
      signOptions: { expiresIn: '8h' },
    }),
    PrismaModule,
    AuthModule,
    PlaybooksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
