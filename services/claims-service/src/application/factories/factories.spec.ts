import { ElectronicClaimFactory } from './electronic-claim.factory';
import { CommonClaimFactory } from './common-claim.factory';
import { ClaimFactoryProvider } from './claim-factory.provider';
import { ObjectCategory } from '@prisma/client';
import { EvidenceDto } from '../dto/create-claim.dto';
import { BadRequestException } from '@nestjs/common';

describe('Factories — Evidence Validation', () => {
  const createEvidence = (type: string, description: string, url?: string): EvidenceDto => ({
    type: type as any,
    description,
    url,
  });

  describe('ElectronicClaimFactory', () => {
    let factory: ElectronicClaimFactory;

    beforeEach(() => {
      factory = new ElectronicClaimFactory();
    });

    it('should validate SERIAL_NUMBER as sufficient', () => {
      const result = factory.validateEvidences([
        createEvidence('SERIAL_NUMBER', 'SN123456'),
      ]);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate DIGITAL_INVOICE as sufficient', () => {
      const result = factory.validateEvidences([
        createEvidence('DIGITAL_INVOICE', 'Invoice PDF', 'https://inv.pdf'),
      ]);
      expect(result.isValid).toBe(true);
    });

    it('should validate both SERIAL_NUMBER and DIGITAL_INVOICE together', () => {
      const result = factory.validateEvidences([
        createEvidence('SERIAL_NUMBER', 'SN123'),
        createEvidence('DIGITAL_INVOICE', 'Invoice', 'https://inv'),
      ]);
      expect(result.isValid).toBe(true);
    });

    it('should reject when only DESCRIPTION/PHOTO provided', () => {
      const result = factory.validateEvidences([
        createEvidence('DETAILED_DESCRIPTION', 'Blue laptop'),
        createEvidence('REFERENCE_PHOTO', 'Photo', 'https://img'),
      ]);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toMatch(/Número de Serie.*Factura Digital/);
    });

    it('should reject empty evidences array', () => {
      const result = factory.validateEvidences([]);
      expect(result.isValid).toBe(false);
    });
  });

  describe('CommonClaimFactory', () => {
    let factory: CommonClaimFactory;

    beforeEach(() => {
      factory = new CommonClaimFactory();
    });

    it('should pass with DETAILED_DESCRIPTION and REFERENCE_PHOTO', () => {
      const result = factory.validateEvidences([
        createEvidence('DETAILED_DESCRIPTION', 'Blue thermos 500ml'),
        createEvidence('REFERENCE_PHOTO', 'My photo', 'https://img'),
      ]);
      expect(result.isValid).toBe(true);
    });

    it('should reject when only DESCRIPTION provided (no PHOTO)', () => {
      const result = factory.validateEvidences([
        createEvidence('DETAILED_DESCRIPTION', 'Blue thermos'),
      ]);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toMatch(/Descripción Detallada.*Foto de Referencia/);
    });

    it('should reject when only PHOTO provided (no DESCRIPTION)', () => {
      const result = factory.validateEvidences([
        createEvidence('REFERENCE_PHOTO', 'Photo', 'https://img'),
      ]);
      expect(result.isValid).toBe(false);
    });

    it('should reject SERIAL_NUMBER for common objects', () => {
      const result = factory.validateEvidences([
        createEvidence('SERIAL_NUMBER', 'SN123'),
      ]);
      expect(result.isValid).toBe(false);
    });

    it('should reject empty evidences array', () => {
      const result = factory.validateEvidences([]);
      expect(result.isValid).toBe(false);
    });
  });

  describe('ClaimFactoryProvider', () => {
    let provider: ClaimFactoryProvider;

    beforeEach(() => {
      provider = new ClaimFactoryProvider(
        new ElectronicClaimFactory(),
        new CommonClaimFactory(),
      );
    });

    it('should return ElectronicClaimFactory for ELECTRONIC', () => {
      const factory = provider.getFactory(ObjectCategory.ELECTRONIC);
      expect(factory).toBeInstanceOf(ElectronicClaimFactory);
    });

    it('should return CommonClaimFactory for COMMON', () => {
      const factory = provider.getFactory(ObjectCategory.COMMON);
      expect(factory).toBeInstanceOf(CommonClaimFactory);
    });

    it('should return CommonClaimFactory for CLOTHING', () => {
      const factory = provider.getFactory(ObjectCategory.CLOTHING);
      expect(factory).toBeInstanceOf(CommonClaimFactory);
    });

    it('should return CommonClaimFactory for ACCESSORY', () => {
      const factory = provider.getFactory(ObjectCategory.ACCESSORY);
      expect(factory).toBeInstanceOf(CommonClaimFactory);
    });

    it('should return CommonClaimFactory for DOCUMENT', () => {
      const factory = provider.getFactory(ObjectCategory.DOCUMENT);
      expect(factory).toBeInstanceOf(CommonClaimFactory);
    });

    it('should return CommonClaimFactory for STATIONERY', () => {
      const factory = provider.getFactory(ObjectCategory.STATIONERY);
      expect(factory).toBeInstanceOf(CommonClaimFactory);
    });

    it('should return CommonClaimFactory for OTHER', () => {
      const factory = provider.getFactory(ObjectCategory.OTHER);
      expect(factory).toBeInstanceOf(CommonClaimFactory);
    });

    it('should throw BadRequestException for unknown category', () => {
      expect(() => provider.getFactory('UNKNOWN' as ObjectCategory)).toThrow(BadRequestException);
    });
  });
});
