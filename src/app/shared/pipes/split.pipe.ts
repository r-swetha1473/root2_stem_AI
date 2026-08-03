import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'split', standalone: true })
export class SplitPipe implements PipeTransform {
  transform(value: string | null | undefined, delimiter: '|' | ',' = '|'): string[] {
    if (!value?.trim()) return [];
    const pattern = delimiter === '|' ? /\s*\|\s*/ : /\s*,\s*/;
    return value.split(pattern).filter(Boolean);
  }
}
