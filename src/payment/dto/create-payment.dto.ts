// src/payment/dto/create-payment.dto.ts
import { IsEmail, IsNumber, Min, IsOptional, IsString } from 'class-validator';

export class CreatePaymentDto {
    @IsEmail()
    email: string;

    @IsNumber()
    @Min(1)
    amount: number; // in Naira, will be converted to Kobo

    @IsOptional()
    @IsString()
    currency?: string = 'NGN';
}
