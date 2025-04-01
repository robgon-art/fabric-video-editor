// Mock fabric.js
jest.mock('fabric');
jest.mock('@/utils/fabric-utils');

import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { Editor } from '../Editor';
import { StoreContext } from '@/store';
import { Store } from '@/store/Store';

// Create a mock for the Store that doesn't depend on fabric
jest.mock('@/store/Store', () => {
  return {
    Store: jest.fn().mockImplementation(() => ({
      canvas: null,
      selectedElement: null,
      setCanvas: jest.fn(),
      setSelectedElement: jest.fn(),
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

describe('Editor', () => {
  const mockStore = new Store();

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
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
}); 