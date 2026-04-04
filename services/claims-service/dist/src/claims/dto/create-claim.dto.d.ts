import { ObjectCategory } from '@prisma/client';
export declare class EvidenceDto {
    type: string;
    url?: string;
    description?: string;
}
export declare class CreateClaimDto {
    userId: string;
    objectId: string;
    objectCategory: ObjectCategory;
    evidences: EvidenceDto[];
}
