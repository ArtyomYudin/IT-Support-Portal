// eslint-disable-next-line @typescript-eslint/no-var-requires
const nmap = require('node-nmap');

nmap.nmapLocation = 'nmap';

const nmapscan = new nmap.NmapScan('172.21.220.2-254', '-T5');

console.log('Starting nmap scan...');

nmapscan.on('complete', (data: any) => {
  console.log(data);
});
nmapscan.on('error', (error: any) => {
  console.log(error);
});
nmapscan.startScan();
