// Mock for fabric-utils.ts
export const CoverImage = jest.fn().mockImplementation(() => ({
  type: "coverImage",
  customFilter: "none",
  set: jest.fn(),
  scale: jest.fn(),
  setCoords: jest.fn(),
}));

export const BackgroundImage = jest.fn().mockImplementation(() => ({
  type: "backgroundImage",
  customFilter: "none",
  set: jest.fn(),
  scale: jest.fn(),
  setCoords: jest.fn(),
})); 