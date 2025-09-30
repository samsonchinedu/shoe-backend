// src/payment/payment.service.ts
import { Injectable, HttpException, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import axios from 'axios';
import * as crypto from 'crypto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentGateway } from './payment.gateway';
import { PaymentStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PaymentService {
    private readonly baseUrl = 'https://api.paystack.co';
    private readonly secretKey = process.env.PAYSTACK_SECRET_KEY;

    constructor(
        private prisma: PrismaService,
        private readonly gateway: PaymentGateway
    ) { }

    // 1. Initialize payment
    async initializePayment(userId: string, dto: CreatePaymentDto) {
        try {
            const response = await axios.post(
                `${this.baseUrl}/transaction/initialize`,
                {
                    email: dto.email,
                    amount: dto.amount * 100, // Naira → Kobo
                    currency: dto.currency ?? 'NGN',
                },
                {
                    headers: {
                        Authorization: `Bearer ${this.secretKey}`,
                        'Content-Type': 'application/json',
                    },
                },
            );

            const { reference, authorization_url } = response.data.data;

            // Save in DB as pending
            await this.prisma.payment.create({
                data: {
                    userId,
                    reference,
                    amount: dto.amount * 100,
                    currency: dto.currency ?? 'NGN',
                    status: 'PENDING',
                },
            });

            return { authorization_url, reference };
        } catch (error: any) {
            throw new HttpException(error.response?.data || error.message, 400);
        }
    }

    // 2. Verify payment manually (optional if webhook is set up)
    // payment.service.ts
    async verifyPayment(reference: string) {
        const response = await axios.get(
            `${this.baseUrl}/transaction/verify/${reference}`,
            { headers: { Authorization: `Bearer ${this.secretKey}` } },
        );

        const data = response.data.data;

        if (data.status === 'success') {
            // credit wallet here
            const payment = await this.prisma.payment.findUnique({ where: { reference } });

            if (!payment) {
                throw new NotFoundException(`Payment with reference ${reference} not found`);
            }

            // avoid double credit if already marked success
            if (payment?.status !== 'SUCCESS') {
                await this.prisma.wallet.update({
                    where: { userId: payment.userId },
                    data: {
                        balance: { increment: data.amount / 100 },
                        transactions: {
                            create: {
                                amount: data.amount / 100,
                                type: 'CREDIT',
                                channel: 'PAYSTACK',
                                status: 'SUCCESS',
                                userId: payment.userId,
                                reference,
                            },
                        },
                    },
                });

                await this.prisma.payment.update({
                    where: { reference },
                    data: { status: 'SUCCESS' },
                });
            }
        }

        return data;
    }

    // 3. Handle webhook
    async handleWebhook(payload: any, signature: string) {
        if (!this.secretKey) {
            throw new Error('PAYSTACK_SECRET_KEY is not set');
        }
        const hash = crypto
            .createHmac('sha512', this.secretKey as string)
            .update(JSON.stringify(payload))
            .digest('hex');

        if (hash !== signature) {
            return { status: 'error', message: 'Invalid signature' };
        }

        const event = payload.event;
        const data = payload.data;

        let updatedPayment;

        switch (event) {
            case 'charge.success':
                updatedPayment = await this.prisma.payment.update({
                    where: { reference: data.reference },
                    data: {
                        status: PaymentStatus.SUCCESS,
                        channel: data.channel,
                        gatewayResp: data.gateway_response,
                    },
                });
                break;

            case 'charge.failed':
                updatedPayment = await this.prisma.payment.update({
                    where: { reference: data.reference },
                    data: {
                        status: PaymentStatus.FAILED,
                        channel: data.channel,
                        gatewayResp: data.gateway_response,
                    },
                });
                break;

            default:
                console.log('Unhandled event:', event);
        }

        if (updatedPayment) {
            // 🔥 Emit update to all connected clients
            this.gateway.emitPaymentUpdate({
                reference: updatedPayment.reference,
                status: updatedPayment.status,
            });
        }

        return { status: 'ok', event };
    }

    // 💰 Fund wallet
    async fundWallet(userId: string, amount: number) {
        if (amount <= 0) throw new BadRequestException('Invalid amount');

        const wallet = await this.prisma.wallet.upsert({
            where: { userId },
            update: { balance: { increment: amount } },
            create: { userId, balance: amount },
        });

        await this.prisma.transaction.create({
            data: {
                reference: uuidv4(),
                userId,
                walletId: wallet.id,
                amount,
                type: 'CREDIT',
                channel: 'WALLET',
                status: 'SUCCESS',
            },
        });

        return { message: 'Wallet funded successfully', balance: wallet.balance };
    }

    // 🛒 Pay with wallet
    async payWithWallet(userId: string, amount: number) {
        const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
        if (!wallet) throw new BadRequestException('Wallet not found');
        if (wallet.balance < amount) throw new ForbiddenException('Insufficient wallet balance');

        // Deduct balance
        await this.prisma.wallet.update({
            where: { userId },
            data: { balance: { decrement: amount } },
        });

        // Create Payment record
        const payment = await this.prisma.payment.create({
            data: {
                userId,
                reference: uuidv4(),
                amount,
                status: 'SUCCESS',
                method: 'WALLET',
                channel: 'wallet',
                gatewayResp: 'Wallet payment successful',
            },
        });

        // Log Transaction
        await this.prisma.transaction.create({
            data: {
                reference: payment.reference,
                userId,
                walletId: wallet.id,
                amount,
                type: 'DEBIT',
                channel: 'WALLET',
                status: 'SUCCESS',
            },
        });

        return { message: 'Payment successful via wallet', payment };
    }

    // 👀 Check wallet balance
    async getWalletBalance(userId: string) {
        const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
        if (!wallet) throw new BadRequestException('Wallet not found'); 
        return { balance: wallet.balance };
    }
}

