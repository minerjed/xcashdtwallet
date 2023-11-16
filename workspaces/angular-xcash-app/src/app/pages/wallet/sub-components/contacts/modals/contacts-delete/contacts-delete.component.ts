import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-contacts-delete',
  templateUrl: './contacts-delete.component.html',
  styleUrls: ['./contacts-delete.component.sass']
})
export class ContactsDeleteComponent implements OnInit {

  @Input() inId: number = 0;
  @Input() inName: string = "";

  @Output() onClose = new EventEmitter<{ id: number, confirmflag: boolean }>();

  ngOnInit() {
  }

  cancelDel() { this.onClose.emit({ id: 0, confirmflag: false }); }
  confirmDel(event: Event) {
    event.preventDefault();
    this.onClose.emit({ id: this.inId, confirmflag: true });
  }

}