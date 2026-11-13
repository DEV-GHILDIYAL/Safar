/**
 * Shared-element style transition: a trip card stores its on-screen rect before navigating,
 * and the trip detail header animates from that rect to its full-bleed position.
 */
export interface OriginRect {
  tripId: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

let origin: OriginRect | null = null;

export function setOrigin(rect: OriginRect) {
  origin = rect;
}

/** Returns and clears the stored rect if it belongs to this trip. */
export function takeOrigin(tripId: number): OriginRect | null {
  const o = origin && origin.tripId === tripId ? origin : null;
  origin = null;
  return o;
}
