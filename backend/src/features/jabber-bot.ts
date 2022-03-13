import Botkit from 'botkit-legacy';

const controller = Botkit.jabberbot({
  json_file_store: './bot_storage/',
});

export const monitoringBot = controller.spawn({
  client: {
    jid: 'itomonitoringbot@center-inform.ru',
    password: 'ihfq,brec',
    host: 'angela.center-inform.ru',
    port: 5222,
  },
});

/*
bot.say({
  user: 'a.yudin@center-inform.ru',
  text: 'hi!',
});
*/
