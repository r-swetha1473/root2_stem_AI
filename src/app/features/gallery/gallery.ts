import { Component, inject, Inject, OnInit, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { GalleryItem } from '../../core/models/cms.models';
import { SheetsApiService } from '../../core/services/sheets-api.service';
import { SeoService } from '../../core/services/seo.service';
import { GsapRevealDirective } from '../../shared/directives/gsap-reveal.directive';
import { SectionHeadingComponent } from '../../shared/components/section-heading/section-heading';

@Component({
  selector: 'app-gallery-lightbox',
  standalone: true,
  imports: [MatDialogModule],
  template: `
    <div class="p-4 md:p-6 max-w-4xl">
      @if (videoUrl) {
        <iframe [src]="videoUrl" class="w-full aspect-video rounded-xl" [title]="data.title"></iframe>
      } @else {
        <img [src]="data.image" [alt]="data.title" class="w-full max-h-[70vh] object-contain rounded-xl" />
      }
      <h2 class="text-xl font-bold mt-4">{{ data.title }}</h2>
      <p class="text-navy/60 mt-2">{{ data.description }}</p>
      <button type="button" mat-dialog-close class="btn-secondary mt-4">Close</button>
    </div>
  `,
})
export class GalleryLightboxComponent {
  readonly videoUrl: SafeResourceUrl | null;

  constructor(
    @Inject(MAT_DIALOG_DATA) readonly data: GalleryItem,
    sanitizer: DomSanitizer,
  ) {
    this.videoUrl =
      data.media_type === 'video' && data.video_url
        ? sanitizer.bypassSecurityTrustResourceUrl(data.video_url)
        : null;
  }
}

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [GsapRevealDirective, SectionHeadingComponent],
  templateUrl: './gallery.html',
})
export class Gallery implements OnInit {
  private readonly api = inject(SheetsApiService);
  private readonly seo = inject(SeoService);
  private readonly dialog = inject(MatDialog);

  readonly items = signal<GalleryItem[]>([]);
  readonly category = signal('');

  readonly categories = ['workshop', 'certificates', 'events', 'videos'];

  ngOnInit(): void {
    this.seo.update({
      title: 'Gallery',
      description: 'Workshops, certificates, events, and community moments at ROOT2 STEM AI.',
      url: '/gallery',
    });
    this.api.list<GalleryItem>({ sheet: 'Gallery', status: 'active' }).subscribe((r) => {
      this.items.set(r.data ?? []);
    });
  }

  filtered(): GalleryItem[] {
    const cat = this.category();
    if (!cat) return this.items();
    return this.items().filter((i) => i.category === cat);
  }

  open(item: GalleryItem): void {
    this.dialog.open(GalleryLightboxComponent, {
      data: item,
      maxWidth: '95vw',
      panelClass: 'gallery-dialog',
    });
  }
}
