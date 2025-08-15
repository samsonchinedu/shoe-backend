
import { UsersService } from './users.service';
import { Controller, ForbiddenException, Get, Request, UseGuards, Post, Body } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateKycDto } from '@/update-kyc.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    // 🔐 Logged-in user profile
    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@Request() req) {
        return this.usersService.findById(req.user.id);
    }

    // 🔐 Admin-only route to list all users
    @UseGuards(JwtAuthGuard)
    @Get()
    async getAllUsers(@Request() req) {
        // Role-based access check
        if (req.user.role !== 'ADMIN') {
            throw new ForbiddenException('Access denied: Admins only');
        }

        return this.usersService.findAll(); // Assuming findAll() returns all users
    }



    // 🔐 KYC Update Method
    @UseGuards(JwtAuthGuard)
    @Post('kyc')
    async sumbitKyc(@Request() req, @Body() body: UpdateKycDto) {
        return this.usersService.updateKyc(req.user.id, body);
    }
}
