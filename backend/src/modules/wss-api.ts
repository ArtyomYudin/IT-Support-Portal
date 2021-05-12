export function wsParseMessage(msg: any): void {
  const parseMsg = JSON.parse(msg);
  switch (parseMsg.event) {
    case 'requestInit':
      console.log(`Connection test ${parseMsg.data}`);
      break;

    default:
      break;
  }
}
