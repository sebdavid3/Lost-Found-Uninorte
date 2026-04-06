import { ClaimStatus } from '@prisma/client';
import { ClaimsService } from '../../application/services/claims.service';
export interface ClaimAccessContext {
    role: string;
    userId: string;
}
export declare class ClaimsServiceProxy {
    private readonly claimsService;
    constructor(claimsService: ClaimsService);
    findAll(context: ClaimAccessContext): Promise<({
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
    findOne(id: string, context: ClaimAccessContext): Promise<{
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
    findByStatus(status: ClaimStatus, context: ClaimAccessContext): Promise<({
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
    findByFoundDateRange(start: Date, end: Date, context: ClaimAccessContext): Promise<({
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
}
