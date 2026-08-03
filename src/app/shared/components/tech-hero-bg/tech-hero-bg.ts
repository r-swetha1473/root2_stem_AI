import { AfterViewInit, Component, ElementRef, viewChild } from '@angular/core';
import gsap from 'gsap';

/** Animated DNA / molecules / neural lines for premium tech hero. */
@Component({
  selector: 'app-tech-hero-bg',
  standalone: true,
  template: `
    <div class="hero-bg" aria-hidden="true">
      <div class="gradient" #gradient></div>
      <svg class="neural" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
        <g #neural>
          <circle cx="180" cy="160" r="3" fill="#00aeef" />
          <circle cx="320" cy="240" r="2.5" fill="#68bb59" />
          <circle cx="260" cy="360" r="3" fill="#0056b3" />
          <circle cx="980" cy="180" r="3" fill="#68bb59" />
          <circle cx="1080" cy="300" r="2.5" fill="#00aeef" />
          <circle cx="940" cy="420" r="3" fill="#0056b3" />
          <circle cx="700" cy="120" r="2" fill="#00aeef" />
          <path d="M180 160 L320 240 L260 360 M980 180 L1080 300 L940 420 M700 120 L980 180" fill="none" stroke="#0056b3" stroke-width="1" opacity="0.35" />
        </g>
      </svg>

      <svg class="dna" viewBox="0 0 120 400" #dna>
        <path d="M40 20c30 20 30 60 0 80s-30 60 0 80 30 60 0 80 30 60 0 80" fill="none" stroke="#0056b3" stroke-width="3" />
        <path d="M80 20c-30 20-30 60 0 80s30 60 0 80-30 60 0 80-30 60 0 80" fill="none" stroke="#68bb59" stroke-width="3" />
        <g opacity="0.55">
          <line x1="42" y1="50" x2="78" y2="50" stroke="#002147" stroke-width="2" />
          <line x1="42" y1="110" x2="78" y2="110" stroke="#002147" stroke-width="2" />
          <line x1="42" y1="170" x2="78" y2="170" stroke="#002147" stroke-width="2" />
          <line x1="42" y1="230" x2="78" y2="230" stroke="#002147" stroke-width="2" />
          <line x1="42" y1="290" x2="78" y2="290" stroke="#002147" stroke-width="2" />
        </g>
      </svg>

      <div class="molecule m1" #m1></div>
      <div class="molecule m2" #m2></div>
      <div class="molecule m3" #m3></div>
    </div>
  `,
  styles: `
    :host { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
    .hero-bg { position: absolute; inset: 0; }
    .gradient {
      position: absolute; inset: 0;
      background:
        radial-gradient(ellipse 70% 50% at 15% 20%, rgba(0,174,239,.22), transparent 55%),
        radial-gradient(ellipse 55% 45% at 85% 30%, rgba(104,187,89,.18), transparent 50%),
        radial-gradient(ellipse 60% 40% at 50% 100%, rgba(0,86,179,.12), transparent 55%),
        linear-gradient(180deg, #f7fbff 0%, #ffffff 70%);
      background-size: 160% 160%;
    }
    .neural { position: absolute; inset: 0; width: 100%; height: 100%; opacity: .55; }
    .dna {
      position: absolute; right: 8%; top: 12%; width: 90px; height: 320px; opacity: .35;
      @media (max-width: 768px) { opacity: .2; right: -10px; width: 70px; }
    }
    .molecule {
      position: absolute; width: 14px; height: 14px; border-radius: 999px;
      background: radial-gradient(circle at 30% 30%, #fff, #00aeef);
      box-shadow: 0 0 0 6px rgba(0,174,239,.12);
    }
    .m1 { left: 18%; top: 28%; }
    .m2 { left: 62%; top: 62%; background: radial-gradient(circle at 30% 30%, #fff, #68bb59); box-shadow: 0 0 0 6px rgba(104,187,89,.14); }
    .m3 { left: 40%; top: 72%; width: 10px; height: 10px; }
  `,
})
export class TechHeroBgComponent implements AfterViewInit {
  private readonly gradient = viewChild<ElementRef<HTMLElement>>('gradient');
  private readonly dna = viewChild<ElementRef<SVGElement>>('dna');
  private readonly m1 = viewChild<ElementRef<HTMLElement>>('m1');
  private readonly m2 = viewChild<ElementRef<HTMLElement>>('m2');
  private readonly m3 = viewChild<ElementRef<HTMLElement>>('m3');
  private readonly neural = viewChild<ElementRef<SVGGElement>>('neural');

  ngAfterViewInit(): void {
    const g = this.gradient()?.nativeElement;
    if (g) {
      gsap.to(g, { backgroundPosition: '80% 40%', duration: 18, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    }
    const dna = this.dna()?.nativeElement;
    if (dna) {
      gsap.to(dna, { y: 18, duration: 6, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    }
    [this.m1(), this.m2(), this.m3()].forEach((el, i) => {
      const node = el?.nativeElement;
      if (!node) return;
      gsap.to(node, {
        y: i % 2 === 0 ? -16 : 14,
        x: i % 2 === 0 ? 10 : -8,
        duration: 4 + i,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    });
    const neural = this.neural()?.nativeElement;
    if (neural) {
      gsap.to(neural, { opacity: 0.35, duration: 3.5, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    }
  }
}
