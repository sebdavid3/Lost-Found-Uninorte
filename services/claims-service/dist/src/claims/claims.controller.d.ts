import { ClaimStatus } from '@prisma/client';
import type { Request } from 'express';
import { ClaimsService } from './claims.service';
import { CreateClaimDto } from './dto/create-claim.dto';
import { UpdateClaimDto } from './dto/update-claim.dto';
import { ClaimsServiceProxy } from './claims.service.proxy';
import { PrismaService } from '../prisma/prisma.service';
export declare class ClaimsController {
    private readonly claimsService;
    private readonly claimsServiceProxy;
    private readonly prisma;
    constructor(claimsService: ClaimsService, claimsServiceProxy: ClaimsServiceProxy, prisma: PrismaService);
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
    findAll(request: Request): Promise<({
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
    findByStatus(request: Request, status: ClaimStatus): Promise<({
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
    findByDateRange(request: Request, start: string, end: string): Promise<({
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
    findOne(id: string, request: Request): Promise<({
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
    verify(id: string, request: Request): Promise<{
        message: string;
        claim: {
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
            user: {
                id: string;
                email: string;
                name: string;
                role: import("@prisma/client").$Enums.Role;
                createdAt: Date;
                updatedAt: Date;
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
        };
    }>;
    private getContextFromRequest;
    private parseClaimStatus;
    private parseDateRange;
    private getRejectionDetails;
    audit(id: string, request: Request): Promise<{
        message: string;
        auditReport: string;
        similarityScores: {
            evidenceId: string;
            type: string;
            score: number;
        }[];
    }>;
}
