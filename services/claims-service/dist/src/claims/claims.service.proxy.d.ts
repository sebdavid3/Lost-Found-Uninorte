import { ClaimStatus, Role } from '@prisma/client';
import { ClaimsService } from './claims.service';
export interface ClaimAccessContext {
    userId: string;
    role: Role;
}
export declare class ClaimsServiceProxy {
    private readonly claimsService;
    private readonly logger;
    constructor(claimsService: ClaimsService);
    findAll(context: ClaimAccessContext): Promise<({
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
    findOne(id: string, context: ClaimAccessContext): Promise<({
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
    }) | null>;
    findByStatus(status: ClaimStatus, context: ClaimAccessContext): Promise<({
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
    findByFoundDateRange(start: Date, end: Date, context: ClaimAccessContext): Promise<({
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
    private ensureAdmin;
    private logClaimAccess;
}
