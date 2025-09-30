/* eslint-disable prettier/prettier */

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { StoreModule } from './store/store.module';
import { UsersModule } from './users/users.module';
import { ProductModule } from './product/product.module';
import { OrderModule } from './order/order.module';
import { OrderItemModule } from './order-item/order-item.module';
import { CartItemModule } from './cart-item/cart-item.module';
import { AddressModule } from './address/address.module';
import { PaymentModule } from './payment/payment.module';
import { ConfigModule } from '@nestjs/config';


@Module({
  imports: [
    PrismaModule,
    AuthModule,
    StoreModule,
    UsersModule,
    ProductModule,
    OrderModule,
    OrderItemModule,
    CartItemModule,
    AddressModule,
    PaymentModule,
    ConfigModule.forRoot({
      isGlobal: true, // 👈 makes it available everywhere
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
