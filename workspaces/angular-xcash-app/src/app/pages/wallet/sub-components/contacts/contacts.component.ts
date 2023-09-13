import { Component, OnInit } from '@angular/core';
import { ContactListService } from 'src/app/services/contact-list.service';
import { DatabaseService } from 'src/app/services/database.service';
import { BehaviorSubject } from 'rxjs';
import { Contact } from 'src/app/models/contact.model';
import { Subject } from 'rxjs';
import { faTrashCan, faEdit, faCopy } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.sass']
})
export class ContactsComponent implements OnInit {
  dtOptions: DataTables.Settings = { "deferRender": true };
  dtTrigger: Subject<any> = new Subject<any>();
  contacts: Contact[] = [];
  faTrashCan = faTrashCan;
  faEdit = faEdit;
  faCopy = faCopy;
  contactList$: BehaviorSubject<Contact[]> | undefined;
  hidetrans: boolean = true;
  showaddModal: boolean = false;
  showdelModal: boolean = false;
  idtoDel: number = 0;
  nametoDel: string = "";
  modelAdd = { name: "", public_address: "" };
  modelDel = { id: 0, confirmflag: 0 };
  noContacts: boolean = false;
  message: string = "";
  needInit = true;
  nametoMod: string = "";
  addresstoMod: string = "";
  showmodModal: boolean = false;
  idtoMod: number = 0;
  modelMod = { id: 0, name: "", public_address: "" };

  constructor(
    private contactlistService: ContactListService,
    private databaseService: DatabaseService
  ) { }

  async ngOnInit() {
    this.contacts = await this.databaseService.getContacts();
    this.contactlistService.loadContacts(this.contacts);
    this.contactList$ = this.contactlistService.getContactList();
    if (this.contacts.length >= 1) {
      this.needInit = false;
      this.dtTrigger.next(this.contacts);
      await new Promise(resolve => setTimeout(resolve, 200));
      this.hidetrans = false;
    } else {
      this.noContacts = true;
    }
  };

  showaddContact(): void {
    this.showaddModal = true;
  }

  async addContact(data: any) {
    this.modelAdd = data;
    if (this.ckContact(this.modelAdd.name)) {
      this.showMessage("This contact name already exists. Try again.");
    } else {
      if (this.modelAdd.name != "" && this.modelAdd.public_address != "") {
        this.databaseService.addContacts(this.modelAdd);
        this.contactlistService.addContact(this.modelAdd.name, this.modelAdd.public_address);
        this.contactList$ = this.contactlistService.getContactList();
        this.contacts = this.contactList$.getValue();
        if (this.needInit) {
          this.needInit = false;
          this.dtTrigger.next(this.contacts);
          await new Promise(resolve => setTimeout(resolve, 200));
          this.hidetrans = false;
        }
        this.noContacts = false;
      }
    }
    this.showaddModal = false;
  }

  modContactPick(id: number): void {
    this.idtoMod = id;
    this.nametoMod = this.contacts[id].name;
    this.addresstoMod = this.contacts[id].address;
    this.showmodModal = true;
  }

  async modifyContact(data: any) {
//   modelMod = { id: 0, name: "", public_address: "" };
    this.modelMod = data;
    if ((this.modelMod.name !== this.nametoMod) && (this.ckContact(this.modelMod.name))) {
      this.showMessage("This contact name already exists. Try again.");
    } else {
      if (this.modelMod.name != "" && this.modelMod.public_address != "") {
        this.databaseService.editContacts(this.modelMod);
        this.contactlistService.modifyContact(this.modelMod.id, this.modelMod.name, this.modelMod.public_address);
        this.contactList$ = this.contactlistService.getContactList();
        this.contacts = this.contactList$.getValue();
      }
    }
    this.showmodModal = false;
  }


  delContactPick(id: number): void {
    this.idtoDel = id;
    this.nametoDel = this.contacts[id].name;
    this.showdelModal = true;
  }

  delContact(data: any): void {
    this.modelDel = data;
    if (this.modelDel.confirmflag) {
      this.databaseService.deleteContacts(this.modelDel.id);
      this.contactlistService.removeContact(this.modelDel.id);
      this.contactList$ = this.contactlistService.getContactList();
      this.contacts = this.contactList$.getValue();
      if (this.contacts.length === 0) {
        this.noContacts = true;
      }
    }
    this.showdelModal = false;
  }

  copyAddress(contactID: number): void {
    navigator.clipboard.writeText(this.contacts[contactID].address)
      .then(() => { })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  }

  ckContact(inname: string) {
    const foundContact = this.contacts.find(contact => contact.name === inname);
    if (foundContact?.name) {
      return true;
    } else {
      return false;
    }
  }

  showMessage(message: string): void {
    this.message = message;
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

}