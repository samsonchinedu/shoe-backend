// src/payment/payment.controller.ts
import { Controller, Post, Body, Get, Query, Req, Headers, UseGuards, Param } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@Controller('payment')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) { }

    @UseGuards(JwtAuthGuard)
    @Post('wallet/fund')
    async fundWallet(@Body() dto: CreatePaymentDto, @Req() req) {
        // Step 1: Initialize paystack payment
        return this.paymentService.initializePayment(req.user.id, dto);
    }

    @Get('wallet/verify/:reference')
    async verifyWalletFunding(@Param('reference') reference: string) {
    const data = await this.paymentService.verifyPayment(reference);
    return { success: true, data };
    }


    @Get('wallet/balance')
    @UseGuards(JwtAuthGuard)
    async getWalletBalance(@Req() req) {
    const userId = req.user.id;
    return this.paymentService.getWalletBalance(userId);
    }


    @Post('webhook')
    async webhook(@Req() req: any, @Headers('x-paystack-signature') signature: string) {
        return this.paymentService.handleWebhook(req.body, signature);
    }
}
