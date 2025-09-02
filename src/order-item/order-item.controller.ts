import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
import { OrderItemService } from './order-item.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('orders/:orderId/items')
@UseGuards(AuthGuard('jwt'))
export class OrderItemController {
    constructor(private readonly orderItemService: OrderItemService) { }

    @Get()
    async list(@Param('orderId') orderId: string, @Req() req: any) {
        return this.orderItemService.getItemsForOrder(orderId, req.user.id);
    }

    @Get(':itemId')
    async getItem(@Param('itemId') itemId: string, @Req() req: any) {
        return this.orderItemService.getItemById(itemId, req.user.id);
    }
}
