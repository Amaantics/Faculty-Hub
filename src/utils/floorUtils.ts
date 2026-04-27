import type { BlockCode, FloorKey } from '../types';

export const BLOCK_TO_FLOOR: Record<BlockCode, FloorKey> = {
  'S-001': '2nd', 'N-003': '2nd', 'S-211': '2nd',
  'S-309': '3rd',
  'S-402': '4th', 'S-411': '4th', 'S-415': '4th', 'N-409': '4th', 'N-410': '4th',
  'S-502': '5th', 'S-504': '5th', 'S-511': '5th', 'S-513': '5th', 'N-502': '5th', 'N-504': '5th',
  'S-602': '6th', 'S-616': '6th', 'LAB-S608': '6th',
  'J-901': '9th', 'S-901': '9th',
};

export const FLOORS_ORDERED: FloorKey[] = ['2nd', '3rd', '4th', '5th', '6th', '9th'];

export const BLOCKS_BY_FLOOR: Record<FloorKey, BlockCode[]> = {
  '2nd': ['S-001', 'N-003', 'S-211'],
  '3rd': ['S-309'],
  '4th': ['S-402', 'S-411', 'S-415', 'N-409', 'N-410'],
  '5th': ['S-502', 'S-504', 'S-511', 'S-513', 'N-502', 'N-504'],
  '6th': ['S-602', 'S-616', 'LAB-S608'],
  '9th': ['J-901', 'S-901'],
};

export const FLOOR_LABELS: Record<FloorKey, string> = {
  '2nd': '2nd Floor',
  '3rd': '3rd Floor',
  '4th': '4th Floor',
  '5th': '5th Floor',
  '6th': '6th Floor',
  '9th': '9th Floor',
};

export const ALL_BLOCKS: BlockCode[] = Object.values(BLOCKS_BY_FLOOR).flat();
