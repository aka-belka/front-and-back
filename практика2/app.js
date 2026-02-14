const express = require('express');
const app = express();
const port = 3000;

let goods = [
    {id: 1, name: 'Печенье', price: 130},
    {id: 2, name: 'Молоко', price: 89},
    {id: 3, name: 'Хлеб', price: 50},
]

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Главная страница');
});

app.post('/goods', (req, res) => {
    const { name, price } = req.body;
        const newGoods = {
        id: Date.now(),
        name,
        price
    };

    goods.push(newGoods);
    res.status(201).json(newGoods);
});

app.get('/goods', (req, res) => {
    res.send(JSON.stringify(goods));
});

app.get('/goods/:id', (req, res) => {
    let goods1 = goods.find(g => g.id == req.params.id);
    res.send(JSON.stringify(goods1));
});

app.patch('/goods/:id', (req, res) => {
    const goods1  = goods.find(g => g.id == req.params.id);
    const { name, price } = req.body;
    if (name !== undefined) goods1.name = name;
    if (price !== undefined) goods1.price = price;
    res.json(goods1);
});

app.delete('/goods/:id', (req, res) => {
    goods = goods.filter(g => g.id != req.params.id);
    res.send('Ok');
});

app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});