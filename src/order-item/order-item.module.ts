import { Module } from "@nestjs/common";
import { OrderItemController } from "./order-item.controller";
import { OrderItemService } from "./order-item.service";
import { PrismaService } from "../../prisma/prisma.service";

@Module({
    controllers: [OrderItemController],
    providers: [OrderItemService, PrismaService],
})

export class OrderItemModule { }