import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'requestStatusIcon',
})
export class RequestStatusIconPipe implements PipeTransform {
  iconName = '';

  public transform(value: number): string {
    // console.log(value.length);
    // return value.length > 1 ? value[0].item : `${value[0].item}и еще`;

    switch (value) {
      case 2:
        this.iconName = 'clock';
        return this.iconName;
        break;
      case 3:
        this.iconName = 'success-standard';
        return this.iconName;
        break;
      default:
        return 'new';
        break;
    }
  }
}
