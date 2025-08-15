/* eslint-disable prettier/prettier */

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { StoreModule } from './store/store.module';
import { UsersModule } from './users/users.module';
import { ProductModule } from './product/product.module';


@Module({
  imports: [
    PrismaModule,
    AuthModule,
    StoreModule,
    UsersModule,
    ProductModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
