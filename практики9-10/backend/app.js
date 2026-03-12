const express = require('express');
const { nanoid } = require("nanoid");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

const cors = require('cors');

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());


app.use((req, res, next) => {
    res.on('finish', () => {
        console.log(`[${new Date().toISOString()}] [${req.method}] ${res.statusCode} ${req.path}`);
        if (req.method === 'POST' || req.method === 'PUT' || req.method ==='PATCH') {
            console.log('Body:', req.body);
        }
    });
    next();
});

const ACCESS_SECRET = "access_secret";
const REFRESH_SECRET = "refresh_secret";

const ACCESS_EXPIRES_IN = "15m";
const REFRESH_EXPIRES_IN = "7d";

let users = [];
let products = [];

const refreshTokens = new Set();
function generateAccessToken(user) {
    return jwt.sign(
        {
            sub: user.id,
            email: user.email,  
            first_name: user.first_name,
            last_name: user.last_name
        },
        ACCESS_SECRET,
        {
            expiresIn: ACCESS_EXPIRES_IN,
        }
    );
}
function generateRefreshToken(user) {
    return jwt.sign(
        {
            sub: user.id,
            email: user.email,
        },
        REFRESH_SECRET,
        {
            expiresIn: REFRESH_EXPIRES_IN,
        }
    );
}

function authMiddleware(req, res, next) {
    const header = req.headers.authorization || "";

    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
        return res.status(401).json({
            error: "Отсутствует или неверный заголовок авторизации",
        });
    }
    try {
        const payload = jwt.verify(token, ACCESS_SECRET);
        req.user = payload; 
        next();
    } catch (err) {
        return res.status(401).json({
            error: "Недействительный или просроченный токен",
        });
    }
}

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API AUTH',
            version: '1.0.0',
            description: 'Простое API для изучения авторизации',
        },
        servers: [
            {
                url: `http://localhost:${port}`,
                description: 'Локальный сервер',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    apis: ['./app.js'],
};

function findUserOr404(email, res) {
    const user = users.find(u => u.email === email);
    if (!user) {
        res.status(404).json({ error: "Пользователь не найден!" });
        return null;
    }
    return user;
}

async function hashPassword(password) {
    const rounds = 10;
    return bcrypt.hash(password, rounds);
}

async function verifyPassword(password, passwordHash) {
    return bcrypt.compare(password, passwordHash);
}
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
* @swagger
* components:
*   schemas:
*     User:
*       type: object
*       required:
*         - email
*         - first_name
*         - last_name
*         - hashedPassword
*       properties:
*         id:
*           type: string
*           example: ab12cd
*         email:
*           type: string
*           format: email
*           example: sergeevnau18@gmail.com
*         first_name:
*           type: string
*           example: Lera
*         last_name:
*           type: string
*           example: Belskaya
*         hashedPassword:
*           type: string
*           description: Хешированный пароль
*           example: $2b$10$kO6Hq7ZKfV4cPzGm8u7mEuR7r4...
*     
*     Product:
*       type: object
*       required:
*         - name
*         - category
*         - description
*         - price
*       properties:
*         id:
*           type: string
*           example: ab12cd
*         name:
*           type: string
*           example: Стакан
*         category:
*           type: string
*           example: Посуда
*         description:
*           type: string
*           example: Материал стекло, объем 300мл
*         price:
*           type: integer
*           example: 1000
*/


/**
* @swagger
* /api/auth/me:    
*   get:
*     summary: Получить данные текущего пользователя
*     tags: [Auth]
*     security:
*       - bearerAuth: []
*     responses:
*       201:
*         description: данные пользователя
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/User'
*       401:
*         description: Пользователь не авторизован            
*/
app.get("/api/auth/me", authMiddleware, (req, res) => {
    const userId = req.user.sub;

    const user = users.find(u => u.id === userId);

    if (!user) {
        return res.status(404).json({
            error: "Пользователь не найден!",
        });
    }

    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    res.json({
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        accessToken: token
    });
});

/**
* @swagger
* /api/auth/register:    
*   post:
*     summary: Регистрация пользователя
*     description: Создает нового пользователя с хешированным паролем
*     tags: [Auth]
*     requestBody:
*       required: true
*       content:                
*         application/json:
*           schema:
*             type: object
*             required:
*               - email
*               - first_name
*               - last_name
*               - password
*             properties:
*               email:
*                 type: string
*                 example: sergeevnau18@gmail.com
*               first_name:
*                 type: string
*                 example: Lera
*               last_name:
*                 type: string
*                 example: Belskaya
*               password:
*                 type: string
*                 example: qwerty123
*     responses:
*       201:
*         description: Пользователь успешно создан
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/User'
*       400:
*         description: Некорректные данные            
*/

app.post("/api/auth/register", async (req, res) => {
    const { email, first_name, last_name, password } = req.body;

    if (!email || !first_name || !last_name || !password) {
        return res.status(400).json({ error: "E-mail, имя, фамилия и пароль обязательны!" });
    }

    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
        return res.status(400).json({ error: "Пользователь с таким e-mail уже существует!" });
    }

    const newUser = {
        id: nanoid(6),
        email: email,
        first_name: first_name,
        last_name: last_name,
        hashedPassword: await hashPassword(password)
    };

    users.push(newUser);

    res.status(201).json({
        id: newUser.id,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name
    });
});

