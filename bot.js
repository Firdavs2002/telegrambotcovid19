const fs = require('fs');
require('dotenv').config();
const { Telegraf } = require('telegraf');
// eslint-disable-next-line import/no-unresolved
const Markup = require('telegraf/markup');
const apiCovid = require('covid19-api');
const COUNTERIES_LIST = require('./constants');

let id = 0;

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.start((ctx) =>
  ctx.reply(
    `Привет ${ctx.from.first_name}`,
    Markup.keyboard([
      ['US', 'Russia'],
      ['Tajikistan', 'Uzbekistan'],
    ])
      .resize()
      .extra()
  )
);
bot.help((ctx) => ctx.reply(COUNTERIES_LIST));
bot.on('text', async (ctx) => {
  const { text } = ctx.message;
  try {
    const data = await apiCovid.getReportsByCountries(text.toUpperCase());
    const formatData = `
    Страна: ${data[0][0].country}
Случаи: ${data[0][0].cases}
Смертей: ${data[0][0].deaths}
Вылечились: ${data[0][0].recovered}
    `;
    ctx.reply(formatData);
  } catch (e) {
    ctx.reply(`Сорри, мне не удолось обработать запрос "${text}"`).then(() => {
      // eslint-disable-next-line no-plusplus
      const errLog = `${++id} | ${text} | ${new Date()}\n`;
      fs.appendFile('err.log', errLog, (err) => {
        if (err) console.log(`Oops! we have a problem:\n${err}`);
        console.log('err.log updated!');
      });
    });
  }
});
bot.launch();
