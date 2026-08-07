import type { TerritoryWaveProfile } from '../types/combat';

export const TERRITORY_WAVE_PROFILES: Record<string, TerritoryWaveProfile> = {
  terr_outer_fields: {
    territoryId: 'terr_outer_fields',
    defaultFaction: 'horde',
    waves: [
      {
        waveNumber: 1,
        title: 'Outer Patrol',
        composition: [
          { unitTemplateId: 'unit_goblin_skirmisher', count: 5, linePosition: 'back' },
          { unitTemplateId: 'unit_orc_grunt', count: 4, linePosition: 'front' },
        ],
      },
      {
        waveNumber: 2,
        title: 'Horde Vanguard',
        composition: [
          { unitTemplateId: 'unit_goblin_skirmisher', count: 6, linePosition: 'back' },
          { unitTemplateId: 'unit_orc_grunt', count: 6, linePosition: 'front' },
        ],
        statModifiers: { hpMultiplier: 1.1, damageMultiplier: 1.05 },
      },
      {
        waveNumber: 3,
        title: 'Outpost Commander',
        isBossWave: true,
        bossId: 'unit_orc_warrior',
        composition: [
          { unitTemplateId: 'unit_orc_warrior', count: 1, linePosition: 'front' },
          { unitTemplateId: 'unit_orc_grunt', count: 6, linePosition: 'mid' },
          { unitTemplateId: 'unit_goblin_skirmisher', count: 4, linePosition: 'back' },
        ],
        statModifiers: { hpMultiplier: 1.2, damageMultiplier: 1.1 },
      },
    ],
  },

  terr_merchant_slums: {
    territoryId: 'terr_merchant_slums',
    defaultFaction: 'horde',
    waves: [
      {
        waveNumber: 1,
        title: 'Slum Raiders',
        composition: [
          { unitTemplateId: 'unit_goblin_skirmisher', count: 6, linePosition: 'back' },
          { unitTemplateId: 'unit_orc_grunt', count: 5, linePosition: 'front' },
        ],
      },
      {
        waveNumber: 2,
        title: 'Warg Pack Ambush',
        composition: [
          { unitTemplateId: 'unit_shadow_warg', count: 4, linePosition: 'front' },
          { unitTemplateId: 'unit_orc_grunt', count: 4, linePosition: 'mid' },
        ],
      },
      {
        waveNumber: 3,
        title: 'Berserker Charge',
        composition: [
          { unitTemplateId: 'unit_horde_berserker', count: 3, linePosition: 'front' },
          { unitTemplateId: 'unit_goblin_skirmisher', count: 6, linePosition: 'back' },
        ],
        statModifiers: { hpMultiplier: 1.15, damageMultiplier: 1.15 },
      },
      {
        waveNumber: 4,
        title: 'Raider Captain',
        isBossWave: true,
        bossId: 'unit_orc_warrior',
        composition: [
          { unitTemplateId: 'unit_orc_warrior', count: 2, linePosition: 'front' },
          { unitTemplateId: 'unit_horde_berserker', count: 2, linePosition: 'mid' },
          { unitTemplateId: 'unit_shadow_warg', count: 3, linePosition: 'back' },
        ],
        statModifiers: { hpMultiplier: 1.25, damageMultiplier: 1.2 },
      },
    ],
  },

  terr_inner_fortress: {
    territoryId: 'terr_inner_fortress',
    defaultFaction: 'horde',
    waves: [
      {
        waveNumber: 1,
        title: 'Fortress Assault',
        composition: [
          { unitTemplateId: 'unit_orc_warrior', count: 3, linePosition: 'front' },
          { unitTemplateId: 'unit_orc_grunt', count: 6, linePosition: 'mid' },
        ],
      },
      {
        waveNumber: 2,
        title: 'Siege Column',
        composition: [
          { unitTemplateId: 'unit_orc_warrior', count: 4, linePosition: 'front' },
          { unitTemplateId: 'unit_goblin_skirmisher', count: 8, linePosition: 'back' },
        ],
        statModifiers: { hpMultiplier: 1.2, damageMultiplier: 1.15 },
      },
      {
        waveNumber: 3,
        title: 'Behemoth Breach',
        isBossWave: true,
        bossId: 'unit_horde_behemoth',
        composition: [
          { unitTemplateId: 'unit_horde_behemoth', count: 1, linePosition: 'front' },
          { unitTemplateId: 'unit_horde_berserker', count: 3, linePosition: 'mid' },
          { unitTemplateId: 'unit_shadow_warg', count: 3, linePosition: 'back' },
        ],
        statModifiers: { hpMultiplier: 1.3, damageMultiplier: 1.2 },
      },
    ],
  },

  terr_valhalla: {
    territoryId: 'terr_valhalla',
    defaultFaction: 'horde',
    waves: [
      {
        waveNumber: 1,
        title: 'Citadel Gate Rush',
        composition: [
          { unitTemplateId: 'unit_orc_warrior', count: 4, linePosition: 'front' },
          { unitTemplateId: 'unit_horde_berserker', count: 3, linePosition: 'mid' },
          { unitTemplateId: 'unit_goblin_skirmisher', count: 6, linePosition: 'back' },
        ],
      },
      {
        waveNumber: 2,
        title: 'Shadow Horde',
        composition: [
          { unitTemplateId: 'unit_shadow_warg', count: 6, linePosition: 'front' },
          { unitTemplateId: 'unit_orc_warrior', count: 4, linePosition: 'mid' },
        ],
        statModifiers: { hpMultiplier: 1.25, damageMultiplier: 1.2 },
      },
      {
        waveNumber: 3,
        title: 'Citadel Siege Vanguard',
        isBossWave: true,
        bossId: 'unit_horde_behemoth',
        composition: [
          { unitTemplateId: 'unit_horde_behemoth', count: 1, linePosition: 'front' },
          { unitTemplateId: 'unit_orc_warrior', count: 4, linePosition: 'mid' },
          { unitTemplateId: 'unit_goblin_skirmisher', count: 8, linePosition: 'back' },
        ],
        statModifiers: { hpMultiplier: 1.35, damageMultiplier: 1.25 },
      },
      {
        waveNumber: 4,
        title: 'Final Doom Horde',
        isBossWave: true,
        bossId: 'unit_horde_behemoth',
        composition: [
          { unitTemplateId: 'unit_horde_behemoth', count: 2, linePosition: 'front' },
          { unitTemplateId: 'unit_horde_berserker', count: 4, linePosition: 'mid' },
          { unitTemplateId: 'unit_shadow_warg', count: 4, linePosition: 'back' },
        ],
        statModifiers: { hpMultiplier: 1.5, damageMultiplier: 1.3 },
      },
    ],
  },
};

