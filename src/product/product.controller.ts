import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { ProductService } from "./product.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { StoreService } from "@/store/store.service";
import { AuthGuard } from "@nestjs/passport";



@Controller('product')
export class ProductController {
    constructor(
        private readonly productService: ProductService,
        private readonly storeService: StoreService,
    ) { }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    async create(@Body() dto: CreateProductDto, @Req() req: any) {
        const userId = req.user.id;
        const store = await this.storeService.getMyStore(userId);
        if (!store) {
            throw new Error('Store not found for the user');
        }
        return this.productService.create(dto, store.id);
    }

    @Get('all')
    findAll() {
        return this.productService.findAll();
    }

    @Get(':id')
    findById(@Param('id') id: string) {
        return this.productService.findById(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateProductDto, @Req() req: any) {
        const userId = req.user.id
        return this.productService.update(id, dto, userId);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.productService.remove(id);
    }
}