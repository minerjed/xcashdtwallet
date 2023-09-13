import { Injectable } from '@angular/core';
import { ContactList } from '../models/contact-list.model';
import { BehaviorSubject } from 'rxjs';
import { Contact } from '../models/contact.model';

@Injectable({
  providedIn: 'root'
})
export class ContactListService {
  public contactList: ContactList | any;
  private contactList$: BehaviorSubject<Contact[]> | any;

  Contacts: Contact[] = [];

  loadContacts(contactlist: any) {
      this.contactList = new ContactList(contactlist);
      this.contactList$ = new BehaviorSubject<Contact[]>(this.contactList.getList());
  }

  private update() {
    this.contactList$.next(this.contactList.getList());
  }

  public getContactList(): BehaviorSubject<Contact[]> {
    return this.contactList$;
  }

  public removeContact(contactId: number): void {
    this.contactList.removeElement(contactId);
    this.update();
  }

  public addContact(name: string, address: string): void {
    this.contactList.addContact(name, address);
    this.update();
  }

  public modifyContact(contactId: number, newName?: string, newAddress?: string): void {
    this.contactList.modifyContact(contactId, newName, newAddress);
    this.update();
  }
}