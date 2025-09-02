import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { KYCStatus } from './users/users.service';

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

    @IsOptional()
    @IsEnum(KYCStatus)
    kycStatus?: KYCStatus;
}
