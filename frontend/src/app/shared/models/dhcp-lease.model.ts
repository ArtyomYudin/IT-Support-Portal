export class DHCPLease {
  public ipAddress: string;

  public MacAddress: number;

  public hostName: string;

  public addressState: string;

  public leaseExpiryTime: string;
}
export interface IDHCPLease {
  total: number;
  results: DHCPLease[];
}
