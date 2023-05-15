import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class ConstantsService {
  public readonly xcash_public_address_prefix : string = 'XCA';
  public readonly xcash_integrated_address_prefix : string = "XCB";
  public readonly xcash_sub_address_prefix : string = "8";
  public readonly xcash_public_address_length : number = 98;
  public readonly xcash_integrated_address_length : number = 110;
  public readonly xcash_sub_address_length : number = 95;
  public readonly xcash_public_address_length_settings : number = this.xcash_public_address_length - this.xcash_public_address_prefix.length;
  public readonly xcash_integrated_address_length_settings : number = this.xcash_integrated_address_length - this.xcash_integrated_address_prefix.length;
  public readonly xcash_sub_address_length_settings : number = this.xcash_sub_address_length - this.xcash_sub_address_prefix.length;
  public readonly xcash_total_supply : number = 100000000000;
  public readonly private_key_length : number = 64;
  public readonly mnemonic_seed_word_length : number = 25;
  public readonly unencrypted_payment_id_length : number = 64;
  public readonly encrypted_payment_id_length : number = 16;
  public readonly signature_prefix : string = "SigV1";
  public readonly signature_length : number = 93;
  public readonly signature_length_settings : number = this.signature_length - this.signature_prefix.length;
  public readonly text_settings_length : number = 30;
  public readonly xcash_decimal_places = 1000000;
  public readonly xcash_rpc_url: string = 'http://localhost:18285/json_rpc';
  public readonly xcash_calc_fee: number = 0.0000349692;
}