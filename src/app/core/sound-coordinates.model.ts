import { TypedRecord, makeTypedFactory } from 'typed-immutable-record';

export interface SoundCoordinates {
  relativePitch: number,
  modulePitchExtent: number,

  relativeStart: number
  soundDuration: number,
  moduleDuration: number
}

export interface SoundCoordinatesRecord extends TypedRecord<SoundCoordinatesRecord>, SoundCoordinates {}
export const soundCoordinatesFactory = makeTypedFactory<SoundCoordinates, SoundCoordinatesRecord>({
  relativePitch: 0,
  modulePitchExtent: 0,
  relativeStart: 0,
  soundDuration: 0,
  moduleDuration: 0
});