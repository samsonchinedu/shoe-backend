import { IsString, IsNumber, IsArray, IsUUID } from 'class-validator';

export class CreateProductDto {
    @IsString()
    title: string;

    @IsNumber()
    size: number;

    @IsString()
    color: string;

    @IsNumber()
    price: number;

    @IsNumber()
    stock: number;

    @IsArray()
    images: string[];
}
