import { Controller, Post, Get, Param, Body, UseGuards, Req } from '@nestjs/common';
import { OrderService } from './order.service';
import { AuthGuard } from '@nestjs/passport';
import { AddressDto } from './dto/address.dto';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
@UseGuards(AuthGuard('jwt'))
export class OrderController {
    constructor(private readonly orderService: OrderService) { }

    @Post('create')
    async createOrder(
        @Req() req: any,
        @Body() body: { items: CreateOrderDto['items'] }
    ) {
        return this.orderService.createOrder(req.user.id, body.items);
    }


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
