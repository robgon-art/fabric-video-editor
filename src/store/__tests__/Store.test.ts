/**
 * Store.test.ts
 * Unit tests for the Store class
 * 
 * Testing Strategy:
 * - Mock external dependencies (fabric.js, anime.js, FFmpeg)
 * - Use the existing mock for fabric.js from src/__mocks__/fabric.js
 * - Test each functionality separately with clear expectations
 */

// Mock mobx
jest.mock('mobx', () => ({
  makeAutoObservable: jest.fn()
}));

// Mock fabric.js canvas methods
jest.mock('@/utils/fabric-utils', () => ({
  FabricUitls: {
    getClipMaskRect: jest.fn()
  }
}));

// Mock FFmpeg
jest.mock('@ffmpeg/ffmpeg', () => ({
  FFmpeg: jest.fn().mockImplementation(() => ({
    load: jest.fn(),
    writeFile: jest.fn(),
    exec: jest.fn(),
    readFile: jest.fn(),
    terminate: jest.fn()
  }))
}));

// Mock FFmpeg util
jest.mock('@ffmpeg/util', () => ({
  toBlobURL: jest.fn()
}));

// Mock animejs with proper timeline methods
jest.mock('animejs', () => {
  const timeline = jest.fn().mockReturnValue({
    add: jest.fn().mockReturnThis(),
    seek: jest.fn()
  });
  
  // Create a mock anime function with necessary properties
  const anime = jest.fn();
  // Cast to any to bypass TypeScript errors
  (anime as any).timeline = timeline;
  (anime as any).remove = jest.fn();
  
  return { __esModule: true, default: anime };
});

// Mock utils
jest.mock('@/utils', () => ({
  getUid: jest.fn().mockReturnValue('test-id'),
  isHtmlAudioElement: jest.fn(),
  isHtmlVideoElement: jest.fn(),
  isHtmlImageElement: jest.fn()
}));

import { Store, isEditorVideoElement, isEditorImageElement, isEditorAudioElement } from '../Store';
import { fabric, mockCanvas } from '@/__mocks__/fabric';
import { EditorElement, Animation, MenuOption, Placement, TextEditorElement, Effect } from '@/types';

