/**
 * Модуль формирования запросов для отправки на API Revers 8000
 */

// const photoDownloader = require('./photo_downloader');

import { logger } from '../logger';
import * as dbSelect from '../../shared/db/db_select';
import * as dbInsert from '../../shared/db/db_insert';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const datetime = require('node-datetime');

// создание буфера JSON, добавляя 4 байта длинны (младшими байтами вперед) в начало
export function createBuffer(postJSONData: any) {
  const buffer = Buffer.from(postJSONData);
  const bufferWithByte = Buffer.alloc(4 + buffer.length);
  bufferWithByte.writeInt32LE(buffer.length, 0);
  buffer.copy(bufferWithByte, 4);
  return bufferWithByte;
}

// Функция формирования запроса на Revers 8000 на основании данных полученных со стороннего СКУДа
export async function createRequestJSON(socket: any, reqBody: any, retry: any) {
  let postAccessJSON: any = [];
  let postDataJSON: any = [];
  let postEditCardJSON: any = [];
  let cardNumber;

  const getRequestTstamp = datetime.create();
  const dtStart = datetime.create();
  const dtEnd = datetime.create();
  dtEnd.offsetInHours(8);
  dtStart.offsetInHours(-1);

  const reqBodyJSON = JSON.parse(reqBody);
  const cardNoArray = (reqBodyJSON.card_no ? reqBodyJSON.card_no : '404').split('.');
  // const cardNoRightPart = cardNoArray[1].toString();
  let rByte = '';

  /*
  if (cardNoRightPart.length < 5) {
    for (let i = cardNoRightPart.length; i < 5; i += 1) {
      zeroChar += '0';
    }
  } else {
    for (let i = 0; i < cardNoRightPart.length; i += 1) {
      if (cardNoRightPart.charAt(i) === '0') {
        zeroChar += '0';
      } else break;
    }
  }
  */

  // if (cardNoArray[1].toString().charAt(0) === '0') {
  //  cardNumber = parseInt(`${parseInt(cardNoArray[0], 10).toString(16)}0${parseInt(cardNoArray[1], 10).toString(16)}`, 16);
  // } else {
  //  cardNumber = parseInt(parseInt(cardNoArray[0], 10).toString(16) + parseInt(cardNoArray[1], 10).toString(16), 16);
  // }

  rByte = parseInt(cardNoArray[1], 10).toString(16);
  switch (rByte.length) {
    case 3:
      cardNumber = parseInt(`${parseInt(cardNoArray[0], 10).toString(16)}0${parseInt(cardNoArray[1], 10).toString(16)}`, 16);
      break;
    case 2:
      cardNumber = parseInt(`${parseInt(cardNoArray[0], 10).toString(16)}00${parseInt(cardNoArray[1], 10).toString(16)}`, 16);
      break;
    default:
      cardNumber = parseInt(parseInt(cardNoArray[0], 10).toString(16) + parseInt(cardNoArray[1], 10).toString(16), 16);
      break;
  }
  /*
  if (parseInt(cardNoArray[1], 10).toString(16).length ) {
    cardNumber = parseInt(parseInt(cardNoArray[0], 10).toString(16) + zeroChar + parseInt(cardNoArray[1], 10).toString(16), 16);
  } else {
    cardNumber = parseInt(parseInt(cardNoArray[0], 10).toString(16) + parseInt(cardNoArray[1], 10).toString(16), 16);
  }
  */

  logger.info({
    'Pacs Guest Event:': [
      reqBodyJSON.event,
      'Card number 1:',
      reqBodyJSON.card_no,
      'Card number 2:',
      cardNumber,
      'Pass Type:',
      reqBodyJSON.pass_type,
      'Retry:',
      retry,
    ],
  });
  logger.info({ 'Photo:': reqBodyJSON.photo });
  if (!retry) {
    // const cardType = (/pass_auto_cam/.test(reqBodyJSON.photo)) ? 'car' : 'person';
    const cardType = /автомобиль/.test(reqBodyJSON.pass_type) ? 'car' : 'person';
    const insertEventValue = [
      getRequestTstamp.format('Y-m-d H:M:S'),
      reqBodyJSON.event,
      cardType,
      reqBodyJSON.card_no,
      cardNumber,
      null,
      reqBodyJSON.photo,
    ];
    try {
      // await dashboard.query(inserGuestCardEvent, insertEventValue);
    } catch (error) {
      logger.error(error);
    }
  }
  switch (reqBodyJSON.event) {
    case 'issue':
      postEditCardJSON = JSON.stringify({
        Command: 'editcard',
        Id: reqBodyJSON.id,
        Version: 1,
        Data: {
          Id: 293,
          CardNum: cardNumber,
          TemplateId: 16,
          StartDate: dtStart.format('d.m.Y H:M:S'),
          EndDate: dtEnd.format('d.m.Y H:M:S'),
          Action: 1,
        },
      });
      postDataJSON = JSON.stringify({
        Command: 'addcard',
        Id: reqBodyJSON.id,
        Version: 1,
        Data: {
          Id: 293,
          CardNum: cardNumber,
          TemplateId: 16,
          StartDate: dtStart.format('d.m.Y H:M:S'),
          EndDate: dtEnd.format('d.m.Y H:M:S'),
          Action: 1,
        },
      });

      if (!retry) {
        socket.write(createBuffer(postDataJSON));
      } else {
        socket.write(createBuffer(postEditCardJSON));
      }
      // socket.write(createBuffer(postJSONData));
      // photoDownloader(dtStart.format('d-m-Y-H-M-S'), reqBodyJSON.photo);
      break;
    case 'wdraw':
      postAccessJSON = JSON.stringify({
        Command: 'loadcard',
        Id: reqBodyJSON.id,
        Version: 1,
        Data: {
          CardNum: cardNumber,
          Action: 0,
        },
      });
      postDataJSON = JSON.stringify({
        Command: 'delcard',
        Id: reqBodyJSON.id,
        Version: 1,
        CardNum: cardNumber,
      });
      if (!retry) {
        socket.write(createBuffer(postAccessJSON));
      }
      setTimeout(
        () => {
          socket.write(createBuffer(postDataJSON));
        },
        retry ? 10000 : 2000,
      );

      break;
    default:
      logger.info('Pacs Guest No event');
      break;
  }
}
