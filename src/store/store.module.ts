import { Module } from "@nestjs/common";
import { PrismaModule } from "../../prisma/prisma.module";
import { StoreController } from "./store.controller";
import { StoreService } from "./store.service";


@Module({
    imports: [PrismaModule],
    controllers: [StoreController],
    providers: [StoreService],
    exports: [StoreService], // Export StoreService if needed in other modules
})

export class StoreModule { }