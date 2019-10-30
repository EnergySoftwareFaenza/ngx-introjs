import { Component } from '@angular/core';
import { IntroJsService } from './intro-js.service';

@Component({
  selector: 'app-root',
  providers: [IntroJsService],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ngx-introjs';

  public Intro_G1 : any= {
    'Group': '1',
    '1': 'Elemento 1 Gruppo 1'
  }

  public Intro_G2 : any= {
    'Group': '2',
    '1': 'Elemento 1 Gruppo 2',
    '2': 'Elemento 2 Gruppo 2',
  }

  constructor(private service: IntroJsService){

  }

  introStart(group?:string){
     this.service.start(null, group);
  }
}