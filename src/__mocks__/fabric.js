// Mock fabric.js

const mockCanvas = {
  on: jest.fn(),
  renderAll: jest.fn(),
  setDimensions: jest.fn(),
  getObjects: jest.fn().mockReturnValue([]),
  backgroundColor: '#111111',
  setActiveObject: jest.fn(),
  discardActiveObject: jest.fn(),
  remove: jest.fn(),
  add: jest.fn(),
  width: 1920,
  height: 1080
};

// Helper function to create mock fabric objects with common methods
const createMockFabricObject = () => ({
  set: jest.fn(),
  scale: jest.fn(),
  setCoords: jest.fn(),
  setControlsVisibility: jest.fn(),
  on: jest.fn(),
});

const fabric = {
  Canvas: jest.fn().mockImplementation(() => mockCanvas),
  Object: {
    prototype: {
      transparentCorners: false,
      cornerColor: '#00a0f5',
      cornerStyle: 'circle',
      cornerStrokeColor: '#0063d8',
      cornerSize: 10,
    },
  },
  Image: jest.fn().mockImplementation(() => createMockFabricObject()),
  Textbox: jest.fn().mockImplementation(() => createMockFabricObject()),
  Text: jest.fn().mockImplementation(() => createMockFabricObject()),
  util: {
    requestAnimFrame: jest.fn().mockReturnValue(0),
    createClass: jest.fn().mockImplementation((parent, properties) => {
      const newClass = function() {
        return {
          ...properties,
          ...createMockFabricObject(),
        };
      };
      return newClass;
    }),
  },
};

module.exports = { fabric, mockCanvas };
module.exports.default = fabric;
module.exports.__esModule = true; 