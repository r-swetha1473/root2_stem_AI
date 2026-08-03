import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BlogCardData } from '../../models/component.models';

@Component({
  selector: 'r2-blog-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './blog-card.component.html',
  styleUrl: './blog-card.component.scss',
})
export class BlogCardComponent {
  readonly blog = input.required<BlogCardData>();

  blogLink(): string {
    const slug = this.blog().slug;
    return slug ? `/blog/${slug}` : '/blog';
  }
}
