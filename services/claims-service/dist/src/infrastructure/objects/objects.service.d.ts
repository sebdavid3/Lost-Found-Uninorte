import { PrismaService } from '../prisma.service';
export declare class ObjectsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        photo: string;
        category: import(".prisma/client").$Enums.ObjectCategory;
        location: string;
        foundAt: Date;
    }[]>;
    findOne(id: string): import(".prisma/client").Prisma.Prisma__ObjectClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        photo: string;
        category: import(".prisma/client").$Enums.ObjectCategory;
        location: string;
        foundAt: Date;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
}
