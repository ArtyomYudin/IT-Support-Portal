import { WebSocket } from 'ws';
import { PowerShell } from 'node-powershell';
import { logger } from './logger';

export async function getDHCPLease(ws: WebSocket) {
  const ps = new PowerShell({
    // debug: true,
    executableOptions: {
      '-ExecutionPolicy': 'Bypass',
      '-NoProfile': true,
    },
  });
  const getLeaseCommand = PowerShell.command`
    $username = ${process.env.ARNOLD_USER as string};
    $password = ConvertTo-SecureString ${process.env.ARNOLD_USER_PASSWORD as string} -AsPlainText -Force;
    $psCred = New-Object System.Management.Automation.PSCredential -ArgumentList ($username, $password);
    $dhcp = New-PSSession -ComputerName arnold.c-inform.spbatlas -Credential $psCred -Authentication Negotiate;
    Invoke-Command -Session $dhcp -ScriptBlock {
				Get-DhcpServerv4Scope -ComputerName "arnold.c-inform.spbatlas" |
				Get-DhcpServerv4Lease -ComputerName "arnold.c-inform.spbatlas"
			} |
	  select IPAddress, ClientId, HostName, AddressState, LeaseExpiryTime |
	  ConvertTo-Csv -NoTypeInformation -Delimiter "|";
    Get-PSSession | Remove-PSSession;
    `;

  // const scriptCommand = PowerShell.command`. ./dhcp-lease.ps1`;
  // const result = await ps.invoke(scriptCommand);

  const result = (await ps.invoke(getLeaseCommand)).raw.replace(/"/g, '');
  // console.log(result.slice(result.indexOf('\n') + 1));
  const headers = ['ipAddress', 'macAddress', 'hostName', 'addressState', 'leaseExpiryTime'];
  const dhcpLeaseArray = result
    .slice(result.indexOf('\n') + 1)
    .split('\n')
    // .filter(row => row.match('[?1'))
    .map(v => {
      const values = v.split('|');

      // return titles.reduce((obj, title, index) => ((obj[title] = values[index]), obj), {});
      const el = headers.reduce((object: any, header: string, index: number) => {
        object[header] = values[index];
        return object;
      }, {});
      return el;
    });

  console.log(dhcpLeaseArray[164]);
  try {
    ws.send(
      JSON.stringify({
        event: 'event_dhcp_lease',
        data: { results: dhcpLeaseArray, total: dhcpLeaseArray.length },
      }),
    );
  } catch (error) {
    logger.error(`getDHCPLease - ${error}`);
  } finally {
    await ps.dispose();
  }
}
