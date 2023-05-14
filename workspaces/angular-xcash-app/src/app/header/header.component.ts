import { Component } from '@angular/core';
import { faLock, faWallet, faAddressBook, faGear, faGlobe, faDollar } from '@fortawesome/free-solid-svg-icons';
import { CurrencyService } from '../services/currency.service';
import { SettingsService } from '../services/settings.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.sass']
})
export class HeaderComponent {

  constructor(public currencyService: CurrencyService,
    private settingService: SettingsService) { }

  title = 'xcashdtwallet';
  faLock = faLock;
  faWallet = faWallet;
  faAddressBook = faAddressBook;
  faGear = faGear;
  faGlobe = faGlobe;
  faDollar = faDollar;
  currencies = [
    'BTC', 'BRL', 'CNY', 'EUR', 'GBP', 'JPY', 'KRW', 'RUB', 'USD', 'VND'
  ];
  curCurrency: string = '';
  onCurrencyClick(currency: string) {
    this.curCurrency = currency;
    this.currencyService.tocurrency = currency;
  }

  async ngOnInit(): Promise<void> {
    this.curCurrency  = await this.settingService.getCurrency();
    if (this.curCurrency === '') {
      this.curCurrency = 'USD';
    }
    this.currencyService.tocurrency = this.curCurrency;
  }

}