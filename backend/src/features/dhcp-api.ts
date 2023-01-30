import { Server, WebSocket } from 'ws';
import { PowerShell } from 'node-powershell';
import { logger } from './logger';

export async function getDHCPInfo(wss: Server<WebSocket>, ws?: WebSocket) {
  const ps = new PowerShell({
    // debug: true,
    executableOptions: {
      '-ExecutionPolicy': 'Bypass',
      '-NoProfile': true,
    },
  });

  try {
    const getInfoCommand = PowerShell.command`
    $so = New-PSSessionOption -SkipCACheck -SkipCNCheck;
    $username = ${process.env.ARNOLD_USER as string};
    $password = ConvertTo-SecureString ${process.env.ARNOLD_USER_PASSWORD as string} -AsPlainText -Force;
    $psCred = New-Object System.Management.Automation.PSCredential -ArgumentList ($username, $password);
    $dhcp = New-PSSession -ComputerName arnold.c-inform.spbatlas -SessionOption $so -Credential $psCred -Authentication Negotiate;
    Invoke-Command -Session $dhcp -ScriptBlock {
      Get-DhcpServerv4Scope -ComputerName "arnold.c-inform.spbatlas" |
      Get-DhcpServerv4ScopeStatistics -ComputerName "arnold.c-inform.spbatlas"
    } |
    select ScopeId, AddressesFree, AddressesInUse, ReservedAddress, PSComputerName |
	  ConvertTo-Csv -NoTypeInformation -Delimiter "|";
    Get-PSSession | Remove-PSSession;
    `;

    const result = (await ps.invoke(getInfoCommand)).raw.replace(/"/g, '');
    const headers = ['scopeId', 'addressesFree', 'addressesInUse', 'reservedAddress', 'PSComputerName'];
    const dhcpInfoArray = result
      .slice(result.indexOf('\n') + 1)
      .split('\n')
      .filter(row => !row.match('\x1B[[0-?]*'))
      .map(v => {
        const values = v.split('|');
        const el = headers.reduce((object: any, header: string, index: number) => {
          object[header] = values[index];
          return object;
        }, {});
        return el;
      });

    if (ws) {
      ws.send(
        JSON.stringify({
          event: 'event_dhcp_info',
          data: dhcpInfoArray,
        }),
      );
    } else {
      wss.clients.forEach((client: any) => {
        client.send(
          JSON.stringify({
            event: 'event_vpn_active_session_count',
            data: dhcpInfoArray,
          }),
        );
      });
    }

    // console.log(dhcpInfoArray);
  } catch (error) {
    logger.error(`getDHCPLease - ${error}`);
  } finally {
    await ps.dispose();
  }
}

export async function getDHCPLease(ws: WebSocket) {
  const ps = new PowerShell({
    // debug: true,
    executableOptions: {
      '-ExecutionPolicy': 'Bypass',
      '-NoProfile': true,
    },
  });
  try {
    const getLeaseCommand = PowerShell.command`
      $so = New-PSSessionOption -SkipCACheck -SkipCNCheck;
      $username = ${process.env.ARNOLD_USER as string};
      $password = ConvertTo-SecureString ${process.env.ARNOLD_USER_PASSWORD as string} -AsPlainText -Force;
      $psCred = New-Object System.Management.Automation.PSCredential -ArgumentList ($username, $password);
      $dhcp = New-PSSession -ComputerName arnold.c-inform.spbatlas -SessionOption $so -Credential $psCred -Authentication Negotiate;
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
    const headers = ['ipAddress', 'macAddress', 'hostName', 'addressState', 'leaseExpiryTime'];
    const dhcpLeaseArray = result
      .slice(result.indexOf('\n') + 1)
      .split('\n')
      .filter(row => !row.match('\x1B[[0-?]*'))
      .map(v => {
        const values = v.split('|');

        // return titles.reduce((obj, title, index) => ((obj[title] = values[index]), obj), {});
        const el = headers.reduce((object: any, header: string, index: number) => {
          object[header] = values[index];
          return object;
        }, {});
        return el;
      });
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
