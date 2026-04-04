import { ObjectsService } from './objects.service';
export declare class ObjectsController {
    private readonly objectsService;
    constructor(objectsService: ObjectsService);
    findAll(): Promise<({
        claims: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            objectId: string;
            status: import("@prisma/client").$Enums.ClaimStatus;
            rejectionReason: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        photo: string;
        category: import("@prisma/client").$Enums.ObjectCategory;
        location: string;
        foundAt: Date;
    })[]>;
    findOne(id: string): Promise<{
        claims: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            objectId: string;
            status: import("@prisma/client").$Enums.ClaimStatus;
            rejectionReason: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        photo: string;
        category: import("@prisma/client").$Enums.ObjectCategory;
        location: string;
        foundAt: Date;
    }>;
}
