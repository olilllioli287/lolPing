import type { RoomFeatureOff } from './roomProtocol';

export type FeatureId = 'emotes' | 'rooms' | 'roomText' | 'roomVotes' | 'roomPanel';
export type Features = Record<FeatureId, boolean>;

/** In the order of the Features page. A feature with `requires` counts as off while that one is off. */
export const FEATURES: readonly { id: FeatureId; requires?: FeatureId }[] = [
  { id: 'emotes' },
  { id: 'rooms' },
  { id: 'roomText', requires: 'rooms' },
  { id: 'roomVotes', requires: 'rooms' },
  { id: 'roomPanel', requires: 'rooms' },
];

/** This build keeps only the ping wheel: emotes and rooms are always off, whatever the settings file says. */
export const DEFAULT_FEATURES: Features = { emotes: false, rooms: false, roomText: false, roomVotes: false, roomPanel: false };

export function normalizeFeatures(_raw: unknown): Features {
  return { ...DEFAULT_FEATURES };
}

/** The room features this setup has switched off, as a room presence announces them. */
export function roomFeaturesOff(s: { features: Features }): RoomFeatureOff[] {
  return [...(featureOn(s, 'roomText') ? [] : ['text' as const]), ...(featureOn(s, 'roomVotes') ? [] : ['votes' as const])];
}

/** Whether a feature is in use: its own switch is on and so is the one it requires. */
export function featureOn(s: { features: Features }, id: FeatureId): boolean {
  const entry = FEATURES.find((f) => f.id === id);
  return s.features[id] && (entry?.requires === undefined || s.features[entry.requires]);
}

/** Which room keys the helper listens for: they exist only in an active room, so Alt+T and Tab reach other apps otherwise. */
export function liveKeys(
  s: { features: Features },
  room: { active: boolean },
  enabled: boolean,
): { text: boolean; panel: boolean } {
  const live = enabled && room.active;
  return { text: live && featureOn(s, 'roomText'), panel: live && featureOn(s, 'roomPanel') };
}
