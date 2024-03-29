import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { faContactCard, faWallet, faPaste } from '@fortawesome/free-solid-svg-icons';
import { ValidatorsRegexService } from 'src/app/services/validators-regex.service';
import { ConstantsService } from 'src/app/services/constants.service';

@Component({
  selector: 'app-contacts-add',
  templateUrl: './contacts-add.component.html',
  styleUrls: ['./contacts-add.component.sass']
})
export class ContactsAddComponent implements OnInit {
  faContact = faContactCard;
  faWallet = faWallet;
  faPaste = faPaste;
  contactname: string = '';
  contactaddress: string = '';

  @Output() onClose = new EventEmitter<{ name: string, public_address: string }>();

  constructor(private validatorsRegexService: ValidatorsRegexService,
    private constantsService: ConstantsService) { }

  nameCk: string = '';
  minlen: number = 0;
  maxlen: number = 0;
  addressCk: string = '';

  ngOnInit() {
    this.nameCk = this.validatorsRegexService.text_name;
    this.minlen = this.constantsService.text_settings_minlength;
    this.maxlen = this.constantsService.text_settings_length;
    this.addressCk = this.validatorsRegexService.xcash_address;
  }

  async onPaste(event: Event, infield: string): Promise<void> {
    event.preventDefault(); // prevent default paste behavior
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (infield === 'name') {
        this.contactname = clipboardText;
      } else {
        this.contactaddress = clipboardText;
      }
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
    }
  }

  cancelAdd() { this.onClose.emit({ name: '', public_address: '' }); }
  selectAdd(event: Event) { 
    event.preventDefault();
    this.onClose.emit({ name: this.contactname, public_address: this.contactaddress });
  }

}