import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContactsComponent } from './pages/contacts/contacts.component';
import { ContactsTableComponent } from './pages/contacts/contacts-list/contacts-table.component';
import { WalletsListComponent } from './pages/wallets-list/wallets-list.component';
import { WalletComponent } from './pages/wallet/wallet.component';
import { WalletTransComponent } from './pages/wallet/sub-components/wallet-trans/wallet-trans.component';
import { WalletSendComponent } from './pages/wallet/sub-components/wallet-send/wallet-send.component';
import { SettingsComponent } from './pages/settings/settings.component';

const routes: Routes = [
  { path: '', 
    component: WalletsListComponent,
    pathMatch: 'full'},
  { path: 'wallet/:wname/address/:waddress', component: WalletComponent, children: [
    {path: 'wallettrans', component: WalletTransComponent },
    {path: 'walletsend', component: WalletSendComponent }
  ]},
  { path: 'contacts', component: ContactsComponent, children: [
    { path: 'contactstable', component: ContactsTableComponent }
  ]},
  { path: 'settings', component: SettingsComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }