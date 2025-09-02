import { IsString, IsOptional, IsUUID, IsDateString } from 'class-validator';

export class AddressDto {
    @IsUUID()
    id: string;

    @IsUUID()
    userId: string;

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

    @IsDateString()
    createdAt: Date;

    @IsDateString()
    updatedAt: Date;
}