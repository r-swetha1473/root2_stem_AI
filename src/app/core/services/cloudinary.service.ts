import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width?: number;
  height?: number;
  format?: string;
}

@Injectable({ providedIn: 'root' })
export class CloudinaryService {
  private readonly http = inject(HttpClient);

  private get endpoint(): string {
    return `https://api.cloudinary.com/v1_1/${environment.cloudinary.cloudName}/image/upload`;
  }

  /** Unsigned browser upload into the Root2 STEM AI folder. */
  uploadImage(file: File, subfolder?: string): Observable<CloudinaryUploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', environment.cloudinary.uploadPreset);

    const folder = subfolder
      ? `${environment.cloudinary.folder}/${subfolder}`
      : environment.cloudinary.folder;
    formData.append('folder', folder);

    return this.http.post<CloudinaryUploadResult>(this.endpoint, formData).pipe(
      map((res) => ({
        secure_url: res.secure_url,
        public_id: res.public_id,
        width: res.width,
        height: res.height,
        format: res.format,
      })),
    );
  }
}
