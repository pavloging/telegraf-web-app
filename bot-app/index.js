const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');

// replace the value below with the Telegram token you receive from @BotFather
const PORT = '8000'
const token = 'TELEGRAM_TOKEN';
const webAppUrl = 'https://crypto-way.netlify.app'

const bot = new TelegramBot(token, {polling: true});
const app = express()

app.use(express.json())
app.use(cors())

// Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  const chatId = msg.chat.id;
  const resp = match[1]; // the captured "whatever"

  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, resp);
});

// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text

  switch (text) {
    case '/start':
      bot.sendMessage(chatId, 'Добро пожаловать!')
      bot.sendMessage(chatId, 'Ниже появится кнопка, заполни форму', {
          reply_markup: {keyboard: [[{text: 'Заполнить форму', web_app:{url: webAppUrl + '/form'}}]]
      }})
      bot.sendMessage(chatId, 'Заходи на web по кнопке', {
        reply_markup: {inline_keyboard: [[{text: 'Сделать заказ', web_app:{url: webAppUrl}}]]
      }})
      break;
  
    default:
      bot.sendMessage(chatId, 'Received your message');
      break;
  }
  if(msg?.web_app_data?.data) {
    try {
        const data = JSON.parse(msg?.web_app_data?.data)
        bot.sendMessage(chatId, 'Спасибо за обратную связь!')
        bot.sendMessage(chatId, 'Ваша страна: ' + data?.country);
        bot.sendMessage(chatId, 'Ваша улица: ' + data?.street);
  
        setTimeout(async () => {
            await bot.sendMessage(chatId, 'Всю информацию вы получите в этом чате');
        }, 3000)
    } catch (e) {
        console.log(e);
    }
  }
});

app.post('/web-data', async (req, res) => {
  const {queryId, products = [], totalPrice} = req.body;
  console.log('start')
  try {
      await bot.answerWebAppQuery(queryId, {
          type: 'article',
          id: queryId,
          title: 'Успешная покупка',
          input_message_content: {
              message_text: ` Поздравляю с покупкой, вы приобрели товар на сумму ${totalPrice}, ${products.map(item => item.title).join(', ')}`
          }
      })
      return res.status(200).json({});
  } catch (e) {
      return res.status(500).json({})
  }
})

const start = async () => {
  try {
      app.listen(PORT, () => console.log(`Server started on PORT = ${PORT}`));
  } catch (e) {
      console.log(e);
  }
};

start();