describe('Store', () => {
  let store: Store;
  let mockFabricObject: fabric.Text;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Setup canvas mock for tests
    mockCanvas.backgroundColor = '#111111';
    mockCanvas.setActiveObject = jest.fn();
    mockCanvas.discardActiveObject = jest.fn();
    mockCanvas.remove = jest.fn();
    mockCanvas.add = jest.fn();
    
    // Create a mock fabric Text object
    mockFabricObject = new fabric.Text();
    mockFabricObject.on = jest.fn();
    
    store = new Store();
    // Set canvas manually since we're using the real implementation
    store.setCanvas(mockCanvas as unknown as fabric.Canvas);
  });

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      const newStore = new Store();
      expect(newStore.backgroundColor).toBe('#111111');
      expect(newStore.maxTime).toBe(30 * 1000);
      expect(newStore.playing).toBe(false);
      expect(newStore.currentKeyFrame).toBe(0);
      expect(newStore.selectedElement).toBeNull();
      expect(newStore.fps).toBe(60);
      expect(newStore.animations).toEqual([]);
      expect(newStore.selectedMenuOption).toBe('Video');
      expect(newStore.selectedVideoFormat).toBe('mp4');
      expect(newStore.videos).toEqual([]);
      expect(newStore.images).toEqual([]);
      expect(newStore.audios).toEqual([]);
      expect(newStore.editorElements).toEqual([]);
    });

    it('should calculate currentTimeInMs correctly', () => {
      store.currentKeyFrame = 60; // 1 second at 60fps
      expect(store.currentTimeInMs).toBe(1000);
    });

    it('should set current time correctly', () => {
      store.setCurrentTimeInMs(2000); // 2 seconds
      expect(store.currentKeyFrame).toBe(120); // 2 seconds at 60fps
    });
  });

  describe('Resource Management', () => {
    it('should add video resource', () => {
      const videoUrl = 'test-video.mp4';
      store.addVideoResource(videoUrl);
      expect(store.videos).toContain(videoUrl);
    });

    it('should add audio resource', () => {
      const audioUrl = 'test-audio.mp3';
      store.addAudioResource(audioUrl);
      expect(store.audios).toContain(audioUrl);
    });

    it('should add image resource', () => {
      const imageUrl = 'test-image.jpg';
      store.addImageResource(imageUrl);
      expect(store.images).toContain(imageUrl);
    });

    it('should set multiple videos', () => {
      const videos = ['video1.mp4', 'video2.mp4'];
      store.setVideos(videos);
      expect(store.videos).toEqual(videos);
    });
  });

  describe('Menu and UI State', () => {
    it('should set selected menu option', () => {
      const menuOption: MenuOption = 'Audio';
      store.setSelectedMenuOption(menuOption);
      expect(store.selectedMenuOption).toBe(menuOption);
    });

    it('should set background color', () => {
      const color = '#ff0000';
      store.setBackgroundColor(color);
      expect(store.backgroundColor).toBe(color);
      expect(mockCanvas.backgroundColor).toBe(color);
    });
  });

  describe('Animation Management', () => {
    it('should add animation', () => {
      const animation: Animation = {
        id: 'test-animation',
        targetId: 'test-element',
        type: 'fadeIn',
        duration: 1000,
        properties: {}
      };
      
      // Create a mock editor element that the animation targets
      const mockElement: EditorElement = {
        id: 'test-element',
        type: 'text',
        name: 'Test Text Element',
        fabricObject: mockFabricObject,
        timeFrame: { start: 0, end: 5000 },
        placement: { 
          x: 0, 
          y: 0, 
          width: 100, 
          height: 100,
          rotation: 0,
          scaleX: 1,
          scaleY: 1
        },
        properties: {
          text: 'test',
          fontSize: 12,
          fontWeight: 400,
          splittedTexts: []
        }
      };
      
      // Add the element first
      store.addEditorElement(mockElement);
      
      // Add the animation
      store.addAnimation(animation);
      expect(store.animations).toContainEqual(animation);
    });

    it('should update animation', () => {
      // Create a mock editor element that the animation targets
      const mockElement: EditorElement = {
        id: 'test-element',
        type: 'text',
        name: 'Test Text Element',
        fabricObject: mockFabricObject,
        timeFrame: { start: 0, end: 5000 },
        placement: { 
          x: 0, 
          y: 0, 
          width: 100, 
          height: 100,
          rotation: 0,
          scaleX: 1,
          scaleY: 1
        },
        properties: {
          text: 'test',
          fontSize: 12,
          fontWeight: 400,
          splittedTexts: []
        }
      };
      
      // Add the element first
      store.addEditorElement(mockElement);
      
      const animation: Animation = {
        id: 'test-animation',
        targetId: 'test-element',
        type: 'fadeIn',
        duration: 1000,
        properties: {}
      };
      store.addAnimation(animation);

      const updatedAnimation: Animation = {
        ...animation,
        duration: 2000
      };
      store.updateAnimation('test-animation', updatedAnimation);
      
      const foundAnimation = store.animations.find(a => a.id === 'test-animation');
      expect(foundAnimation?.duration).toBe(2000);
    });

    it('should remove animation', () => {
      // Create a mock editor element
      const mockElement: EditorElement = {
        id: 'test-element',
        type: 'text',
        name: 'Test Text Element',
        fabricObject: mockFabricObject,
        timeFrame: { start: 0, end: 5000 },
        placement: { 
          x: 0, 
          y: 0, 
          width: 100, 
          height: 100,
          rotation: 0,
          scaleX: 1,
          scaleY: 1
        },
        properties: {
          text: 'test',
          fontSize: 12,
          fontWeight: 400,
          splittedTexts: []
        }
      };
      
      // Add the element first
      store.addEditorElement(mockElement);
      
      const animation: Animation = {
        id: 'test-animation',
        targetId: 'test-element',
        type: 'fadeIn',
        duration: 1000,
        properties: {}
      };
      store.addAnimation(animation);
      expect(store.animations).toContainEqual(animation);

      store.removeAnimation('test-animation');
      expect(store.animations).not.toContainEqual(animation);
    });
  });

  describe('Editor Element Management', () => {
    it('should add editor element', () => {
      const element: EditorElement = {
        id: 'test-element',
        type: 'text',
        name: 'Test Text Element',
        fabricObject: mockFabricObject,
        timeFrame: { start: 0, end: 5000 },
        placement: { 
          x: 0, 
          y: 0, 
          width: 100, 
          height: 100,
          rotation: 0,
          scaleX: 1,
          scaleY: 1
        },
        properties: {
          text: 'test',
          fontSize: 12,
          fontWeight: 400,
          splittedTexts: []
        }
      };
      store.addEditorElement(element);
      expect(store.editorElements).toContainEqual(element);
      expect(store.selectedElement).toBe(store.editorElements[0]);
    });

    it('should update editor element timeframe', () => {
      const element: EditorElement = {
        id: 'test-element',
        type: 'text',
        name: 'Test Text Element',
        fabricObject: mockFabricObject,
        timeFrame: { start: 0, end: 5000 },
        placement: { 
          x: 0, 
          y: 0, 
          width: 100, 
          height: 100,
          rotation: 0,
          scaleX: 1,
          scaleY: 1
        },
        properties: {
          text: 'test',
          fontSize: 12,
          fontWeight: 400,
          splittedTexts: []
        }
      };
      store.addEditorElement(element);
      
      const newTimeFrame = { start: 1000, end: 4000 };
      store.updateEditorElementTimeFrame(element, newTimeFrame);
      
      const updatedElement = store.editorElements.find(e => e.id === 'test-element');
      expect(updatedElement?.timeFrame).toEqual(newTimeFrame);
    });

    it('should remove editor element', () => {
      const element: EditorElement = {
        id: 'test-element',
        type: 'text',
        name: 'Test Text Element',
        fabricObject: mockFabricObject,
        timeFrame: { start: 0, end: 5000 },
        placement: { 
          x: 0, 
          y: 0, 
          width: 100, 
          height: 100,
          rotation: 0,
          scaleX: 1,
          scaleY: 1
        },
        properties: {
          text: 'test',
          fontSize: 12,
          fontWeight: 400,
          splittedTexts: []
        }
      };
      store.addEditorElement(element);
      expect(store.editorElements).toContainEqual(element);

      store.removeEditorElement('test-element');
      expect(store.editorElements).not.toContainEqual(element);
    });
  });

  describe('Playback', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should set playing state', () => {
      store.setPlaying(true);
      expect(store.playing).toBe(true);
      
      // Advance timers to trigger animation frames
      jest.advanceTimersByTime(100);
      
      store.setPlaying(false);
      expect(store.playing).toBe(false);
    });

    it('should handle seek', () => {
      store.handleSeek(2000); // 2 seconds
      expect(store.currentKeyFrame).toBe(120); // 2 seconds at 60fps
    });
  });
}); 