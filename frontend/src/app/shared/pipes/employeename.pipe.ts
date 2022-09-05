import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'employeeName',
})
export class EmployeeNamePipe implements PipeTransform {
  public transform(value: any): any {
    const array = value.split(' ');
    return `${array[0]} ${array[1][0]}. ${array[2][0]}.`;
  }
}
