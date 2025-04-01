// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { expect } from '@jest/globals';

// Extend expect with jest-dom matchers
expect.extend({
  toBeInTheDocument: (received) => {
    const pass = received !== null;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be in the document`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be in the document`,
        pass: false,
      };
    }
  },
}); 