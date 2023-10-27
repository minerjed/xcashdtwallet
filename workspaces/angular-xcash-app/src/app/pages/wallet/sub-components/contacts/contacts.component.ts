import { Component, OnInit, ViewChild } from '@angular/core';
import { ContactListService } from 'src/app/services/contact-list.service';
import { DatabaseService } from 'src/app/services/database.service';
import { BehaviorSubject } from 'rxjs';
import { Contact } from 'src/app/models/contact.model';
import { Subject } from 'rxjs';
import { faTrashCan, faEdit, faCopy } from '@fortawesome/free-solid-svg-icons';
import { DataTableDirective } from 'angular-datatables';
declare var $: any;

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.sass']
})
export class ContactsComponent implements OnInit {
  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;
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
      this.dtTrigger.next(this.contacts);
      await new Promise(resolve => setTimeout(resolve, 500));
      this.changePageLength(5);
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
          this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
            dtInstance.destroy();
          });
          this.dtTrigger.next(this.contacts);
          await new Promise(resolve => setTimeout(resolve, 500));
          this.changePageLength(5);
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
          this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
            dtInstance.destroy();
          });
          this.databaseService.editContacts(this.modelMod);
          this.contactlistService.modifyContact(this.modelMod.id, this.modelMod.name, this.modelMod.public_address);
          this.contactList$ = this.contactlistService.getContactList();
          this.contacts = this.contactList$.getValue();
          this.dtTrigger.next(this.contacts);
          await new Promise(resolve => setTimeout(resolve, 500));
          this.changePageLength(5);
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
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
      });
      this.databaseService.deleteContacts(this.modelDel.id);
      this.contactlistService.removeContact(this.modelDel.id);
      this.contactList$ = this.contactlistService.getContactList();
      this.contacts = this.contactList$.getValue();
      this.dtTrigger.next(this.contacts);
      await new Promise(resolve => setTimeout(resolve, 500));
      this.changePageLength(5);
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
    this.dtTrigger.unsubscribe();
  }


  changePageLength(newLength: number): void {
    // I think a bug in angular-datatable is preventing the setting of dtoptions so created this workaround for now
    const dtInstance = this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.page.len(newLength).draw();
    });
    $('div.dataTables_length').find('select, label').remove();
    var newDropdown = $('<select></select>');
    newDropdown.append('<option value="5">5</option>');
    newDropdown.append('<option value="10">10</option>');
    newDropdown.append('<option value="25">25</option>');
    newDropdown.append('<option value="50">50</option>');
    newDropdown.append('<option value="100">100</option>');
    $('div.dataTables_length').append(newDropdown);
    var table = $('#myTable').DataTable();
    $('div.dataTables_length').append('<label>Show </label>').append(newDropdown).append(' entries');
    newDropdown.on('change', () => {
      this.dtElement?.dtInstance.then((dtInstance: DataTables.Api) => {
        const val = newDropdown.val();
        if (typeof val === 'number' || (typeof val === 'string' && !isNaN(+val))) {
          dtInstance.page.len(+val).draw();
        }
      });
    });
  }

}