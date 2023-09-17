import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WalletsListComponent } from './pages/wallets-list/wallets-list.component';
import { WalletComponent } from './pages/wallet/wallet.component';
import { ContactsComponent } from './pages/wallet/sub-components/contacts/contacts.component';
import { WalletTransComponent } from './pages/wallet/sub-components/wallet-trans/wallet-trans.component';
import { WalletSendComponent } from './pages/wallet/sub-components/wallet-send/wallet-send.component';
import { WalletPrivateKeysComponent } from './pages/wallet/sub-components/wallet-private-keys/wallet-private-keys.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { WalletSubaddressComponent } from './pages/wallet/sub-components/wallet-subaddress/wallet-subaddress.component';

const routes: Routes = [
  { path: '', 
    component: WalletsListComponent,
    pathMatch: 'full'},
  { path: 'wallet/:wname/address/:waddress', component: WalletComponent, children: [
    {path: 'wallettrans', component: WalletTransComponent },
    {path: 'walletsend', component: WalletSendComponent },
    {path: 'walletprivatekeys', component: WalletPrivateKeysComponent},
    {path: 'contacts', component: ContactsComponent},
    {path: 'walletSubaddress', component: WalletSubaddressComponent}

  ]},
  { path: 'settings', component: SettingsComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }