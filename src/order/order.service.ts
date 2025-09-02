import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OrderService {
    constructor(private prisma: PrismaService) { }

    async createOrder(userId: string, dto: { items: { productId: string; quantity: number; price: number }[] }) {
        const totalAmount = dto.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
        return this.prisma.order.create({
            data: {
                userId,
                totalAmount,
                status: 'PENDING',
                items: { create: dto.items.map(i => ({ productId: i.productId, quantity: i.quantity, price: i.price })) },
            },
            include: { items: true },
        });
    }

    async getUserOrders(userId: string) {
        return this.prisma.order.findMany({
            where: { userId },
            include: { items: true },
        });
    }

    async getOrderById(id: string, userId: string) {
        const order = await this.prisma.order.findFirst({
            where: { id, userId },
            include: { items: true },
        });
        if (!order) throw new NotFoundException('Order not found');
        return order;
    }

    /**
     * Checkout: convert user's cart items into an order, decrement stock, clear cart.
     */
    async checkout(userId: string, addressId: string) {
        // 1) Load cart with product
        const cartItems = await this.prisma.cartItem.findMany({
            where: { userId },
            include: { product: true },
        });

        if (cartItems.length === 0) {
            throw new BadRequestException('Cart is empty');
        }

        // 2) Validate stock
        for (const ci of cartItems) {
            if (!ci.product) {
                throw new NotFoundException(`Product ${ci.productId} not found`);
            }
            if (ci.quantity <= 0) {
                throw new BadRequestException('Quantity must be > 0');
            }
            if (ci.product.stock < ci.quantity) {
                throw new BadRequestException(
                    `Not enough stock for "${ci.product.title}"`,
                );
            }
        }

        // Precompute snapshots and total
        const itemsSnapshot = cartItems.map((ci) => ({
            productId: ci.productId,
            quantity: ci.quantity,
            price: ci.product.price, // snapshot current price
        }));
        const totalAmount = itemsSnapshot.reduce(
            (sum, i) => sum + i.price * i.quantity,
            0,
        );

        // 3) Transaction: decrement stock, create order+items, clear cart
        const order = await this.prisma.$transaction(async (tx) => {
            // decrement stock
            for (const ci of cartItems) {
                await tx.product.update({
                    where: { id: ci.productId },
                    data: { stock: { decrement: ci.quantity } },
                });
            }

            // check address belongs to user
            const address = await tx.address.findFirst({
                where: {
                    id: addressId,
                    userId: userId,
                },
            });
            if (!address) {
                throw new NotFoundException('Address not found for this user');
            }

            // create order + items with address
            const createdOrder = await tx.order.create({
                data: {
                    userId,
                    totalAmount,
                    status: 'PENDING',
                    addressId, // link order to address
                    items: {
                        create: itemsSnapshot.map((i) => ({
                            productId: i.productId,
                            quantity: i.quantity,
                            price: i.price,
                        })),
                    },
                },
                include: {
                    items: true,
                    address: true, // include address in response
                },
            });

            // clear cart
            await tx.cartItem.deleteMany({ where: { userId } });

            return createdOrder;
        });

        return order;
    }

}
