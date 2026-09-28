const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const BASE = '/tmp/data';
if (!fs.existsSync(BASE)) fs.mkdirSync(BASE, { recursive: true });

const load = (name, def) => {
  const f = path.join(BASE, name + '.json');
  if (!fs.existsSync(f)) {
    fs.writeFileSync(f, JSON.stringify(def));
    return def;
  }
  try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return def; }
};
const save = (name, data) => {
  fs.writeFileSync(path.join(BASE, name + '.json'), JSON.stringify(data, null, 2));
};

const DEFAULT_GAMES = [
  {id:"ff",name:"Free Fire",image:"https://cdn-icons-png.flaticon.com/512/686/686589.png",cats:["Top Up","Level Up"]},
  {id:"ml",name:"Mobile Legends",image:"https://cdn-icons-png.flaticon.com/512/2972/2972185.png",cats:["Diamonds"]},
  {id:"pubg",name:"PUBG Mobile",image:"https://cdn-icons-png.flaticon.com/512/1019/1019084.png",cats:["UC"]}
];
const DEFAULT_TARIFS = [{id:1,gameId:"ff",cat:"Top Up",name:"100 Diamonds",price:4500,image:"https://cdn-icons-png.flaticon.com/512/1029/1029183.png",tag:"HOT"}];
const DEFAULT_SETTINGS = {mvola_num:"034 16 155 30",mvola_name:"Thierry",mvola_ussd:"*120*0341615530#",orange_num:"032 25 591 21",orange_name:"Thierry",orange_ussd:"#144*0322559121#"};

app.get('/api', (req, res) => {
  const action = req.query.action;
  if (action === 'getAll') {
    return res.json({
      games: load('games', DEFAULT_GAMES),
      tarifs: load('tarifs', DEFAULT_TARIFS),
      orders: load('orders', []),
      settings: load('settings', DEFAULT_SETTINGS)
    });
  }
  res.json({ ok: true });
});

app.post('/api', (req, res) => {
  const { action, data, id, status } = req.body;
  if (action === 'saveGames') save('games', data);
  if (action === 'saveTarifs') save('tarifs', data);
  if (action === 'saveSettings') save('settings', data);
  if (action === 'newOrder') {
    const orders = load('orders', []);
    data.id = Date.now().toString();
    orders.unshift(data);
    save('orders', orders);
  }
  if (action === 'updateOrder') {
    let orders = load('orders', []);
    orders = orders.map(o => o.id === id ? {...o, status} : o);
    save('orders', orders);
  }
  if (action === 'deleteOrder') {
    let orders = load('orders', []);
    orders = orders.filter(o => o.id !== id);
    save('orders', orders);
  }
  res.json({ ok: true });
});

module.exports = app;
