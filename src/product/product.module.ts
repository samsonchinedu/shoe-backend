import { Module } from "@nestjs/common";
import { ProductController } from "./product.controller";
import { ProductService } from "./product.service";
import { PrismaModule } from "../../prisma/prisma.module";
import { StoreModule } from "@/store/store.module";


@Module({
    imports: [PrismaModule, StoreModule], // Import StoreModule to use StoreService
    controllers: [ProductController],
    providers: [ProductService],
})
export class ProductModule { }