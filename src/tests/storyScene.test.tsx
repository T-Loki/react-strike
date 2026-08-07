import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StoryScene } from '../features/visual_novel/StoryScene';
import type { StoryScript } from '../types/vn';

describe('StoryScene', () => {
  const testScript: StoryScript = {
    id: 'test',
    title: 'Test Script',
    lines: [
      { id: '1', speaker: 'Speaker A', text: 'Line 1' },
      { id: '2', speaker: 'Speaker B', text: 'Line 2' },
    ]
  };

  it('renders the first line of the script', () => {
    render(<StoryScene script={testScript} />);
    
    expect(screen.getByText('Speaker A')).toBeInTheDocument();
    expect(screen.getByText('Line 1')).toBeInTheDocument();
  });

  it('advances to the next line on click', () => {
    render(<StoryScene script={testScript} />);
    
    const container = screen.getByText('Line 1').parentElement?.parentElement as HTMLElement;
    fireEvent.click(container);
    
    expect(screen.getByText('Speaker B')).toBeInTheDocument();
    expect(screen.getByText('Line 2')).toBeInTheDocument();
  });

  it('calls onNavigate when clicking past the last line', () => {
    const onNavigate = vi.fn();
    render(<StoryScene script={testScript} onNavigate={onNavigate} />);
    
    const container = screen.getByText('Line 1').parentElement?.parentElement as HTMLElement;
    
    // Click to Line 2
    fireEvent.click(container);
    expect(screen.getByText('Line 2')).toBeInTheDocument();
    
    // Click past the end
    fireEvent.click(container);
    expect(onNavigate).toHaveBeenCalledWith('menu');
  });
});
