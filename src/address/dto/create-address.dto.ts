// src/address/dto/create-address.dto.ts
import { IsString, IsOptional } from 'class-validator';

export class CreateAddressDto {
    @IsString()
    street: string;

    @IsString()
    city: string;

    @IsString()
    state: string;

    @IsString()
    country: string;

    @IsOptional()
    @IsString()
    postalCode?: string;
}
