import { IsNotEmpty, IsOptional, IsString } from "class-validator";


export class CreateStoreDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;
}