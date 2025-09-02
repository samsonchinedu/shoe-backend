// src/cart/cart.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';

@Injectable()
export class CartService {
    constructor(private prisma: PrismaService) { }

    async addToCart(userId: string, dto: AddToCartDto) {
        return this.prisma.cartItem.upsert({
            where: {
                userId_productId: {
                    userId,
                    productId: dto.productId,
                },
            },
            update: {
                quantity: { increment: dto.quantity },
            },
            create: {
                userId,
                productId: dto.productId,
                quantity: dto.quantity,
            },
        });
    }

    async getCart(userId: string) {
        return this.prisma.cartItem.findMany({
            where: { userId },
            include: { product: true },
        });
    }

    async removeFromCart(userId: string, productId: string) {
        return this.prisma.cartItem.delete({
            where: {
                userId_productId: {
                    userId,
                    productId,
                },
            },
        });
    }

    async clearCart(userId: string) {
        return this.prisma.cartItem.deleteMany({
            where: { userId },
        });
    }
}
