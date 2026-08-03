import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  forwardRef,
  OnDestroy,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import Quill from 'quill';

@Component({
  selector: 'app-rich-text-editor',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RichTextEditorComponent),
      multi: true,
    },
  ],
  template: `<div #editor class="rich-editor"></div>`,
  styles: [
    `
      .rich-editor {
        min-height: 220px;
        background: #fff;
        border-radius: 0.75rem;
      }
      :host-context(.admin-dark) .rich-editor {
        background: #1f2937;
      }
    `,
  ],
})
export class RichTextEditorComponent implements ControlValueAccessor, AfterViewInit, OnDestroy {
  private readonly editorRef = viewChild.required<ElementRef<HTMLDivElement>>('editor');
  private quill: Quill | null = null;
  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};
  private pendingValue = '';

  ngAfterViewInit(): void {
    this.quill = new Quill(this.editorRef().nativeElement, {
      theme: 'snow',
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'link'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['clean'],
        ],
      },
    });

    if (this.pendingValue) {
      this.quill.root.innerHTML = this.pendingValue;
    }

    this.quill.on('text-change', () => {
      const html = this.quill?.root.innerHTML ?? '';
      this.onChange(html === '<p><br></p>' ? '' : html);
    });

    this.quill.on('selection-change', () => this.onTouched());
  }

  ngOnDestroy(): void {
    this.quill = null;
  }

  writeValue(value: string | null): void {
    const v = value ?? '';
    if (this.quill) {
      this.quill.root.innerHTML = v;
    } else {
      this.pendingValue = v;
    }
  }

  registerOnChange(fn: (v: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    if (this.quill) {
      this.quill.enable(!disabled);
    }
  }
}
