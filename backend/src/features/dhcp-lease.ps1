$username = ""
$password = ConvertTo-SecureString "" -AsPlainText -Force

$psCred = New-Object System.Management.Automation.PSCredential -ArgumentList ($username, $password)

$dhcp = New-PSSession -ComputerName arnold.c-inform.spbatlas -Credential $psCred -Authentication Negotiate

Invoke-Command -Session $dhcp -ScriptBlock {
				Get-DhcpServerv4Scope -ComputerName "arnold.c-inform.spbatlas" |
				Get-DhcpServerv4Lease -ComputerName "arnold.c-inform.spbatlas"
			} |
	select IPAddress, ClientId, HostName, AddressState, LeaseExpiryTime |
	#ConvertTo-Csv -NoTypeInformation -Delimiter "|" |
	Select-Object -Skip 1 
