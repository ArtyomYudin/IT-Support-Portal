export class Employee {
  public id: number;

  public displayName: string;

  public departmentName: string;

  public positionName: string;

  public departmentManagerName?: string;

  public directionManagerName?: string;
}
export interface IEmployee {
  total: number;
  results: Employee[];
}
