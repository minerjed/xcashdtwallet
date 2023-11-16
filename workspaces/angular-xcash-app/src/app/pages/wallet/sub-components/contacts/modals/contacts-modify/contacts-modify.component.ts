import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { faContactCard, faWallet, faPaste } from '@fortawesome/free-solid-svg-icons';
import { ValidatorsRegexService } from 'src/app/services/validators-regex.service';
import { ConstantsService } from 'src/app/services/constants.service';

@Component({
  selector: 'app-contacts-modify',
  templateUrl: './contacts-modify.component.html',
  styleUrls: ['./contacts-modify.component.sass']
})
export class ContactsModifyComponent implements OnInit{
  faContact = faContactCard;
  faWallet = faWallet;
  faPaste = faPaste;
  contactname : string = '';
  contactaddress: string = '';

  @Input() inId: number = 0;
  @Input() inName: string = "";
  @Input() inAddress: string = "";
  @Output() onClose = new EventEmitter<{id: number, name : string, public_address : string}>();

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
    this.contactname = this.inName;
    this.contactaddress = this.inAddress;
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

  cancelMod() { this.onClose.emit({id: 0, name: '', public_address: ''}); }
  selectMod(event: Event) { 
    event.preventDefault();
    this.onClose.emit({id: this.inId, name: this.contactname, public_address: this.contactaddress});
   }

}