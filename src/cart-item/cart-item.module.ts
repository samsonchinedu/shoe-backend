import { Module } from "@nestjs/common";
import { CartController } from "./cart-item.controller";
import { CartService } from "./cart-item.service";
import { PrismaService } from "../../prisma/prisma.service";

@Module({
    controllers: [CartController],
    providers: [CartService, PrismaService],
})

export class CartItemModule { }