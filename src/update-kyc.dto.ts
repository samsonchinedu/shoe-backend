import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateKycDto {
    @IsNotEmpty()
    @IsString()
    country: string;

    @IsNotEmpty()
    @IsString()
    phoneNumber: string;

    @IsOptional()
    @IsString()
    email?: string;

    @IsNotEmpty()
    @IsString()
    idType: string; // "NIN" or "Passport"

    @IsNotEmpty()
    @IsString()
    idNumber: string;
}
