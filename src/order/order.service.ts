import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentService } from './../payment/payment.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AddressDto } from './dto/address.dto';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrderService {
    constructor(
        private prisma: PrismaService, 
        private PaymentService: PaymentService
    ) { }

    async createOrder(userId: string, items: CreateOrderDto['items']) {
        // Fetch user default address from DB
        const address = await this.prisma.address.findFirst({
            where: { userId, }, // or however you store it
        });

        if (!address) {
            throw new Error('No default address found for this user');
        }

        // 2️⃣ Build order items and calculate total
        const orderItems = await Promise.all(
            items.map(async (item) => {
                const product = await this.prisma.product.findUnique({
                    where: { id: item.productId },
                });
                if (!product) throw new Error(`Product ${item.productId} not found`);

                return {
                    quantity: item.quantity,
                    price: product.price,
                    product: {
                        connect: { id: item.productId },
                    },
                };
            })
        );

        const totalAmount = orderItems.reduce(
            (total, item) => total + item.quantity * item.price,
            0
        );

        // Create order
        return this.prisma.order.create({
            data: {
                userId,
                totalAmount,
                addressId: address.id,
                status: OrderStatus.PENDING,
                items: {
                    create: orderItems,
                },
            },
            include: {
                items: true,
                address: true,
            },
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
        const cartItems = await this.prisma.cartItem.findMany({
            where: { userId },
            include: { product: true },
        });

        if (cartItems.length === 0) {
            throw new BadRequestException('Cart is empty');
        }

        for (const ci of cartItems) {
            if (!ci.product) throw new NotFoundException(`Product ${ci.productId} not found`);
            if (ci.quantity <= 0) throw new BadRequestException('Quantity must be > 0');
            if (ci.product.stock < ci.quantity) {
                throw new BadRequestException(`Not enough stock for "${ci.product.title}"`);
            }
        }

        const totalAmount = cartItems.reduce(
            (sum, ci) => sum + ci.product.price * ci.quantity,
            0
        );

        // ✅ Pay using wallet first
        await this.PaymentService.payWithWallet(userId, totalAmount);

        // 🧾 Proceed with the transaction (stock, order, clear cart)
        const order = await this.prisma.$transaction(async (tx) => {
            for (const ci of cartItems) {
                await tx.product.update({
                    where: { id: ci.productId },
                    data: { stock: { decrement: ci.quantity } },
                });
            }

            const address = await tx.address.findFirst({
                where: { id: addressId, userId },
            });
            if (!address) throw new NotFoundException('Address not found for this user');

            const createdOrder = await tx.order.create({
                data: {
                    userId,
                    totalAmount,
                    status: 'PAID', // changed to paid
                    addressId,
                    items: {
                        create: cartItems.map((ci) => ({
                            productId: ci.productId,
                            quantity: ci.quantity,
                            price: ci.product.price,
                        })),
                    },
                },
                include: { items: true, address: true },
            });

            await tx.cartItem.deleteMany({ where: { userId } });

            return createdOrder;
        });

        return order;
    }


}
