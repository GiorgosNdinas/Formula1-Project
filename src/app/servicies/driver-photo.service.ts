import { Injectable } from '@angular/core';
import catalog from '../data/driver-photos.json';
import { DriverPhoto } from '../models/driver-photo.model';

@Injectable({ providedIn: 'root' })
export class DriverPhotoService {
  private readonly photos: Record<string, DriverPhoto> = catalog;
  get(driverId: string): DriverPhoto | undefined { return this.photos[driverId]; }
}
