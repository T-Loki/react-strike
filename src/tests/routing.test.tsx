import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { MainMenu } from '../pages/MainMenu';
import { ModeSelectMenu } from '../pages/ModeSelectMenu';

describe('Routing States', () => {
  it('MainMenu navigates to mode_select on Start Game', () => {
    const navigateSpy = vi.fn();
    render(<MainMenu onNavigate={navigateSpy} />);
    
    // Find the button (contains 'Start Game')
    const startButton = screen.getByText('Start Game').closest('button');
    fireEvent.click(startButton!);
    
    expect(navigateSpy).toHaveBeenCalledWith('mode_select');
  });

  it('ModeSelectMenu navigates to battle on Valhalla Defense click', () => {
    const navigateSpy = vi.fn();
    render(<ModeSelectMenu onNavigate={navigateSpy} />);
    
    // Click Valhalla Defense (Main Campaign)
    const battleBtn = screen.getByText('Valhalla Defense').closest('button');
    fireEvent.click(battleBtn!);
    
    expect(navigateSpy).toHaveBeenCalledWith('battle');
  });

  it('ModeSelectMenu navigates to sandbox on Combat Sandbox click', () => {
    const navigateSpy = vi.fn();
    render(<ModeSelectMenu onNavigate={navigateSpy} />);
    
    // Click Combat Sandbox
    const sandboxBtn = screen.getByText('Combat Sandbox').closest('button');
    fireEvent.click(sandboxBtn!);
    
    expect(navigateSpy).toHaveBeenCalledWith('sandbox');
  });
});
