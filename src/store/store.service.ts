import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateStoreDto } from "./dto/create-store.dto";
import { UpdateStoreDto } from "./dto/update-store.dto";


@Injectable()
export class StoreService {
    constructor(private prisma: PrismaService) { }

    async createStore(ownerId: string, dto: CreateStoreDto) {
        const existingStore = await this.prisma.store.findFirst({
            where: { ownerId },
        });

        if (existingStore) {
            throw new Error('User already owns a store');
        }

        return this.prisma.store.create({
            data: {
                ownerId,
                name: dto.name,
                description: dto.description,
            },
        })
    }

    async updateStore(ownerId: string, dto: UpdateStoreDto) {
        // Make sure the user owns a store
        const store = await this.prisma.store.findFirst({
            where: { ownerId },
        });

        if (!store) {
            throw new Error('You do not own a store');
        }

        return this.prisma.store.update({
            where: { id: store.id },
            data: {
                name: dto.name,
                description: dto.description,
            },
        });
    }

    async getMyStore(ownerId: string) {
        return this.prisma.store.findFirst({
            where: { ownerId },
            include: { owner: true, products: true },
        });
    }

    async getAllStores() {
        return this.prisma.store.findMany();
    }
}