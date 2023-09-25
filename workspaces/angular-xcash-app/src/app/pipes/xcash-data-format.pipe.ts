import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'xcashDataFormat'
})
export class XcashDataFormatPipe implements PipeTransform {

  transform(value: string, args: number = 10): any {
    if (value.length > args) {
      return value.slice(0, args) + '...';
    } else {
      return value;
    }
  }

}
