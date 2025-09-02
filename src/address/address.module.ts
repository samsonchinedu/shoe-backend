import { Module } from "@nestjs/common";
import { AddressService } from "./address.service";
import { PrismaService } from "../../prisma/prisma.service";
import { AddressController } from "./address.controller";



@Module({
    controllers: [AddressController],
    providers: [AddressService, PrismaService],
    exports: [AddressService],
})
export class AddressModule { }