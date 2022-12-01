export class PacsEvent {
  public displayName: string;

  public eventDate: string;

  public accessPoint: string;

  public pacsDisplayName?: string;

  public thumbnailPhoto?: string;
}
export interface IPacsEvent {
  total: number;
  results: PacsEvent[];
}
