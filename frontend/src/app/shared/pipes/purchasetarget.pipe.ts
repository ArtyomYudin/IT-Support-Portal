import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'purchaseTarget',
})
export class PurchaseTargetPipe implements PipeTransform {
  public transform(value: any): any {
    let itemString = '';
    // console.log(value.length);
    // return value.length > 1 ? value[0].item : `${value[0].item}и еще`;
    value.forEach((itemValue: any) => {
      itemString = `${itemString}, ${itemValue.item}`;
    });
    return itemString;
  }
}
