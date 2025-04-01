// Mock fabric.js
jest.mock('fabric');
jest.mock('@/utils/fabric-utils');

import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { Editor, EditorWithStore } from '../Editor';
import { StoreContext } from '@/store';
import { Store } from '@/store/Store';
import { fabric, mockCanvas } from '@/__mocks__/fabric';

// Create a mock for the Store that doesn't depend on fabric
jest.mock('@/store/Store', () => {
  return {
    Store: jest.fn().mockImplementation(() => ({
      canvas: null,
      selectedElement: null,
      setCanvas: jest.fn(),
      setSelectedElement: jest.fn(),
      // Mock properties required by Store type
      backgroundColor: '#ffffff',
      selectedMenuOption: '',
      audios: [],
      videos: [],
      timelines: [],
      backgroundImage: null,
      coverImage: null,
      duration: 0,
      elements: [],
      fonts: [],
      mediaElements: [],
      selectedTimelineIndex: 0,
      textBoxes: [],
    })),
  };
});

// Mock child components
jest.mock('../Menu', () => ({
  Menu: () => <div data-testid="menu">Menu Component</div>,
}));

jest.mock('../Resources', () => ({
  Resources: () => <div data-testid="resources">Resources Component</div>,
}));

jest.mock('../TimeLine', () => ({
  TimeLine: () => <div data-testid="timeline">Timeline Component</div>,
}));

jest.mock('../panels/ElementsPanel', () => ({
  ElementsPanel: () => <div data-testid="elements-panel">Elements Panel</div>,
}));

// Define type for mouse down callback
type MouseDownCallback = (event: { target: any }) => void;

describe('Editor', () => {
  const mockStore = new Store();

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Reset our specific mocks for each test
    mockCanvas.on.mockReset();
    fabric.Canvas.mockReturnValue(mockCanvas);
  });

  it('renders without crashing', () => {
    render(
      <StoreContext.Provider value={mockStore}>
        <Editor />
      </StoreContext.Provider>
    );
    
    // Basic checks for elements that we'd expect to find
    expect(document.getElementById('canvas')).toBeInTheDocument();
    expect(document.getElementById('grid-canvas-container')).toBeInTheDocument();
  });

  it('renders all main components', () => {
    render(
      <StoreContext.Provider value={mockStore}>
        <Editor />
      </StoreContext.Provider>
    );
    
    // Check for the mocked components
    expect(screen.getByTestId('menu')).toBeInTheDocument();
    expect(screen.getByTestId('resources')).toBeInTheDocument();
    expect(screen.getByTestId('elements-panel')).toBeInTheDocument();
    expect(screen.getByTestId('timeline')).toBeInTheDocument();
  });

  it('initializes canvas with correct properties', () => {
    const { container } = render(
      <StoreContext.Provider value={mockStore}>
        <Editor />
      </StoreContext.Provider>
    );

    // Check if canvas container has correct classes
    const canvasContainer = container.querySelector('#grid-canvas-container');
    expect(canvasContainer).toHaveClass('bg-slate-100', 'flex', 'justify-center', 'items-center');

    // Check if canvas has correct classes
    const canvas = container.querySelector('#canvas');
    expect(canvas).toHaveClass('h-[500px]', 'w-[889px]', 'row');
  });

  it('renders footer with correct text', () => {
    render(
      <StoreContext.Provider value={mockStore}>
        <Editor />
      </StoreContext.Provider>
    );

    const footer = screen.getByText('Crafted By Amit Digga');
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveClass('col-span-4', 'text-right', 'px-2', 'text-[0.5em]', 'bg-black', 'text-white');
  });

  it('initializes store and canvas correctly', () => {
    const mockSetCanvas = jest.fn();
    const mockSetSelectedElement = jest.fn();
    const mockStore = new Store();
    mockStore.setCanvas = mockSetCanvas;
    mockStore.setSelectedElement = mockSetSelectedElement;

    render(
      <StoreContext.Provider value={mockStore}>
        <Editor />
      </StoreContext.Provider>
    );

    // Verify store methods were called
    expect(mockSetCanvas).toHaveBeenCalled(); // Just check that it was called, not with what
    expect(mockStore.setSelectedElement).not.toHaveBeenCalled(); // This is only called on mouse:down
  });

  it('registers mouse down event handler', () => {
    // For this test, we'll just verify the event handler is registered

    // Create a store with a mock setSelectedElement
    const mockSetSelectedElement = jest.fn();
    const mockStore = new Store();
    mockStore.setSelectedElement = mockSetSelectedElement;
    
    render(
      <StoreContext.Provider value={mockStore}>
        <Editor />
      </StoreContext.Provider>
    );
    
    // Verify the on method was called with mouse:down
    expect(mockCanvas.on).toHaveBeenCalledWith('mouse:down', expect.any(Function));
  });

  it('mouse down handler calls setSelectedElement with null when target is null', () => {
    // Create a mock function for testing
    const mockSetSelectedElement = jest.fn();
    
    // Get the callback directly from the mock.calls
    render(
      <StoreContext.Provider value={mockStore}>
        <Editor />
      </StoreContext.Provider>
    );
    
    // Find the callback from mock.calls
    const calls = mockCanvas.on.mock.calls.filter(call => call[0] === 'mouse:down');
    expect(calls.length).toBeGreaterThan(0);
    
    // Get the callback function and assert its type
    const mouseDownCallback = calls[0][1] as MouseDownCallback;
    
    // Call the handler directly with mockSetSelectedElement
    const originalStore = mockStore.setSelectedElement;
    mockStore.setSelectedElement = mockSetSelectedElement;
    
    // Call the handler with a null target
    mouseDownCallback({ target: null });
    
    // Restore original
    mockStore.setSelectedElement = originalStore;
    
    // Verify setSelectedElement was called with null
    expect(mockSetSelectedElement).toHaveBeenCalledWith(null);
  });

  it('sets up animation frame correctly for canvas rendering', () => {
    // We'll just verify the requestAnimFrame is called with a function
    // and that it sets up a rendering loop
    
    // Clear and override the mock
    fabric.util.requestAnimFrame.mockClear();
    
    render(
      <StoreContext.Provider value={mockStore}>
        <Editor />
      </StoreContext.Provider>
    );

    // Verify requestAnimFrame was called
    expect(fabric.util.requestAnimFrame).toHaveBeenCalled();
    
    // Verify it was called with a function argument
    const callback = fabric.util.requestAnimFrame.mock.calls[0][0];
    expect(typeof callback).toBe('function');
  });
});

// Test the EditorWithStore component
describe('EditorWithStore', () => {
  it('renders the Editor with a Store context', () => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Spy on React.useState
    const mockSetState = jest.fn();
    const useStateSpy = jest.spyOn(React, 'useState');
    useStateSpy.mockImplementation(() => [new Store(), mockSetState]);
    
    render(
      <EditorWithStore />
    );
    
    // Check that it's using the Store
    expect(useStateSpy).toHaveBeenCalled();
    
    // Check if main container is rendered
    expect(document.getElementById('grid-canvas-container')).toBeInTheDocument();
    
    // Clean up
    useStateSpy.mockRestore();
  });
}); 