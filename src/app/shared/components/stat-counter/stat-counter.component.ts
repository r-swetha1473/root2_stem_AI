import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  effect,
  input,
  signal,
  viewChild,
} from '@angular/core';
import gsap from 'gsap';

@Component({
  selector: 'r2-stat-counter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './stat-counter.component.html',
  styleUrl: './stat-counter.component.scss',
})
export class StatCounterComponent implements AfterViewInit, OnDestroy {
  readonly value = input.required<number>();
  readonly suffix = input<string>('');
  readonly label = input.required<string>();
  readonly icon = input<string>();
  readonly duration = input(2);

  readonly displayValue = signal(0);

  private readonly root = viewChild<ElementRef<HTMLElement>>('root');
  private observer?: IntersectionObserver;
  private tween?: gsap.core.Tween;
  private hasAnimated = false;

  constructor() {
    effect(() => {
      if (this.hasAnimated) {
        this.animateTo(this.value());
      }
    });
  }

  ngAfterViewInit(): void {
    const el = this.root()?.nativeElement;
    if (!el) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting) && !this.hasAnimated) {
          this.hasAnimated = true;
          this.animateTo(this.value());
        }
      },
      { threshold: 0.35 },
    );
    this.observer.observe(el);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.tween?.kill();
  }

  private animateTo(target: number): void {
    this.tween?.kill();
    const obj = { val: this.displayValue() };
    this.tween = gsap.to(obj, {
      val: target,
      duration: this.duration(),
      ease: 'power2.out',
      onUpdate: () => this.displayValue.set(Math.round(obj.val)),
    });
  }
}
