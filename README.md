##How to use
1) Install the package with

npm install @esfaenza/ngx-introjs

(you should check the version you need. from Angular version 8 onward i followed Angular's version, from 8 downward just try the last available build)

2) In your module:

import { IntroJsModule } from "@esfaenza/ngx-introjs"
...
@NgModule({
imports: [IntroJsModule, etc...],
declarations: [your stuff],
exports: [your stuff]
})

3) In your component's .ts define the Intro's data

public const IntroItems = {
'Group': '1',
'1': 'Step 1 description',
'2': 'Step 2 description'
};

4) In your HTML attach the directive where you need it

[intro]="IntroItems" [Order]="1"

5) To make the presentation start, inject IntroJsService like so in your component:

import { IntroJsService } from "@esfaenza/ngx-introjs";
constructor(public introService: IntroJsService, etc...) { }

6) and use it like so:

this.introService.start(null, '1');

7) If you want to change the default Options of intro.js you can use

this.introService.setOptions(...)
