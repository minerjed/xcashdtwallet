import { Pipe, PipeTransform } from '@angular/core';
import { DecimalPipe } from '@angular/common';


@Pipe({
  name: 'xcash'
})
export class XcashCurrencyPipe implements PipeTransform {
  constructor(private decimalPipe: DecimalPipe) {}

  transform(value: number, args?: any): string {
    let formatedByCurrencyPipe = this.decimalPipe.transform(value, args);
    return formatedByCurrencyPipe + ' XCASH';  
  }

}