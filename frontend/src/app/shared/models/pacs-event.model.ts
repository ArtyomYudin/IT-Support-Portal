export class PacsEvent {
  public displayName: string;

  public date: string;

  public accessPoint: string;

  public thumbnailPhoto?: string;
}
export interface IPacsEvent {
  total: number;
  results: PacsEvent[];
}
