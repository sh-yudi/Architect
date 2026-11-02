import { describe, it, expect } from 'vitest';

describe('Project Test Harness', () => {
  it('should run unit tests correctly in TypeScript', () => {
    const sum = (a: number, b: number) => a + b;
    expect(sum(2, 3)).toBe(5);
  });
});
