// src/order/dto/create-order.dto.ts
import { IsNotEmpty, IsArray, ValidateNested, IsUUID, IsInt, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
    @IsUUID()
    productId: string;

    @IsInt()
    quantity: number;

    @IsNumber()
    price: number;
}

export class CreateOrderDto {
    @IsNotEmpty()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];
}
