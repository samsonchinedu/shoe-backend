import { Body, Controller, Request, UseGuards, Post, Put, Get, ForbiddenException } from "@nestjs/common";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { StoreService } from "./store.service";
import { CreateStoreDto } from "./dto/create-store.dto";
import { UpdateStoreDto } from "./dto/update-store.dto";


@UseGuards(JwtAuthGuard)
@Controller('store')
export class StoreController {
    constructor(private storeService: StoreService) { }

    // ✅ Any logged-in user can create ONE store
    @Post()
    async createStore(@Request() req, @Body() body: CreateStoreDto) {
        return this.storeService.createStore(req.user.id, body);
    }

    // ✅ Owner can update their store
    @Put('update')
    async updateStore(@Request() req, @Body() dto: UpdateStoreDto) {
        return this.storeService.updateStore(req.user.id, dto);
    }

    // ✅ Only the owner can see their store
    @Get('me')
    async getMyStore(@Request() req) {
        return this.storeService.getMyStore(req.user.id)
    }

    // ✅ Admin-only: list all stores
    @Get()
    async getAllStores(@Request() req) {
        if (req.user.role !== 'ADMIN') {
            throw new ForbiddenException('Only admins can view all stores');
        }

        return this.storeService.getAllStores();
    }
}