import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';

import { WalletsListComponent } from './pages/wallets-list/wallets-list.component';
import { WalletComponent } from './pages/wallet/wallet.component';
import { WalletTransComponent } from './pages/wallet/sub-components/wallet-trans/wallet-trans.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { ContactsComponent } from './pages/wallet/sub-components/contacts/contacts.component';

import { WalletLoginComponent } from './pages/wallet/modals/wallet-login/wallet-login.component';
import { DataTablesModule } from 'angular-datatables';

import { ConstantsService } from './services/constants.service';
import { ValidatorsRegexService } from './services/validators-regex.service';
import { WalletsListService } from './services/wallets-list.service';
import { WalletDeleteComponent } from './pages/wallets-list/modals/wallet-delete/wallet-delete.component';
import { WalletRenameComponent } from './pages/wallets-list/modals/wallet-rename/wallet-rename.component';
import { WalletVoteComponent } from './pages/wallet/sub-components/wallet-staking/modals/wallet-vote/wallet-vote.component';
import { WalletSweepComponent } from './pages/wallet/sub-components/wallet-staking/modals/wallet-sweep/wallet-sweep.component';
import { WalletRevoteComponent } from './pages/wallet/sub-components/wallet-staking/modals/wallet-revote/wallet-revote.component';
import { WalletCreateComponent } from './pages/wallets-list/modals/wallet-create/wallet-create.component';
import { WalletImportComponent } from './pages/wallets-list/modals/wallet-import/wallet-import.component';
import { DecimalPipe } from '@angular/common';

import { XcashCurrencyPipe } from './pipes/xcash-currency.pipe';
import { XcashPublicAddressPipe } from './pipes/xcash-public-address.pipe';
import { TransactionDetailsComponent } from './pages/wallet/sub-components/wallet-trans/modals/transaction-details/transaction-details.component';
import { WalletSendComponent } from './pages/wallet/sub-components/wallet-send/wallet-send.component';
import { WalletPrivateKeysComponent } from './pages/wallet/sub-components/wallet-private-keys/wallet-private-keys.component';
import { WalletChangePasswordComponent } from './pages/wallet/sub-components/wallet-change-password/wallet-change-password.component';
import { WalletStakingComponent } from './pages/wallet/sub-components/wallet-staking/wallet-staking.component';
import { VoteFormatPipe } from './pipes/vote-format.pipe';
import { ContactsModifyComponent } from './pages/wallet/sub-components/contacts/modals/contacts-modify/contacts-modify.component';
import { ContactsAddComponent } from './pages/wallet/sub-components/contacts/modals/contacts-add/contacts-add.component';
import { ContactsDeleteComponent } from './pages/wallet/sub-components/contacts/modals/contacts-delete/contacts-delete.component';
import { GetAddressComponent } from './pages/wallet/sub-components/wallet-send/modals/get-address/get-address.component';
import { WalletSubaddressComponent } from './pages/wallet/sub-components/wallet-subaddress/wallet-subaddress.component';
import { WalletSubaddressAddComponent } from './pages/wallet/sub-components/wallet-subaddress/modals/wallet-subaddress-add/wallet-subaddress-add.component';
import { WalletSubaddressModComponent } from './pages/wallet/sub-components/wallet-subaddress/modals/wallet-subaddress-mod/wallet-subaddress-mod.component';
import { WalletIntegratedAddressComponent } from './pages/wallet/sub-components/wallet-integrated-address/wallet-integrated-address.component';
import { WalletIntegratedAddressAddComponent } from './pages/wallet/sub-components/wallet-integrated-address/modals/wallet-integrated-address-add/wallet-integrated-address-add.component';
import { NgxTippyModule } from 'ngx-tippy-wrapper';
import { WalletSignDataComponent } from './pages/wallet/sub-components/wallet-sign-data/wallet-sign-data.component';
import { WalletAddSignDataComponent } from './pages/wallet/sub-components/wallet-sign-data/modals/wallet-add-sign-data/wallet-add-sign-data.component';
import { WalletVerifySignDataComponent } from './pages/wallet/sub-components/wallet-sign-data/modals/wallet-verify-sign-data/wallet-verify-sign-data.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    ContactsComponent,
    XcashCurrencyPipe,
    XcashPublicAddressPipe,
    WalletsListComponent,
    WalletDeleteComponent,
    WalletRenameComponent,
    WalletComponent,
    WalletLoginComponent,
    WalletTransComponent,
    TransactionDetailsComponent,
    WalletSendComponent,
    SettingsComponent,
    WalletPrivateKeysComponent,
    WalletChangePasswordComponent,
    WalletStakingComponent,
    VoteFormatPipe,
    WalletVoteComponent,
    WalletSweepComponent,
    WalletRevoteComponent,
    WalletCreateComponent,
    WalletImportComponent,
    ContactsModifyComponent,
    ContactsAddComponent,
    ContactsDeleteComponent,
    GetAddressComponent,
    WalletSubaddressComponent,
    WalletSubaddressAddComponent,
    WalletSubaddressModComponent,
    WalletIntegratedAddressComponent,
    WalletIntegratedAddressAddComponent,
    WalletSignDataComponent,
    WalletAddSignDataComponent,
    WalletVerifySignDataComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FontAwesomeModule,
    HttpClientModule,
    FormsModule,
    DataTablesModule,
    NgxTippyModule
  ],
  providers: [
    ConstantsService,
    ValidatorsRegexService,
    WalletsListService,
    DecimalPipe,
    XcashCurrencyPipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }