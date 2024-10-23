import { describe, it, expect } from "vitest";

// Mock contract state and functions
let tokenId = 0;
const tokens = {};
const tokenMetadata = {};
const listings = {};

const mint = (uri, title, description, royalty) => {
  if (royalty > 100) throw new Error("Royalty cannot exceed 100");
  
  tokenId += 1;
  tokens[tokenId] = {
    uri,
    title,
    description,
    royalty,
  };
  tokenMetadata[tokenId] = {
    creator: "tx-sender",
    title,
    description,
  };
  
  return tokenId;
};

const transfer = (tokenId, sender, recipient) => {
  if (!tokens[tokenId]) throw new Error("Token does not exist");
  
  tokens[tokenId].owner = recipient;
  
  return true;
};

const createListing = (tokenId, price) => {
  if (!tokens[tokenId]) throw new Error("Token does not exist");
  
  listings[tokenId] = {
    seller: tokens[tokenId].owner || "tx-sender",
    price,
    active: true,
  };
  
  return true;
};

const purchaseListing = (tokenId) => {
  const listing = listings[tokenId];
  if (!listing || !listing.active) throw new Error("Listing is not active");
  
  listings[tokenId].active = false;
  
  return true;
};

// Tests
describe("IP Token Contract", () => {
  
  it("should mint a new IP token", () => {
    const newTokenId = mint(
        "https://ipfs.io/ipfs/Qm123",
        "Awesome Token",
        "This is an awesome IP token",
        10
    );
    
    expect(newTokenId).toBe(1);
    expect(tokenMetadata[1].title).toBe("Awesome Token");
    expect(tokenMetadata[1].description).toBe("This is an awesome IP token");
  });
  
  it("should transfer an IP token", () => {
    const sender = "user1";
    const recipient = "user2";
    const newTokenId = mint(
        "https://ipfs.io/ipfs/Qm123",
        "Awesome Token",
        "This is an awesome IP token",
        10
    );
    
    transfer(newTokenId, sender, recipient);
    
    expect(tokens[newTokenId].owner).toBe(recipient);
  });
  
  it("should create a listing for an IP token", () => {
    const newTokenId = mint(
        "https://ipfs.io/ipfs/Qm123",
        "Awesome Token",
        "This is an awesome IP token",
        10
    );
    
    createListing(newTokenId, 1000);
    
    expect(listings[newTokenId].price).toBe(1000);
    expect(listings[newTokenId].active).toBe(true);
  });
  
  it("should purchase a listed IP token", () => {
    const newTokenId = mint(
        "https://ipfs.io/ipfs/Qm123",
        "Awesome Token",
        "This is an awesome IP token",
        10
    );
    
    createListing(newTokenId, 1000);
    const purchaseStatus = purchaseListing(newTokenId);
    
    expect(purchaseStatus).toBe(true);
    expect(listings[newTokenId].active).toBe(false);
  });
  
});
