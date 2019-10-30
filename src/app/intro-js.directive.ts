import { Directive, ElementRef, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[intro]'
})
export class IntroJsDirective {
  @Input('intro') Intro: any;
  @Input() Order: number;

  constructor(private el: ElementRef, private renderer: Renderer2) { 
  }

  ngOnInit(): void {
    this.renderer.setAttribute(this.el.nativeElement, 'data-intro', this.Intro[this.Order.toString()] );
    this.renderer.setAttribute(this.el.nativeElement, 'data-intro-group', this.Intro["Group"] );
    this.renderer.setAttribute(this.el.nativeElement, 'data-step', this.Order.toString() );
  }
}