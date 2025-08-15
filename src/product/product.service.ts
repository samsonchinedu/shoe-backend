import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";



@Injectable()
export class ProductService {
    constructor(private prisma: PrismaService) { }

    // Create a product

    async create(dto: CreateProductDto, userId: string) {
        // Get the user's storeId
        const store = await this.prisma.store.findFirst({
            where: { id: userId },
            select: { id: true },
        })

        if (!store) {
            throw new NotFoundException('Store not found for this user');
        }

        const product = await this.prisma.product.create({
            data: {
                storeId: store.id,
                title: dto.title,
                size: dto.size,
                color: dto.color,
                price: dto.price,
                stock: dto.stock,
                images: dto.images, // string[]
            },
            include: { store: true, }, // include the store relation if needed
        });
        return product;
    }

    // Get all products
    async findAll() {
        return this.prisma.product.findMany();
    }

    // Get a product by ID
    async findById(id: string) {
        const product = await this.prisma.product.findUnique({
            where: { id },
        });

        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        return product;
    }

    // Update a product by ID
    async update(id: string, dto: UpdateProductDto, userId: string) {
        // ensure the product exists
        await this.findById(id);

        // Get the user's storeId
        const store = await this.prisma.store.findUnique({
            where: { ownerId: userId },
            select: { id: true },
        })

        if (!store) {
            throw new NotFoundException('Store not found for this user');
        }

        return this.prisma.product.update({
            where: { id },
            data: {
                storeId: store.id,
                title: dto.title,
                size: dto.size,
                color: dto.color,
                price: dto.price,
                stock: dto.stock,
                images: dto.images, // string[]
            },
        });
    }

    // Delete a product by ID
    async remove(id: string) {
        await this.findById(id); // ensure the product exists before deletion
        return this.prisma.product.delete({
            where: { id },
        });
    }
}