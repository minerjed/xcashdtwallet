import { Injectable } from '@angular/core';
import { AbstractControl, ValidatorFn } from '@angular/forms';
import { ConstantsService } from 'src/app/services/constants.service';

@Injectable({
  providedIn: 'root'
})
export class ValidatorsRegexService {
  public readonly xcash_address: string = '';
  public readonly text_settings: string = '';
  public readonly payment_id: string = '';
  public readonly xcash_amount: string = '';

  constructor(private constantsService: ConstantsService) { 
    this.xcash_address = `^(${this.constantsService.xcash_public_address_prefix}[a-zA-Z0-9]{${this.constantsService.xcash_public_address_length_settings}}|${this.constantsService.xcash_integrated_address_prefix}[a-zA-Z0-9]{${this.constantsService.xcash_integrated_address_length_settings}}|${this.constantsService.xcash_sub_address_prefix}[a-zA-Z0-9]{${this.constantsService.xcash_sub_address_length_settings}})$`;
    this.text_settings = `^[a-zA-Z0-9]{1,${this.constantsService.text_settings_length}}$`;
    this.payment_id = `^([0-9a-f]{${this.constantsService.unencrypted_payment_id_length}}|[0-9a-f]{${this.constantsService.encrypted_payment_id_length}}|)$`;
    this.xcash_amount = `\\b(^[0-9]{1,11}.[0-9]{0,5}[1-9]{1}$|^[1-9]{1}[0-9]{0,10}$|${this.constantsService.xcash_total_supply})\\b$`;
    
  }

//mnemonic_seed_or_private_key:RegExp = new RegExp(`^((?:\\b[a-z]+\\b[ ]*){${this.constantsService.mnemonic_seed_word_length}}|(?:[0-9a-f]{${this.constantsService.private_key_length}}))$`);
  //mnemonic_seed:RegExp = new RegExp(`^(\\b[a-z]+\\b[ ]*){${this.constantsService.mnemonic_seed_word_length}}`)
  //private_key:RegExp = new RegExp(`^([0-9a-f]{${this.constantsService.private_key_length}})$`);
  //payment_id:RegExp = new RegExp(`^([0-9a-f]{${this.constantsService.unencrypted_payment_id_length}}|[0-9a-f]{${this.constantsService.encrypted_payment_id_length}}|)$`);
  //encrypted_payment_id:RegExp = new RegExp(`^([0-9a-f]{${this.constantsService.encrypted_payment_id_length}}|)$`);
  //xcash_amount:RegExp = new RegExp(`\\b(^[0-9]{1,11}.[0-9]{0,5}[1-9]{1}$|^[1-9]{1}[0-9]{0,10}$|${this.constantsService.xcash_total_supply})\\b$`);
  //xcash_reserve_proof_amount:RegExp = new RegExp(`\\b(^[0-9]{1,11}.[0-9]{0,5}[1-9]{1}$|^[1-9]{1}[0-9]{0,10}$|${this.constantsService.xcash_total_supply}|^ALL$)\\b$`);
  //reserve_proof:RegExp = new RegExp("^ReserveProofV1[a-zA-Z0-9]+$");
  //signature:RegExp = new RegExp(`^${this.constantsService.signature_prefix}[a-zA-Z0-9]{${this.constantsService.signature_length_settings}}$`);
//  text_settings:RegExp = new RegExp(`^[a-zA-Z0-9]{1,${this.constantsService.text_settings_length}}$`);
  //data_to_sign:RegExp = new RegExp(`^[a-zA-Z0-9]+$`);
//  this.text_settings = `^[a-zA-Z0-9]{1,${this.constantsService.text_settings_length}}$`;
  //contact_name:RegExp = new RegExp("^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$");
  //delegate_name:RegExp = new RegExp(`^[a-zA-Z0-9._-]+$`);
  //delegate_item:RegExp = new RegExp(`\\b(IP_address|about|website|team|shared_delegate_status|delegate_fee|server_specs)\\b`);
}