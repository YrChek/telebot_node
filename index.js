const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
const cors = require('cors');
const express = require('express');
const { dataCheck, validationKey } = require('./validatingData')

const TOKEN = process.env.TOKEN
const webAppUrl = process.env.URL
const bot = new TelegramBot(TOKEN, {polling: true});
const app = express();

app.use(express.json())
app.use(cors());

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  const name = msg.from.first_name

  if (text === '/start') {
    await bot.sendMessage(chatId, 'Ниже появится кнопка, заполни форму', {
      reply_markup: {
        keyboard: [
          [
            { text: 'Заполнить форму', web_app: {url: webAppUrl + '/form'} }
          ]
        ],
        resize_keyboard: true
      }
    })
    await bot.sendMessage(chatId, 'Заходи на наш сайт', {
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'сделать заказ', web_app: {url: webAppUrl}  }
          ]
        ],
        resize_keyboard: true
      }
    })
  }

  if(msg?.web_app_data?.data) {
    try {
      const data = JSON.parse(msg?.web_app_data?.data)

      await bot.sendMessage(chatId, 'Спасибо за обратную связ!')
      await bot.sendMessage(chatId, 'Ваша страна: ' + data?.country)
      await bot.sendMessage(chatId, 'Ваша улица: ' + data?.street)
      await bot.sendMessage(chatId, 'Ваше имя: ' + name)

      setTimeout(async () => {
        await bot.sendMessage(chatId, 'Всю информацию вы получите в этом чате')
      }, 1000)

    } catch (e) {
        console.log(e) 
    }
  }
});

app.post('/web-data', async (req, res) => {
  const { initData, products = [], totalPrice} = req.body;

  if (!initData) {
    return res.status(406).json({})
  }
  // const searchParams = new URLSearchParams(initData);
  // const queryId = searchParams.get('query_id');

  const appData = dataCheck(initData);
  if (!appData) return res.status(406).json({})

  const validator = validationKey(TOKEN, appData.data_check_string, appData.hash)
  if (!validator) return res.status(401).json({})

  try {
    await bot.answerWebAppQuery(appData.query_id, {
      type: 'article',
      id: appData.query_id,
      title: 'Успешная покупка',
      input_message_content: {
        message_text: 
        `Поздравляю с покупкой!\nВы преобрели товар на сумму: ${totalPrice} руб.\nВаши товары:\n${products.map(item => item.title).join('\n')}`
      }
    })
    return res.status(200).json({})
  } catch (error) {
      return res.status(500).json({})
    }
})

app.use('/', (_, res) => {
  res.sendFile(__dirname + "/welcomePage.html");
})

const PORT = 8000;

app.listen(PORT, () => console.log('server started on PORT ' + PORT))
