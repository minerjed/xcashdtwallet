import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';

import { ContactsComponent } from './pages/contacts/contacts.component';
import { ContactsTableComponent } from './pages/contacts/contacts-list/contacts-table.component';
import { WalletsListComponent } from './pages/wallets-list/wallets-list.component';
import { WalletComponent } from './pages/wallet/wallet.component';
import { WalletTransComponent } from './pages/wallet/sub-components/wallet-trans/wallet-trans.component';
import { SettingsComponent } from './pages/settings/settings.component';

import { WalletLoginComponent } from './pages/wallet/modals/wallet-login/wallet-login.component';
import { DataTablesModule } from 'angular-datatables';

import { ConstantsService } from './services/constants.service';
import { ValidatorsRegexService } from './services/validators-regex.service';
import { WalletsListService } from './services/wallets-list.service';
import { WalletDeleteComponent } from './pages/wallets-list/modals/wallet-delete/wallet-delete.component';
import { WalletRenameComponent } from './pages/wallets-list/modals/wallet-rename/wallet-rename.component';
import { DecimalPipe } from '@angular/common';

import { XcashCurrencyPipe } from './pipes/xcash-currency.pipe';
import { XcashPublicAddressPipe } from './pipes/xcash-public-address.pipe';
import { TransactionDetailsComponent } from './pages/wallet/modals/transaction-details/transaction-details.component';
import { WalletSendComponent } from './pages/wallet/sub-components/wallet-send/wallet-send.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    ContactsComponent,
    XcashCurrencyPipe,
    XcashPublicAddressPipe,
    ContactsTableComponent,
    WalletsListComponent,
    WalletDeleteComponent,
    WalletRenameComponent,
    WalletComponent,
    WalletLoginComponent,
    WalletTransComponent,
    TransactionDetailsComponent,
    WalletSendComponent,
    SettingsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FontAwesomeModule,
    HttpClientModule,
    FormsModule,
    DataTablesModule
  ],
  providers: [
    ConstantsService,
    ValidatorsRegexService,
    WalletsListService,
    DecimalPipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }