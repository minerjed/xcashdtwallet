import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { ContactListService } from 'src/app/services/contact-list.service';
import { DatabaseService } from 'src/app/services/database.service';
import { BehaviorSubject } from 'rxjs';
import { Contact } from 'src/app/models/contact.model';
import { faTrashCan, faEdit, faCopy } from '@fortawesome/free-solid-svg-icons';
declare var $: any;

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.sass']
})
export class ContactsComponent implements OnInit, OnDestroy {
  @ViewChild('contacttable') table!: ElementRef;
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
  nametoMod: string = "";
  addresstoMod: string = "";
  showmodModal: boolean = false;
  idtoMod: number = 0;
  showspinner: boolean = true;
  modelMod = { id: 0, name: "", public_address: "" };
  tippyOptions = {
    trigger: 'click',
    hideOnClick: false,
    onShow: (instance: any) => {
      setTimeout(() => {
        instance.hide();
      }, 700);
    }
  };

  constructor(
    private contactlistService: ContactListService,
    private databaseService: DatabaseService
  ) { }

  async ngOnInit() {
    this.contacts = await this.databaseService.getContacts();
    this.contactlistService.loadContacts(this.contacts);
    this.contactList$ = this.contactlistService.getContactList();
    if (this.contacts.length >= 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
      $(this.table.nativeElement).DataTable({
        lengthMenu: [5, 25, 50, 100],
        pageLength: 5
      });
      this.hidetrans = false;
    } else {
      this.noContacts = true;
    }
    this.showspinner = false;
  };

  showaddContact(): void {
    this.showaddModal = true;
  }

  async addContact(data: any) {
    this.showaddModal = false;
    this.showspinner = true;
    this.modelAdd = data;
    if (this.modelAdd.name != "" && this.modelAdd.public_address != "") {
      if (this.ckContact(this.modelAdd.name)) {
        this.showMessage("This contact name is already in use. Try again.");
      } else {
        if (this.ckAddress(this.modelAdd.public_address)) {
          this.showMessage("This contact address is already in use. Try again.");
        } else {
          this.databaseService.addContacts(this.modelAdd);
          this.contactlistService.addContact(this.modelAdd.name, this.modelAdd.public_address);
          this.contactList$ = this.contactlistService.getContactList();
          this.contacts = this.contactList$.getValue();
          this.hidetrans = true;
          if ($.fn.DataTable.isDataTable(this.table.nativeElement)) {
            $(this.table.nativeElement).DataTable().destroy();
          }
          await new Promise(resolve => setTimeout(resolve, 500));
          $(this.table.nativeElement).DataTable({
            lengthMenu: [5, 25, 50, 100],
            pageLength: 5
          })
          this.hidetrans = false;
          this.noContacts = false;
        }
      }
    }
    this.showspinner = false;
  }

  modContactPick(id: number): void {
    this.idtoMod = id;
    this.nametoMod = this.contacts[id].name;
    this.addresstoMod = this.contacts[id].address;
    this.showmodModal = true;
  }

  async modifyContact(data: any) {
    this.showmodModal = false;
    this.showspinner = true;
    this.modelMod = data;
    if (this.modelMod.name != "" && this.modelMod.public_address != "") {
      if ((this.modelMod.name !== this.nametoMod) && (this.ckContact(this.modelMod.name))) {
        this.showMessage("This contact name is already in use. Try again.");
      } else {
        if ((this.modelMod.public_address !== this.addresstoMod) && (this.ckAddress(this.modelMod.public_address))) {
          this.showMessage("This contact address is already in use. Try again.");
        } else {
          this.hidetrans = true;
          if ($.fn.DataTable.isDataTable(this.table.nativeElement)) {
            $(this.table.nativeElement).DataTable().destroy();
          }
          this.databaseService.editContacts(this.modelMod);
          this.contactlistService.modifyContact(this.modelMod.id, this.modelMod.name, this.modelMod.public_address);
          this.contactList$ = this.contactlistService.getContactList();
          this.contacts = this.contactList$.getValue();
          await new Promise(resolve => setTimeout(resolve, 500));
          $(this.table.nativeElement).DataTable({
            lengthMenu: [5, 25, 50, 100],
            pageLength: 5
          })
          this.hidetrans = false;
        }
      }
    }
    this.showspinner = false;
  }

  delContactPick(id: number): void {
    this.idtoDel = id;
    this.nametoDel = this.contacts[id].name;
    this.showdelModal = true;
  }

  async delContact(data: any) {
    this.showdelModal = false;
    this.showspinner = true;
    this.modelDel = data;
    if (this.modelDel.confirmflag) {
      this.hidetrans = true;
      if ($.fn.DataTable.isDataTable(this.table.nativeElement)) {
        $(this.table.nativeElement).DataTable().destroy();
      }
      this.databaseService.deleteContacts(this.modelDel.id);
      this.contactlistService.removeContact(this.modelDel.id);
      this.contactList$ = this.contactlistService.getContactList();
      this.contacts = this.contactList$.getValue();
			await new Promise(resolve => setTimeout(resolve, 500));
      $(this.table.nativeElement).DataTable({
        lengthMenu: [5, 25, 50, 100],
        pageLength: 5
      })
      this.hidetrans = false;
      if (this.contacts.length === 0) {
        this.noContacts = true;
      }
    }
    this.showspinner = false;
  }

  copyAddress(contactID: number): void {
    navigator.clipboard.writeText(this.contacts[contactID].address)
      .then(() => { })
      .catch(err => {
        this.showMessage('Failed to copy text: ' + err);
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

  ckAddress(inaddress: string) {
    const foundAddress = this.contacts.find(contact => contact.address === inaddress);
    if (foundAddress?.name) {
      return true;
    } else {
      return false;
    }
  }

  showMessage(message: string): void {
    this.message = message;
  }

  ngOnDestroy(): void {
    if (this.contactList$) {
      this.contactList$.complete();
    }
  }

}