/**
* @swagger
* /api/auth/login:       
*   post:
*     summary: Авторизация пользователя
*     description: Проверяет логин и пароль пользователя
*     tags: [Auth]
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             required:
*               - email 
*               - password
*             properties:
*               email:
*                 type: string
*                 example: sergeevnau18@gmail.com
*               password:
*                 type: string
*                 example: qwerty123
*     responses:
*       200:
*         description: Успешная авторизация
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 accessToken:
*                   type: string
*                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
*                 refreshToken:
*                   type: string
*                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
*       400:
*         description: Отсутствуют обязательные поля
*       401:
*         description: Неверные учетные данные
*       404:
*         description: Пользователь не найден
*/

app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "E-mail и пароль обязательны!" });
    }

    const user = findUserOr404(email, res);
    if (!user) return;

    const isAuthentethicated = await verifyPassword(password, user.hashedPassword);
    if (!isAuthentethicated) {
        return res.status(401).json({ error: "Неверный пароль!" })
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    refreshTokens.add(refreshToken);

    res.json({
        accessToken,
        refreshToken,
    });
});
/**
* @swagger
* /api/auth/refresh:       
*   post:
*     summary: Обновление токенов
*     tags: [Auth]
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             required:
*               - refreshToken 
*             properties:
*               refreshToken:
*                 type: string
*                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
*     responses:
*       200:
*         description: Успешное обновление
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 accessToken: 
*                   type: string
*                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
*                 refreshToken:
*                   type: string
*                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
*       400:
*         description: Токен обновления обязателен!
*       401:
*         description: Недействительный или просроченный токен обновления
*/
app.post("/api/auth/refresh", (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({
            error: "Токен обновления обязетелен!",
        });
    }

    if (!refreshTokens.has(refreshToken)) {
        return res.status(401).json({
            error: "Недействительный токен обновления",
        });
    }

    try {
        const payload = jwt.verify(refreshToken, REFRESH_SECRET);

        const user = users.find(u => u.id === payload.sub);
        if (!user) {
            return res.status(401).json({
                error: "Пользователь не найден",
            });
        }

        refreshTokens.delete(refreshToken);

        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

        refreshTokens.add(newRefreshToken);

        res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        });
    } catch (err) {
        return res.status(401).json({
            error: "Недействительный или просроченный токен обновления",
        });
    }
});

