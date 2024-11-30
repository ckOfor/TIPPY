import { describe, it, expect, beforeEach } from 'vitest';

// Mock implementation of the creator-reputation contract
const CreatorReputationContract = {
  creatorReputations: new Map(),
  contractOwner: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  
  initializeCreator(creator, sender) {
    if (sender !== this.contractOwner) throw new Error('ERR-NOT-AUTHORIZED');
    this.creatorReputations.set(creator, { score: 100, tokensMinted: 0, totalRevenue: 0, successfulSales: 0 });
    return { success: true };
  },
  
  updateReputationTokenMinted(creator, sender) {
    if (sender !== this.contractOwner) throw new Error('ERR-NOT-AUTHORIZED');
    const currentRep = this.getCreatorReputation(creator);
    currentRep.score += 10;
    currentRep.tokensMinted += 1;
    this.creatorReputations.set(creator, currentRep);
    return { success: true };
  },
  
  updateReputationSale(creator, revenue, sender) {
    if (sender !== this.contractOwner) throw new Error('ERR-NOT-AUTHORIZED');
    const currentRep = this.getCreatorReputation(creator);
    currentRep.score += 5;
    currentRep.totalRevenue += revenue;
    currentRep.successfulSales += 1;
    this.creatorReputations.set(creator, currentRep);
    return { success: true };
  },
  
  adjustReputationScore(creator, adjustment, sender) {
    if (sender !== this.contractOwner) throw new Error('ERR-NOT-AUTHORIZED');
    const currentRep = this.getCreatorReputation(creator);
    const newScore = Math.max(0, currentRep.score + adjustment);
    currentRep.score = newScore;
    this.creatorReputations.set(creator, currentRep);
    return { success: true };
  },
  
  getCreatorReputation(creator) {
    return this.creatorReputations.get(creator) || { score: 0, tokensMinted: 0, totalRevenue: 0, successfulSales: 0 };
  }
};

describe('Creator Reputation Contract', () => {
  const testCreator = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';
  const unauthorizedUser = 'ST3PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
  
  beforeEach(() => {
    CreatorReputationContract.creatorReputations.clear();
  });
  
  describe('Initialize Creator', () => {
    it('should initialize a new creator with default reputation', () => {
      const result = CreatorReputationContract.initializeCreator(testCreator, CreatorReputationContract.contractOwner);
      expect(result.success).toBe(true);
      const reputation = CreatorReputationContract.getCreatorReputation(testCreator);
      expect(reputation.score).toBe(100);
      expect(reputation.tokensMinted).toBe(0);
      expect(reputation.totalRevenue).toBe(0);
      expect(reputation.successfulSales).toBe(0);
    });
    
    it('should not allow unauthorized initialization', () => {
      expect(() => CreatorReputationContract.initializeCreator(testCreator, unauthorizedUser)).toThrow('ERR-NOT-AUTHORIZED');
    });
  });
  
  describe('Update Reputation', () => {
    beforeEach(() => {
      CreatorReputationContract.initializeCreator(testCreator, CreatorReputationContract.contractOwner);
    });
    
    it('should update reputation when token is minted', () => {
      CreatorReputationContract.updateReputationTokenMinted(testCreator, CreatorReputationContract.contractOwner);
      const reputation = CreatorReputationContract.getCreatorReputation(testCreator);
      expect(reputation.score).toBe(110);
      expect(reputation.tokensMinted).toBe(1);
    });
    
    it('should update reputation when sale occurs', () => {
      CreatorReputationContract.updateReputationSale(testCreator, 1000, CreatorReputationContract.contractOwner);
      const reputation = CreatorReputationContract.getCreatorReputation(testCreator);
      expect(reputation.score).toBe(105);
      expect(reputation.totalRevenue).toBe(1000);
      expect(reputation.successfulSales).toBe(1);
    });
    
    it('should not allow unauthorized reputation updates', () => {
      expect(() => CreatorReputationContract.updateReputationTokenMinted(testCreator, unauthorizedUser)).toThrow('ERR-NOT-AUTHORIZED');
      expect(() => CreatorReputationContract.updateReputationSale(testCreator, 1000, unauthorizedUser)).toThrow('ERR-NOT-AUTHORIZED');
    });
  });
  
  describe('Adjust Reputation Score', () => {
    beforeEach(() => {
      CreatorReputationContract.initializeCreator(testCreator, CreatorReputationContract.contractOwner);
    });
    
    it('should allow positive score adjustment', () => {
      CreatorReputationContract.adjustReputationScore(testCreator, 50, CreatorReputationContract.contractOwner);
      const reputation = CreatorReputationContract.getCreatorReputation(testCreator);
      expect(reputation.score).toBe(150);
    });
    
    it('should allow negative score adjustment', () => {
      CreatorReputationContract.adjustReputationScore(testCreator, -50, CreatorReputationContract.contractOwner);
      const reputation = CreatorReputationContract.getCreatorReputation(testCreator);
      expect(reputation.score).toBe(50);
    });
    
    it('should not allow score to go below zero', () => {
      CreatorReputationContract.adjustReputationScore(testCreator, -150, CreatorReputationContract.contractOwner);
      const reputation = CreatorReputationContract.getCreatorReputation(testCreator);
      expect(reputation.score).toBe(0);
    });
    
    it('should not allow unauthorized score adjustments', () => {
      expect(() => CreatorReputationContract.adjustReputationScore(testCreator, 50, unauthorizedUser)).toThrow('ERR-NOT-AUTHORIZED');
    });
  });
  
  describe('Get Creator Reputation', () => {
    it('should return default values for non-existent creator', () => {
      const reputation = CreatorReputationContract.getCreatorReputation('ST3PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM');
      expect(reputation.score).toBe(0);
      expect(reputation.tokensMinted).toBe(0);
      expect(reputation.totalRevenue).toBe(0);
      expect(reputation.successfulSales).toBe(0);
    });
  });
});

