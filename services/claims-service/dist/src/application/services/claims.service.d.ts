import { ClaimStatus } from '@prisma/client';
import { CreateClaimDto } from '../dto/create-claim.dto';
import { UpdateClaimDto } from '../dto/update-claim.dto';
import { PrismaService } from '../../infrastructure/prisma.service';
import { ClaimFactoryProvider } from '../factories/claim-factory.provider';
import { OutboxService } from './outbox.service';
export interface AuditActorContext {
    actorId: string;
    actorRole: string;
    ipAddress: string;
}
export declare class ClaimsService {
    private prisma;
    private factoryProvider;
    private outboxService;
    constructor(prisma: PrismaService, factoryProvider: ClaimFactoryProvider, outboxService: OutboxService);
    create(createClaimDto: CreateClaimDto, actor?: AuditActorContext): Promise<{
        evidences: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            type: string;
            url: string | null;
            claimId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        objectId: string;
        status: import(".prisma/client").$Enums.ClaimStatus;
        rejectionReason: string | null;
    }>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<({
        evidences: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            type: string;
            url: string | null;
            claimId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        objectId: string;
        status: import(".prisma/client").$Enums.ClaimStatus;
        rejectionReason: string | null;
    })[]>;
    findOne(id: string): import(".prisma/client").Prisma.Prisma__ClaimClient<({
        evidences: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            type: string;
            url: string | null;
            claimId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        objectId: string;
        status: import(".prisma/client").$Enums.ClaimStatus;
        rejectionReason: string | null;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    findByStatus(status: ClaimStatus): import(".prisma/client").Prisma.PrismaPromise<({
        evidences: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            type: string;
            url: string | null;
            claimId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        objectId: string;
        status: import(".prisma/client").$Enums.ClaimStatus;
        rejectionReason: string | null;
    })[]>;
    findByFoundDateRange(start: Date, end: Date): import(".prisma/client").Prisma.PrismaPromise<({
        object: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string;
            photo: string;
            category: import(".prisma/client").$Enums.ObjectCategory;
            location: string;
            foundAt: Date;
        };
        evidences: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            type: string;
            url: string | null;
            claimId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        objectId: string;
        status: import(".prisma/client").$Enums.ClaimStatus;
        rejectionReason: string | null;
    })[]>;
    update(id: string, updateClaimDto: UpdateClaimDto, actor?: AuditActorContext): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        objectId: string;
        status: import(".prisma/client").$Enums.ClaimStatus;
        rejectionReason: string | null;
    }>;
    remove(id: string, actor?: AuditActorContext): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        objectId: string;
        status: import(".prisma/client").$Enums.ClaimStatus;
        rejectionReason: string | null;
    }>;
}
