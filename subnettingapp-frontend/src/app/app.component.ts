import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'subnettingapp-frontend';

  constructor(private translate: TranslateService) {
    translate.addLangs(['en', 'hu']);
    translate.setDefaultLang('hu');
    const browserLang = translate.getBrowserLang();
    translate.use(browserLang?.match(/en|hu/) ? browserLang : 'hu');
  }
}
