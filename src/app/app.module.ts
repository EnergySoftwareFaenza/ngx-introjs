import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { IntroJsModule } from './intro-js-module/intro-js.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    IntroJsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
