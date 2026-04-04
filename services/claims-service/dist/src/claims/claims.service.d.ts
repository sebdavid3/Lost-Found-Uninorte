import { ClaimStatus } from '@prisma/client';
import { CreateClaimDto } from './dto/create-claim.dto';
import { UpdateClaimDto } from './dto/update-claim.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ClaimFactoryProvider } from './factories/claim-factory.provider';
export declare class ClaimsService {
    private prisma;
    private factoryProvider;
    constructor(prisma: PrismaService, factoryProvider: ClaimFactoryProvider);
    create(createClaimDto: CreateClaimDto): Promise<{
        evidences: {
            url: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            type: string;
            claimId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        objectId: string;
        status: import("@prisma/client").$Enums.ClaimStatus;
        rejectionReason: string | null;
    }>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
        evidences: {
            url: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            type: string;
            claimId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        objectId: string;
        status: import("@prisma/client").$Enums.ClaimStatus;
        rejectionReason: string | null;
    })[]>;
    findOne(id: string): import("@prisma/client").Prisma.Prisma__ClaimClient<({
        evidences: {
            url: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            type: string;
            claimId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        objectId: string;
        status: import("@prisma/client").$Enums.ClaimStatus;
        rejectionReason: string | null;
    }) | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findByStatus(status: ClaimStatus): import("@prisma/client").Prisma.PrismaPromise<({
        evidences: {
            url: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            type: string;
            claimId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        objectId: string;
        status: import("@prisma/client").$Enums.ClaimStatus;
        rejectionReason: string | null;
    })[]>;
    findByFoundDateRange(start: Date, end: Date): import("@prisma/client").Prisma.PrismaPromise<({
        object: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string;
            photo: string;
            category: import("@prisma/client").$Enums.ObjectCategory;
            location: string;
            foundAt: Date;
        };
        evidences: {
            url: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            type: string;
            claimId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        objectId: string;
        status: import("@prisma/client").$Enums.ClaimStatus;
        rejectionReason: string | null;
    })[]>;
    update(id: string, updateClaimDto: UpdateClaimDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        objectId: string;
        status: import("@prisma/client").$Enums.ClaimStatus;
        rejectionReason: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        objectId: string;
        status: import("@prisma/client").$Enums.ClaimStatus;
        rejectionReason: string | null;
    }>;
}
