// src/order/dto/create-order.dto.ts
import { IsNotEmpty, IsArray, ValidateNested, IsUUID, IsInt, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
    @IsUUID()
    productId: string;

    @IsInt()
    quantity: number;

    @IsNumber()
    price: number;
}

export class AddressDto {
    @IsString()
    street: string;

    @IsString()
    city: string;

    @IsString()
    state: string;

    @IsString()
    country: string;
}

export class CreateOrderDto {
    @IsNotEmpty()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];

    @ValidateNested()
    @Type(() => AddressDto)
    address: AddressDto;
}
