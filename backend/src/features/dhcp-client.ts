import { WebSocket } from 'ws';
import { PowerShell } from 'node-powershell';
import { logger } from './logger';

export async function getDHCPLease(ws: WebSocket) {
  const ps = new PowerShell({
    debug: true,
    executableOptions: {
      '-ExecutionPolicy': 'Bypass',
      '-NoProfile': true,
    },
  });
  const printCommand = PowerShell.command`
    $username = "xx";
    $password = ConvertTo-SecureString "xx" -AsPlainText -Force;
    $psCred = New-Object System.Management.Automation.PSCredential -ArgumentList ($username, $password);
    $dhcp = New-PSSession -ComputerName arnold.c-inform.spbatlas -Credential $psCred -Authentication Negotiate;

    Invoke-Command -Session $dhcp -ScriptBlock {
				Get-DhcpServerv4Scope -ComputerName "arnold.c-inform.spbatlas" |
				Get-DhcpServerv4Lease -ComputerName "arnold.c-inform.spbatlas"
			} |
	  select IPAddress, ClientId, HostName, AddressState, LeaseExpiryTime |
	  #ConvertTo-Csv -NoTypeInformation -Delimiter "|" |
	  Select-Object -Skip 1 
    `;

  // const scriptCommand = PowerShell.command`. ./dhcp-lease.ps1`;
  // const result = await ps.invoke(scriptCommand);

  const result = await ps.invoke(printCommand);
  console.log(result);
  try {
    ws.send(
      JSON.stringify({
        event: 'event_dhcp_lease',
        // data: { results: avayaCDRArray, total: avayaCDRArray.length },
      }),
    );
  } catch (error) {
    logger.error(`getDHCPLease - ${error}`);
  } finally {
    await ps.dispose();
  }
}
