import { Component } from '@angular/core';
import { SettingsService } from 'src/app/services/settings.service';
import { CurrencyService } from 'src/app/services/currency.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.sass']
})
export class SettingsComponent {
  message: string = '';
  infoMessage: string = '';
  remote_Node: string = '';
  custom_Node: string = '';
  currency: string = '';
  autolock: number = 10;
  currencies = [
    'BTC', 'BRL', 'CNY', 'EUR', 'GBP', 'JPY', 'KRW', 'RUB', 'USD', 'VND'
  ];
  settings: { autolock: any, remote_node: string, currency: string } = { autolock: 0, remote_node: '', currency: '' };
  customNodeIsDisplayed: boolean = false;

  constructor(private settingsService: SettingsService,
    private currencyService: CurrencyService) { };

  public async ngOnInit(): Promise<void> {
    this.settings = await this.settingsService.getSettings();
    if (this.settings.autolock === '' || this.settings.currency === '' || this.settings.remote_node === '') {
      this.showMessage('Error retrieving data from configuration file.');
    } else {
      this.autolock = this.settings.autolock;
      if (this.settings.remote_node === 'europe1.xcash.foundation:18281' ||
        this.settings.remote_node === 'europe2.xcash.foundation:18281' ||
        this.settings.remote_node === 'europe3.xcash.foundation:18281' ||
        this.settings.remote_node === 'oceania1.xcash.foundation:18281') {
        this.remote_Node = this.settings.remote_node;
      } else {
        this.remote_Node = 'custom';
        this.custom_Node = this.settings.remote_node;
        const customNodeInput = document.getElementById('customNodeInput');
        if (customNodeInput) {
          customNodeInput.classList.remove('is-hidden');
          this.customNodeIsDisplayed = true;
        }
      }
      this.currency = this.settings.currency;
    }
  }

  onNodeChange(selectedValue: string) {
    const customNodeInput = document.getElementById('customNodeInput');
    if (customNodeInput) {
      if (selectedValue === 'custom') {
        customNodeInput.classList.remove('is-hidden');
        this.customNodeIsDisplayed = true;
      } else {
        customNodeInput.classList.add('is-hidden');
        this.customNodeIsDisplayed = false;
      }
    }
  }

  async updateSettings() {
    if (this.remote_Node === 'custom') {
      this.settings.remote_node = this.custom_Node;
    } else {
      this.settings.remote_node = this.remote_Node;
    }
    this.settings.autolock = this.autolock;
    this.settings.currency = this.currency;
    const returnString = await this.settingsService.updateSettings(this.settings);
    if (returnString === 'success') {
      this.currencyService.tocurrency = this.settings.currency;
      this.showInfoMessage('Settings updated successfully.')
    }
  }

  clearInputField(): void {
    this.custom_Node = '';
  }

  showMessage(message: string): void {
    this.message = message;
  }

  async showInfoMessage(message: string) {
    this.infoMessage = message;
    await new Promise(resolve => setTimeout(resolve, 2000)); // Set the timer to expire after 2 seconds
    this.infoMessage = '';
  }

}