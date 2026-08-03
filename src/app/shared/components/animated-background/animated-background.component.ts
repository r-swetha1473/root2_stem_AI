import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  input,
  viewChild,
} from '@angular/core';
import gsap from 'gsap';

@Component({
  selector: 'r2-animated-background',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './animated-background.component.html',
  styleUrl: './animated-background.component.scss',
})
export class AnimatedBackgroundComponent implements AfterViewInit, OnDestroy {
  readonly variant = input<'dna' | 'neural'>('neural');
  readonly opacity = input(0.55);

  private readonly svgRoot = viewChild<ElementRef<SVGElement>>('svgRoot');
  private tweens: gsap.core.Tween[] = [];

  ngAfterViewInit(): void {
    const svg = this.svgRoot()?.nativeElement;
    if (!svg) return;

    const nodes = svg.querySelectorAll<SVGElement>('.anim-node');
    const links = svg.querySelectorAll<SVGElement>('.anim-link');

    nodes.forEach((node, i) => {
      const tween = gsap.to(node, {
        y: `+=${8 + (i % 3) * 4}`,
        duration: 2.4 + (i % 4) * 0.3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: i * 0.08,
      });
      this.tweens.push(tween);
    });

    links.forEach((link, i) => {
      const tween = gsap.fromTo(
        link,
        { opacity: 0.15 },
        {
          opacity: 0.45,
          duration: 1.8 + (i % 3) * 0.2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.05,
        },
      );
      this.tweens.push(tween);
    });
  }

  ngOnDestroy(): void {
    this.tweens.forEach((t) => t.kill());
    this.tweens = [];
  }
}
