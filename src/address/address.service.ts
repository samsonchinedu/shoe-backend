// src/address/address.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AddressDto } from '@/order/dto/address.dto';
import { CreateAddressDto } from './dto/create-address.dto';
;

@Injectable()
export class AddressService {
    constructor(private prisma: PrismaService) { }

    async create(userId: string, dto: CreateAddressDto) {
        return this.prisma.address.create({
            data: {
                userId,
                ...dto,
            },
        });
    }

    async findByUser(userId: string): Promise<AddressDto[]> {
        const addresses = await this.prisma.address.findMany({
            where: { userId },
        });
        return addresses.map(address => ({
            ...address,
            postalCode: address.postalCode === null ? undefined : address.postalCode,
        }));
    }
}
