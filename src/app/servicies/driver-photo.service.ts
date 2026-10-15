import { Injectable } from '@angular/core';
import catalog from '../data/driver-photos.json';
import { DriverPhoto } from '../models/driver-photo.model';

/**
 * Resolves IDs to verified external photo metadata. Missing entries use the initials fallback.
 */
@Injectable({ providedIn: 'root' })
export class DriverPhotoService {
  private readonly photos: Record<string, DriverPhoto> = catalog;
  /** Return verified photo metadata, or undefined when no suitable image exists. */
  get(driverId: string): DriverPhoto | undefined {
    return this.photos[driverId];
  }
}
