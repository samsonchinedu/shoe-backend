import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OrderItemService {
    constructor(private prisma: PrismaService) { }

    async getItemsForOrder(orderId: string, userId: string) {
        // ensure the order belongs to the user
        const order = await this.prisma.order.findFirst({
            where: { id: orderId, userId },
            select: { id: true },
        });
        if (!order) throw new NotFoundException('Order not found');

        return this.prisma.orderItem.findMany({
            where: { orderId },
            include: { product: true },
        });
    }

    async getItemById(itemId: string, userId: string) {
        // ensure the item belongs to an order of the user
        const item = await this.prisma.orderItem.findFirst({
            where: { id: itemId, order: { userId } },
            include: { product: true },
        });
        if (!item) throw new NotFoundException('Order item not found');

        return item;
    }
}