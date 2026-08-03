import { AfterViewInit, Directive, ElementRef, inject, input, OnDestroy } from '@angular/core';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Directive({
  selector: '[appGsapReveal]',
  standalone: true,
})
export class GsapRevealDirective implements AfterViewInit, OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);
  private tween?: gsap.core.Tween;

  /** Animation delay in seconds */
  delay = input(0, { alias: 'appGsapRevealDelay' });
  /** Animation direction: up | left | right | fade */
  direction = input<'up' | 'left' | 'right' | 'fade'>('up', {
    alias: 'appGsapRevealDirection',
  });

  ngAfterViewInit(): void {
    const node = this.el.nativeElement;
    const dir = this.direction();
    const from: gsap.TweenVars = { opacity: 0, duration: 0.9, ease: 'power3.out', delay: this.delay() };

    if (dir === 'up') from.y = 48;
    else if (dir === 'left') from.x = -48;
    else if (dir === 'right') from.x = 48;

    this.tween = gsap.from(node, {
      ...from,
      scrollTrigger: {
        trigger: node,
        start: 'top 88%',
        toggleActions: 'play none none none',
      },
    });
  }

  ngOnDestroy(): void {
    this.tween?.scrollTrigger?.kill();
    this.tween?.kill();
  }
}
