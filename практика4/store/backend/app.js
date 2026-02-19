const express = require('express');
const { nanoid } = require('nanoid');
const app = express();

const port = 3000;
const cors = require("cors");

let products = [
    {id: nanoid(6), name: 'Стакан', category: 'Посуда', description: 'Модель ОФИСМАГ 250 мл, стекло, F&D Бэйзик, производство Россия', price: 97, quantity: 200},
    {id: nanoid(6), name: 'Супница', category: 'Посуда', description: 'Модель LUMINARC ДИВАЛИ 560 мл, материал опаловое стекло, производство Китай', price: 309, quantity: 10},
    {id: nanoid(6), name: 'Торшер', category: 'Интерьер', description: 'Модель Uniel светодиодный ulm-t600 2x6w/4500k/dim white, производство Россия', price: 5746, quantity: 136},
    {id: nanoid(6), name: 'Картина', category: 'Интерьер', description: 'Цветущая сакура на бежевом фоне, размер 96x60 см, производство Россия', price: 3432, quantity: 12},
    {id: nanoid(6), name: 'Подушка', category: 'Текстиль', description: 'Гипоаллергенная подушка Самойловский Текстиль, размер 50x70 см, цвет белый, производство Россия', price: 494, quantity: 48},
    {id: nanoid(6), name: 'Шторы', category: 'Текстиль', description: 'Модель "Волшебная Ночь", материал рогожка, размеры 200/270 см, с подхватами, производство Россия', price: 4709, quantity: 84},
    {id: nanoid(6), name: 'Диван', category: 'Мебель', description: 'Цвет темно-серый двуспальный раскладной, материал каркакса дерево', price: 16411, quantity: 7},
    {id: nanoid(6), name: 'Стул', category: 'Мебель', description: 'Модель ТК-1 (черный), каркас металлический, обивка рогожка, производство Россия', price: 1780, quantity: 115},
    {id: nanoid(6), name: 'Микроволновка', category: 'Бытовая техника', description: 'Модель OASIS MW-70MW, мощность 700 Вт, производство Китай', price: 4990, quantity: 118},
    {id: nanoid(6), name: 'Пылесос', category: 'Бытовая техника', description: 'Модель Karcher WD 3 P S V-17/4/20 1.628-190.0, мощность 1000 Вт, производство Германия', price: 18790, quantity: 110},
    {id: nanoid(6), name: 'Утюг', category: 'Бытовая техника', description: 'Модель Braun SI7149WB 0127403108, мощность 2900 Вт, производство Китай', price: 8990, quantity: 36}
]

app.use(cors({
    origin: "http://localhost:3001",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

app.use((req, res, next) => {
    res.on('finish', () => {
        console.log(`[${new Date().toISOString()}] [${req.method}] ${res.statusCode} ${req.path}`);
        if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
            console.log('Body:', req.body);
        }
    });
    next();
});

function findUserOr404(id, res) {
    const product = products.find(p => p.id == id);
    if (!product) {
        res.status(404).json({ error: "Product not found" });
        return null;
    }
    return product;
}

app.post("/api/products", (req, res) => {
    const { name, category, description, price, quantity} = req.body;

    const newProduct = {
        id: nanoid(6),
        name: name.trim(),
        category: category.trim(), 
        description: description.trim(), 
        price: Number(price), 
        quantity: Number(quantity)
    };

    products.push(newProduct);
    res.status(201).json(newProduct);
});


app.get("/api/products", (req, res) => {
    res.json(products);
});

app.get("/api/products/:id", (req, res) => {
    const id = req.params.id;

    const product = findUserOr404(id, res);
    if (!product) return;

    res.json(product);
});


app.patch("/api/products/:id", (req, res) => {
    const id = req.params.id;

    const product = findUserOr404(id, res);
    if (!product) return;


    if (req.body?.name === undefined && req.body?.category === undefined && req.body?.description === undefined && req.body?.price === undefined && req.body?.quantity === undefined) {
        return res.status(400).json({
            error: "Nothing to update",
        });
    }

    const { name, category, description, price, quantity} = req.body;

    if (name !== undefined) product.name = name.trim();
    if (category !== undefined) product.category = category.trim();
    if (description !== undefined) product.description = description.trim();
    if (price !== undefined) product.price = Number(price);
    if (quantity !== undefined) product.quantity = Number(quantity);

    res.json(product);
});


app.delete("/api/products/:id", (req, res) => {
    const id = req.params.id;

    const exists = products.some((p) => p.id === id);
    if (!exists) return res.status(404).json({ error: "Products not found" });

    products = products.filter((p) => p.id !== id);

    res.status(204).send();
});


app.use((req, res) => {
    res.status(404).json({ error: "Not found" });
});


app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});