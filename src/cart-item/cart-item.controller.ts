// src/cart/cart.controller.ts
import { Controller, Post, Get, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { CartService } from './cart-item.service';

@Controller('cart')
@UseGuards(AuthGuard('jwt'))
export class CartController {
    constructor(private readonly cartService: CartService) { }

    @Post('add')
    addToCart(@GetUser('id') userId: string, @Body() dto: AddToCartDto) {
        return this.cartService.addToCart(userId, dto);
    }

    @Get(':id')
    getCart(@GetUser('id') userId: string) {
        return this.cartService.getCart(userId);
    }

    @Delete(':productId')
    removeFromCart(@GetUser('id') userId: string, @Param('productId') productId: string) {
        return this.cartService.removeFromCart(userId, productId);
    }

    @Delete('all')
    clearCart(@GetUser('id') userId: string) {
        console.log(`Clearing cart for user: ${userId}`);
        return this.cartService.clearCart(userId);
    }
}
