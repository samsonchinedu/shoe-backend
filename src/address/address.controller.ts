// src/address/address.controller.ts
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { AddressDto } from '@/order/dto/address.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@Controller('address')
@UseGuards(JwtAuthGuard)
export class AddressController {
    constructor(private readonly addressService: AddressService) { }

    @Post()
    async create(@Req() req: any, @Body() dto: CreateAddressDto): Promise<AddressDto> {
        const address = await this.addressService.create(req.user.id, dto);
        return {
            ...address,
            postalCode: address.postalCode === null ? undefined : address.postalCode,
        };
    }

    @Get()
    async findByUser(@Req() req: any): Promise<AddressDto[]> {
        return this.addressService.findByUser(req.user.id);
    }
}
