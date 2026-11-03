import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SpaceModifierBlock } from '@/components/floorplan/SpaceModifierBlock';
import { Room } from '@/types/plan';

const mockRoom: Room = {
  id: 'f1-horizontal-lobby',
  name: 'Horizontal Staircase Lobby',
  x: 5,
  y: 14,
  width: 10,
  length: 9,
  doors: [{ id: 'd1', wall: 'top', offset: 5, width: 3.5 }],
  windows: [],
};

describe('SpaceModifierBlock component', () => {
  it('should render helper guidance when no room is selected', () => {
    render(
      <SpaceModifierBlock
        selectedRoom={null}
        floorLevel={null}
        plotWidth={20}
        plotLength={45}
        onUpdateSpace={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText(/Click Any Room or Space to Inspect & Modify/i)).toBeDefined();
  });

  it('should display selected room name, floor, and dimensions', () => {
    render(
      <SpaceModifierBlock
        selectedRoom={mockRoom}
        floorLevel={1}
        floorName="First Floor"
        plotWidth={20}
        plotLength={45}
        onUpdateSpace={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('AI Space Modifier & Inspector')).toBeDefined();
    expect(screen.getByDisplayValue('Horizontal Staircase Lobby')).toBeDefined();
    expect(screen.getByText('First Floor')).toBeDefined();
    expect(screen.getByText(/90 sq ft/)).toBeDefined();
  });

  it('should call onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <SpaceModifierBlock
        selectedRoom={mockRoom}
        floorLevel={1}
        plotWidth={20}
        plotLength={45}
        onUpdateSpace={vi.fn()}
        onClose={handleClose}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should submit AI prompt when Update Space via AI is clicked', async () => {
    const handleUpdate = vi.fn();
    render(
      <SpaceModifierBlock
        selectedRoom={mockRoom}
        floorLevel={1}
        plotWidth={20}
        plotLength={45}
        onUpdateSpace={handleUpdate}
        onClose={vi.fn()}
      />
    );

    const textarea = screen.getByPlaceholderText(/Make this a dog-legged staircase/i);
    fireEvent.change(textarea, { target: { value: 'Make staircase dog-legged with 8ft width' } });

    const submitBtn = screen.getByRole('button', { name: /Update Space via AI/i });
    fireEvent.click(submitBtn);

    expect(handleUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: 'Make staircase dog-legged with 8ft width',
      })
    );
  });
});
