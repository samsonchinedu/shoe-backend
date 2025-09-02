// src/cart/dto/add-to-cart.dto.ts
import { IsUUID, IsInt } from 'class-validator';

export class AddToCartDto {
    @IsUUID()
    productId: string;

    @IsInt()
    quantity: number;
}