export const DEFAULT_TERRITORY_WAVE_PROFILE: TerritoryWaveProfile = {
  territoryId: 'default',
  defaultFaction: 'horde',
  waves: [
    {
      waveNumber: 1,
      title: 'Skirmish Vanguard',
      composition: [
        { unitTemplateId: 'unit_orc_grunt', count: 5, linePosition: 'front' },
        { unitTemplateId: 'unit_goblin_skirmisher', count: 4, linePosition: 'back' },
      ],
    },
    {
      waveNumber: 2,
      title: 'Reinforced Assault',
      composition: [
        { unitTemplateId: 'unit_orc_warrior', count: 2, linePosition: 'front' },
        { unitTemplateId: 'unit_orc_grunt', count: 5, linePosition: 'mid' },
        { unitTemplateId: 'unit_goblin_skirmisher', count: 5, linePosition: 'back' },
      ],
      statModifiers: { hpMultiplier: 1.1, damageMultiplier: 1.1 },
    },
    {
      waveNumber: 3,
      title: 'Final Horde Assault',
      isBossWave: true,
      bossId: 'unit_horde_behemoth',
      composition: [
        { unitTemplateId: 'unit_horde_behemoth', count: 1, linePosition: 'front' },
        { unitTemplateId: 'unit_horde_berserker', count: 3, linePosition: 'mid' },
        { unitTemplateId: 'unit_shadow_warg', count: 3, linePosition: 'back' },
      ],
      statModifiers: { hpMultiplier: 1.25, damageMultiplier: 1.2 },
    },
  ],
};

export function getTerritoryWaveProfile(territoryId?: string): TerritoryWaveProfile {
  if (!territoryId) return DEFAULT_TERRITORY_WAVE_PROFILE;
  return TERRITORY_WAVE_PROFILES[territoryId] || DEFAULT_TERRITORY_WAVE_PROFILE;
}
