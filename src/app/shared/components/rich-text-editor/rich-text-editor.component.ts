import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  forwardRef,
  input,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import Quill from 'quill';

@Component({
  selector: 'r2-rich-text-editor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RichTextEditorComponent),
      multi: true,
    },
  ],
  templateUrl: './rich-text-editor.component.html',
  styleUrl: './rich-text-editor.component.scss',
})
export class RichTextEditorComponent implements ControlValueAccessor, AfterViewInit, OnDestroy {
  readonly placeholder = input('Write content…');
  readonly minHeight = input('220px');

  private readonly editorHost = viewChild<ElementRef<HTMLDivElement>>('editorHost');
  private quill?: Quill;
  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;
  private pendingValue = '';
  private disabled = false;

  ngAfterViewInit(): void {
    const host = this.editorHost()?.nativeElement;
    if (!host) return;

    this.quill = new Quill(host, {
      theme: 'snow',
      placeholder: this.placeholder(),
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['link', 'blockquote', 'code-block'],
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

    this.quill.root.addEventListener('blur', () => this.onTouched());

    if (this.disabled) {
      this.quill.enable(false);
    }
  }

  ngOnDestroy(): void {
    this.quill = undefined;
  }

  writeValue(value: string | null): void {
    const html = value ?? '';
    this.pendingValue = html;
    if (this.quill) {
      const current = this.quill.root.innerHTML;
      if (current !== html) {
        this.quill.root.innerHTML = html;
      }
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.quill?.enable(!isDisabled);
  }
}
