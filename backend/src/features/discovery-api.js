// eslint-disable-next-line @typescript-eslint/no-var-requires
var nmap = require('node-nmap');
nmap.nmapLocation = 'nmap';
var nmapscan = new nmap.NmapScan('172.21.220.2-254', '-sn');
console.log('Starting nmap scan...');
// nmapscan.on('complete', (data: any) => {
//  console.log(data);
// });
// nmapscan.on('error', (error: any) => {
//  console.log(error);
// });
// nmapscan.startScan();
