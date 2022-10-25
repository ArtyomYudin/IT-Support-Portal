export class VpnActiveSession {
  public sessionStart: string;

  public node: string;

  public user: string;

  public clientIP: string;

  public mappedIP: string;

  public policyName: string;
}
export interface IVpnActiveSession {
  total: number;
  results: VpnActiveSession[];
}
