import type { StageDefinition } from '../types';
import backgroundUrl from './assets/backgrounds/backyard-cool.png';

export const backyard: StageDefinition = {
  id: 'backyard',
  displayName: 'The Backyard',
  subtitle: 'Castle Rock, Colorado — near sundown',
  background: {
    textureKey: 'stage-backyard-cool',
    url: backgroundUrl,
  },
  skyTop: 0x4d2b64,
  skyBottom: 0xf28b55,
  ground: 0x315f36,
  fence: 0xb98552,
};

