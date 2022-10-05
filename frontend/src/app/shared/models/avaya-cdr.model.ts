export class AvayaCDR {
  public callDateTime: string;

  public callDuration: number;

  public callingNumber: string;

  public calledNumber: string;

  public callCode: string;

  public callingName: string;

  public calledName: string;
}
export interface IAvayaCDR {
  total: number;
  results: AvayaCDR[];
}
