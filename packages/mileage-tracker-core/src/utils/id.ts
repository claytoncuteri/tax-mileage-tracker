/**
 * ID generation utility using nanoid.
 * Generates URL-safe, unique IDs for trips and other records.
 */

import { nanoid } from 'nanoid';

/** Generate a unique ID for a new record */
export function generateId(): string {
  return nanoid();
}
