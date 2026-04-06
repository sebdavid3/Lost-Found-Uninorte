import { ClaimStatus } from '@prisma/client';
import type { Request } from 'express';
import { ClaimsService } from '../../application/services/claims.service';
import { CreateClaimDto } from '../../application/dto/create-claim.dto';
import { UpdateClaimDto } from '../../application/dto/update-claim.dto';
import { ClaimsServiceProxy } from './claims.service.proxy';
import { PrismaService } from '../prisma.service';
import { OutboxService } from '../../application/services/outbox.service';
export declare class ClaimsController {
    private readonly claimsService;
    private readonly claimsServiceProxy;
    private readonly prisma;
    private readonly outboxService;
    constructor(claimsService: ClaimsService, claimsServiceProxy: ClaimsServiceProxy, prisma: PrismaService, outboxService: OutboxService);
    create(createClaimDto: CreateClaimDto, request: Request): Promise<{
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
    findAll(request: Request): Promise<({
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
    findByStatus(request: Request, status: ClaimStatus): Promise<({
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
    findByDateRange(request: Request, start: string, end: string): Promise<({
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
    findOne(id: string, request: Request): Promise<{
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
    update(id: string, updateClaimDto: UpdateClaimDto, request: Request): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        objectId: string;
        status: import(".prisma/client").$Enums.ClaimStatus;
        rejectionReason: string | null;
    }>;
    remove(id: string, request: Request): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        objectId: string;
        status: import(".prisma/client").$Enums.ClaimStatus;
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
                category: import(".prisma/client").$Enums.ObjectCategory;
                location: string;
                foundAt: Date;
            };
            user: {
                id: string;
                email: string;
                name: string;
                role: import(".prisma/client").$Enums.Role;
                createdAt: Date;
                updatedAt: Date;
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
        };
    }>;
    private getContextFromRequest;
    private parseClaimStatus;
    private parseDateRange;
    private getRejectionDetails;
    private getAuditContextFromRequest;
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
