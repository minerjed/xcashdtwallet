import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { DatabaseService } from 'src/app/services/database.service';
import { Contact } from 'src/app/models/contact.model';

@Component({
  selector: 'app-get-address',
  templateUrl: './get-address.component.html',
  styleUrls: ['./get-address.component.sass']
})
export class GetAddressComponent implements OnInit {

  constructor(private databaseService: DatabaseService)
    { };

  @Output() onClose = new EventEmitter<{name : string, address : string}>();
  outname : string = "";
  outaddress : string = ""; 
	contacts: Contact[] = [];

  async ngOnInit() {
    this.contacts = await this.databaseService.getContacts();
   }

  cancelAddress() { this.onClose.emit({name: "", address: ""}); }
  confirmAddress() { this.onClose.emit({name: this.outname, address: this.outaddress}); }

}
