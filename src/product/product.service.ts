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
        try {
            // ensure the product exists
            const product = await this.findById(id);

            // Check ownership
            const store = await this.prisma.store.findFirst({
                where: { ownerId: userId },
            });

            if (!store || product.storeId !== store.id) {
                throw new NotFoundException('You do not own this product');
            }

            return await this.prisma.product.update({
                where: { id },
                data: {
                    title: dto.title,
                    size: dto.size,
                    color: dto.color,
                    price: dto.price,
                    stock: dto.stock,
                    images: dto.images,
                },
            });
        } catch (err) {
            console.error('Update Product Error:', err); // 👈 log actual cause
            throw err; // rethrow so Nest handles it
        }
    }



    // Delete a product by ID
    async remove(id: string) {
        await this.findById(id); // ensure the product exists before deletion
        return this.prisma.product.delete({
            where: { id },
        });
    }
}