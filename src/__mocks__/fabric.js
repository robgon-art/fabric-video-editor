// Mock fabric.js

const mockCanvas = {
  on: jest.fn(),
  renderAll: jest.fn(),
  setDimensions: jest.fn(),
  getObjects: jest.fn().mockReturnValue([]),
};

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
  Image: jest.fn().mockImplementation(() => ({
    set: jest.fn(),
    scale: jest.fn(),
    setCoords: jest.fn(),
    setControlsVisibility: jest.fn(),
  })),
  util: {
    requestAnimFrame: jest.fn().mockReturnValue(0),
    createClass: jest.fn().mockImplementation((parent, properties) => {
      const newClass = function() {
        return {
          ...properties,
          set: jest.fn(),
          scale: jest.fn(),
          setCoords: jest.fn(),
          setControlsVisibility: jest.fn(),
        };
      };
      return newClass;
    }),
  },
};

module.exports = { fabric, mockCanvas };
module.exports.default = fabric;
module.exports.__esModule = true; 