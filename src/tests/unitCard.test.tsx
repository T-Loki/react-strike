import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UnitCard } from '../components/ui/UnitCard';
import { VANGUARD_SPEARMAN, ARIC_SHIELDBREAKER, ORC_WARRIOR, GARRISON_SOLDIER } from '../data/units';
import { DAMAGE_TYPE_DESCRIPTIONS, ARMOR_TYPE_DESCRIPTIONS } from '../core/math/combatMath';

describe('UnitCard Component', () => {
  describe('Core Presentational Elements', () => {
    it('renders unit name, type, and core stats correctly in deployment mode', () => {
      render(<UnitCard unit={VANGUARD_SPEARMAN} variant="deployment" count={5} />);

      expect(screen.getByText('Vanguard Spearman')).toBeInTheDocument();
      expect(screen.getByText('common')).toBeInTheDocument();
      expect(screen.getByText(String(VANGUARD_SPEARMAN.hp))).toBeInTheDocument();
      expect(screen.getByText(String(VANGUARD_SPEARMAN.damage))).toBeInTheDocument();
      expect(screen.getByText(String(VANGUARD_SPEARMAN.range))).toBeInTheDocument();
      expect(screen.getByText('ATK SPD')).toBeInTheDocument();
      expect(screen.getByText('MOV SPD')).toBeInTheDocument();
      expect(screen.getByText(`${VANGUARD_SPEARMAN.attackSpeed}s`)).toBeInTheDocument();
      expect(screen.getByText(String(VANGUARD_SPEARMAN.speed))).toBeInTheDocument();
    });

    it('renders color-coded combat badges with descriptive tooltips', () => {
      render(<UnitCard unit={VANGUARD_SPEARMAN} variant="deployment" />);

      const atkBadge = screen.getByText(`ATK: ${VANGUARD_SPEARMAN.damageType}`);
      const defBadge = screen.getByText(`DEF: ${VANGUARD_SPEARMAN.armorType}`);

      expect(atkBadge).toBeInTheDocument();
      expect(atkBadge).toHaveAttribute('title', DAMAGE_TYPE_DESCRIPTIONS[VANGUARD_SPEARMAN.damageType!]);

      expect(defBadge).toBeInTheDocument();
      expect(defBadge).toHaveAttribute('title', ARMOR_TYPE_DESCRIPTIONS[VANGUARD_SPEARMAN.armorType!]);
    });

    it('renders hero and elite specific visual cues and badges', () => {
      const { rerender } = render(<UnitCard unit={ARIC_SHIELDBREAKER} variant="city_management" />);
      expect(screen.getByText(/Aric the Shieldbreaker/)).toBeInTheDocument();
      expect(screen.getByText('hero')).toBeInTheDocument();

      rerender(<UnitCard unit={ORC_WARRIOR} variant="city_management" />);
      expect(screen.getByText('Orc Warrior')).toBeInTheDocument();
      expect(screen.getByText('elite')).toBeInTheDocument();
    });
  });

  describe('variant="deployment" Specialization', () => {
    it('renders numeric stack count chip', () => {
      render(<UnitCard unit={VANGUARD_SPEARMAN} variant="deployment" count={12} />);
      const countElement = screen.getByTestId('unit-card-count');
      expect(countElement).toBeInTheDocument();
      expect(countElement).toHaveTextContent('×12');
    });

    it('renders infinite indicator in sandbox mode', () => {
      render(<UnitCard unit={VANGUARD_SPEARMAN} variant="deployment" isInfinite={true} />);
      expect(screen.getByText('· Unlimited')).toBeInTheDocument();
      expect(screen.getByTestId('unit-card-count')).toBeInTheDocument();
    });

    it('displays active glowing border and "Ready to Place" indicator when isSelected=true', () => {
      const { rerender } = render(
        <UnitCard unit={VANGUARD_SPEARMAN} variant="deployment" isSelected={false} />
      );
      expect(screen.queryByText('Ready to Place')).not.toBeInTheDocument();

      rerender(<UnitCard unit={VANGUARD_SPEARMAN} variant="deployment" isSelected={true} />);
      expect(screen.getByText('Ready to Place')).toBeInTheDocument();
    });

    it('fires onClick callback when clicked', () => {
      const handleClick = vi.fn();
      render(<UnitCard unit={VANGUARD_SPEARMAN} variant="deployment" onClick={handleClick} />);

      const card = screen.getByRole('button');
      fireEvent.click(card);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('suppresses click handlers when isDisabled=true', () => {
      const handleClick = vi.fn();
      render(<UnitCard unit={VANGUARD_SPEARMAN} variant="deployment" isDisabled={true} onClick={handleClick} />);

      const card = screen.getByRole('button');
      fireEvent.click(card);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('variant="city_management" Specialization', () => {
    it('renders upkeep cost tag and assigned location name', () => {
      render(
        <UnitCard
          unit={VANGUARD_SPEARMAN}
          variant="city_management"
          count={8}
          assignedLocationName="Outer Barren Fields"
        />
      );

      expect(screen.getByTestId('unit-card-upkeep')).toBeInTheDocument();
      expect(screen.getByText(/g \/ turn/)).toBeInTheDocument();
      expect(screen.getByText('Outer Barren Fields')).toBeInTheDocument();
      expect(screen.getByTestId('unit-card-count')).toHaveTextContent('x8');
    });

    it('supports custom upkeepCost override', () => {
      render(
        <UnitCard
          unit={VANGUARD_SPEARMAN}
          variant="city_management"
          upkeepCost={25}
        />
      );

      expect(screen.getByTestId('unit-card-upkeep')).toHaveTextContent('25g / turn');
    });

    it('renders built-in action buttons and handles onAction callbacks', () => {
      const handleAction = vi.fn();
      render(
        <UnitCard
          unit={VANGUARD_SPEARMAN}
          variant="city_management"
          onAction={handleAction}
        />
      );

      const deployBtn = screen.getByRole('button', { name: /deploy/i });
      const recallBtn = screen.getByRole('button', { name: /recall/i });

      fireEvent.click(deployBtn);
      expect(handleAction).toHaveBeenCalledWith('deploy');

      fireEvent.click(recallBtn);
      expect(handleAction).toHaveBeenCalledWith('return');
    });

    it('supports customActionLabel button with inspect action', () => {
      const handleAction = vi.fn();
      render(
        <UnitCard
          unit={VANGUARD_SPEARMAN}
          variant="city_management"
          customActionLabel="Quick Reallocate"
          onAction={handleAction}
        />
      );

      const customBtn = screen.getByRole('button', { name: 'Quick Reallocate' });
      fireEvent.click(customBtn);
      expect(handleAction).toHaveBeenCalledWith('inspect');
    });

    it('renders custom actions slot when provided', () => {
      render(
        <UnitCard
          unit={VANGUARD_SPEARMAN}
          variant="city_management"
          actions={<button type="button">Custom Transfer All</button>}
        />
      );

      expect(screen.getByRole('button', { name: 'Custom Transfer All' })).toBeInTheDocument();
    });

    it('displays Fixed Garrison indicator for bound units', () => {
      render(
        <UnitCard
          unit={GARRISON_SOLDIER}
          variant="city_management"
        />
      );

      expect(screen.getByText('Fixed Garrison')).toBeInTheDocument();
    });
  });
});
