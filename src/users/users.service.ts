// import { KYCStatus } from './../../node_modules/.prisma/client/index.d';
import { Injectable, NotFoundException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../../prisma/prisma.service";
import { UpdateKycDto } from "../update-kyc.dto";
// import { Role } from "@prisma/client";

export enum Role {
    BUYER = "BUYER",
    SELLER = "SELLER",
    ADMIN = "ADMIN",
}

export enum KYCStatus {
    PENDING = "PENDING",
    ACTIVE = "ACTIVE",
    DENIAL = "DENIAL",
}

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    // ✅ Create a new user (with hashed password)
    async create(data: {
        name: string;
        email: string;
        password: string;
        role?: Role;
    }): Promise<any> {
        const hashedPassword = await bcrypt.hash(data.password, 6);
        return this.prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashedPassword,
                role: data.role || Role.BUYER, // Default role if not provided
            },
        });
    }
    // ✅ Find a user by email
    async findByEmail(email: string): Promise<any | null> {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }
    // ✅ Find a user by ID
    async findById(id: string): Promise<any | null> {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!user) {
            throw new NotFoundException(`User not found`);
        }
        return user;
    }
    // ✅ List all users (admin use)
    async findAll(): Promise<any[]> {
        return this.prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                password: false,
            },
        });
    }
    //KYC Update Method
    async updateKyc(userId: string, dto: UpdateKycDto) {
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                kycData: {
                    country: dto.country,
                    phoneNumber: dto.phoneNumber,
                    email: dto.email || null,
                    idType: dto.idType,
                    idNumber: dto.idNumber,
                },
                kycStatus: KYCStatus.PENDING, // always pending until admin reviews
            },
        });
    }

    async verifyKyc(userId: string, status: KYCStatus) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { kycStatus: status },
        });
    }
}