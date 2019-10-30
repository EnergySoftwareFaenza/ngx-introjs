import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IntroJsDirective } from '../intro-js.directive';

@NgModule({
  declarations: [IntroJsDirective],
  imports: [CommonModule],
  exports: [IntroJsDirective]
})
export class IntroJsModule { }
