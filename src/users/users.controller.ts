
import { KYCStatus, UsersService } from './users.service';
import { Controller, ForbiddenException, Get, Request, UseGuards, Post, Body, Put, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateKycDto } from '@/update-kyc.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@/auth/roles/roles.guard';
import { Roles } from '@/auth/roles/roles.decorator';

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

    // ✅ ADMIN reviews KYC
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('ADMIN')
    @Put(':id/kyc-status')
    async verifyKyc(@Param('id') userId: string, @Body('status') status: KYCStatus,) {
        return this.usersService.verifyKyc(userId, status);
    }
}