function findProductOr404(id, res) {
    const product = products.find(p => p.id == id);
    if (!product) {
        res.status(404).json({ error: "Товар не найден" });
        return null;
    }
    return product;
}
/**
* @swagger
* /api/products:      
*   post:
*     summary: Создает новый товар
*     tags: [Products]
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             required:
*               - name
*               - category
*               - description
*               - price
*             properties:
*               name:
*                 type: string
*                 example: Стакан
*               category:
*                 type: string
*                 example: Посуда
*               description:
*                 type: string
*                 example: Материал стекло, объем 300мл
*               price:
*                 type: integer
*                 example: 1000
*     responses:     
*       201:
*         description: Товар успешно создан
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/Product'
*       400:
*         description: Ошибка в теле запроса       
*/

app.post("/api/products", (req, res) => {
    const { name, category, description, price} = req.body;

    if (!name || !category || !description || price === undefined) {
        return res.status(400).json({ error: "Название, категория, описание и цена обязательны!" });
    }
    const newProduct = {
        id: nanoid(6),
        name: name.trim(),
        category: category.trim(), 
        description: description.trim(), 
        price: Number(price)
    };

    products.push(newProduct);
    res.status(201).json(newProduct);
});

/**
* @swagger
* /api/products:
*   get:
*     summary: Возвращает список всех товаров
*     tags: [Products]
*     responses:
*       200:
*         description: Список товаров
*         content:
*           application/json:
*             schema:
*               type: array
*               items:
*                 $ref: '#/components/schemas/Product'
*/

app.get("/api/products", (req, res) => {
    res.json(products);
});

/**
* @swagger
* /api/products/{id}:          
*   get:
*     summary: Получает товар по ID
*     tags: [Products]
*     security:
*       - bearerAuth: []
*     parameters:
*       - in: path
*         name: id
*         schema:
*           type: string
*         required: true
*         description: ID товара
*     responses:
*       200:
*         description: Данные товара
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/Product'
*       404:
*         description: Товар не найден       
*/

app.get("/api/products/:id", authMiddleware,(req, res) => {
    const id = req.params.id;

    const product = findProductOr404(id, res);
    if (!product) return;

    res.json(product);
});

/**
* @swagger
* /api/products/{id}:
*   put:
*     summary: Обновляет данные товара
*     tags: [Products]
*     security:
*       - bearerAuth: []
*     parameters:
*       - in: path
*         name: id
*         schema:
*           type: string
*         required: true
*         description: ID товара
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               name:
*                 type: string
*                 example: Подушка
*               category:
*                 type: string
*                 example: Текстиль
*               description:
*                 type: string
*                 example: Материал пух-перо
*               price:
*                 type: integer
*                 example: 2990
*     responses:
*       200:
*         description: Обновленный товар
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/Product'
*       400:
*         description: Нет данных для обновления
*       404:
*         description: Товар не найден
*/

app.put("/api/products/:id", authMiddleware,(req, res) => {
    const id = req.params.id;

    const product = findProductOr404(id, res);
    if (!product) return;


    if (req.body?.name === undefined && req.body?.category === undefined && req.body?.description === undefined && req.body?.price === undefined) {
        return res.status(400).json({
            error: "Нет данных для обновления",
        });
    }

    const { name, category, description, price } = req.body;

    if (name !== undefined) product.name = name.trim();
    if (category !== undefined) product.category = category.trim();
    if (description !== undefined) product.description = description.trim();
    if (price !== undefined) product.price = Number(price);

    res.json(product);
});

/**
* @swagger
* /api/products/{id}:
*   delete:
*     summary: Удаляет товар
*     tags: [Products]
*     security:
*       - bearerAuth: []
*     parameters:
*       - in: path
*         name: id
*         schema:
*           type: string
*         required: true
*         description: ID товара
*     responses:
*       204:
*         description: Товар успешно удален (нет тела ответа)
*       404:
*         description: Товар не найден
*/

app.delete("/api/products/:id", authMiddleware, (req, res) => {
    const id = req.params.id;

    const exists = products.some((p) => p.id === id);
    if (!exists) return res.status(404).json({ error: "Товар не найден!" });

    products = products.filter((p) => p.id !== id);

    res.status(204).send();
});
    
app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
    console.log(`Swagger UI доступен по адресу http://localhost:${port}/api-docs`);
});