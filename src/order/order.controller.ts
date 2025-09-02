import { Controller, Post, Get, Param, Body, UseGuards, Req } from '@nestjs/common';
import { OrderService } from './order.service';
import { AuthGuard } from '@nestjs/passport';
import { AddressDto } from './dto/address.dto';

@Controller('orders')
@UseGuards(AuthGuard('jwt'))
export class OrderController {
    constructor(private readonly orderService: OrderService) { }

    @Post('checkout')
    async checkout(@Req() req: any, @Body() dto: AddressDto) {
        return this.orderService.checkout(req.user.id, dto.id);
    }

    @Get()
    async getOrders(@Req() req: any) {
        return this.orderService.getUserOrders(req.user.id);
    }

    @Get(':id')
    async getOrder(@Param('id') id: string, @Req() req: any) {
        return this.orderService.getOrderById(id, req.user.id);
    }
}
