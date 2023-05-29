import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'voteFormat'
})
export class VoteFormatPipe implements PipeTransform {
  transform(value: number): string {
    if (isNaN(value)) return '';
    if (value < 1000) {
      return value.toString();
    } else if (value >= 1000 && value < 1000000) {
      return (value / 1000).toFixed(1) + 'K';
    } else if (value >= 1000000 && value < 1000000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000000000 && value < 1000000000000) {
      return (value / 1000000000).toFixed(1) + 'B';
    } else {
      return (value / 1000000000000).toFixed(1) + 'T';
    }
  }
}