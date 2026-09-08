const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const PERSSHOP_API_KEY = process.env.PERSSHOP_API_KEY;
const API_URL = 'https://api.persshop.com/v1';

export default async function handler(req, res) {
  if (req.method!== 'POST') return res.status(200).send('ok');
  const update = req.body;
  const message = update.message;
  if (!message ||!message.text) return res.status(200).send('ok');

  const chatId = message.chat.id;
  const text = message.text;

  if (text === '/start') {
    await sendMessage(chatId, `Салом! 👋\nИн боти расмии PersShop аст.\n\nФармонҳо:\n/catalog - Каталог\n/balance - Баланс\n/buy ID сумма - Харидан\nМисол: /buy 1234 1000`);
  } 
  
  else if (text === '/catalog') {
    await sendMessage(chatId, `Каталогро мегирам... ⏳`);
    const products = await getCatalog();
    if(!products.length) return sendMessage(chatId, `Каталог холӣ аст ё API Key нодуруст аст.`);
    
    let msg = `📦 *КАТАЛОГ PersShop*\n\n`;
    products.slice(0, 15).forEach(p => { 
      msg += `*${p.id}*. ${p.name}\n Нарх: ${p.your_price} руб | Розница: ${p.retail_price} руб\n`;
    });
    msg += `Барои харидан: /buy ID сумма`;
    await sendMessage(chatId, msg);
  }

  else if (text.startsWith('/buy')) {
    const parts = text.split(' ');
    const productId = parts[1];
    const amount = parts[2];
    if (!productId ||!amount) return sendMessage(chatId, `Хатогӣ. Дуруст: /buy 1234 1000`);
    
    await sendMessage(chatId, `Заказ фиристода мешавад... ⏳`);
    const order = await createOrder(productId, amount, chatId);
    
    if(order.success) {
      await sendMessage(chatId, `✅ Заказ қабул шуд!\nID: ${order.id}\nСтатус: ${order.status}\nДар давоми 5 дақиқа донат меояд.`);
    } else {
      await sendMessage(chatId, `❌ Хатогӣ: ${order.message || order.error}`);
    }
  }

  else if (text === '/balance') {
    const balance = await getBalance();
    await sendMessage(chatId, `💰 Баланси ту дар PersShop: ${balance} руб`);
  }

  else {
    await sendMessage(chatId, `Фармонро нафаҳмидам. /start -ро пахш кун`);
  }
  
  return res.status(200).send('ok');
}

async function apiRequest(endpoint, data = {}) {
  const res = await fetch(`${API_URL}/${endpoint}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${PERSSHOP_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

async function getCatalog() { return (await apiRequest('catalog')).data || []; }
async function getBalance() { return (await apiRequest('user/balance')).data?.balance || 0; }
async function createOrder(product_id, amount, user_id) { 
  return await apiRequest('order/create', { product_id, amount, custom_id: user_id }); 
}

async function sendMessage(chatId, text) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' })
  });
}
