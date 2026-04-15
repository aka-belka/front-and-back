const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
app.use(express.json());

const sequelize = new Sequelize('fbr', 'postgres', '1Love_you))', {
    host: 'localhost',
    dialect: 'postgres',
});

sequelize.authenticate()
    .then(() => console.log('Connected to PostgreSQL'))
    .catch(err => console.error('Connection error:', err));

const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    first_name: { type: DataTypes.STRING, allowNull: false },
    last_name: { type: DataTypes.STRING, allowNull: false },
    age: { type: DataTypes.INTEGER, allowNull: false }
}, {
    tableName: 'users',       
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'   
});

sequelize.sync({ alter: true }); 

app.post('/api/users', async (req, res) => {
    try {
        const user = await User.create(req.body);
        res.status(201).send(user);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

app.get('/api/users', async (req, res) => {
    try {
        const users = await User.findAll();
        res.send(users);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.get('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }
        res.send(user);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.patch('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }
        await user.update(req.body);
        res.send(user);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

app.delete('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }
        await user.destroy();
        res.send({ message: 'User deleted' });
    } catch (err) {
        res.status(500).send(err.message);
    }
});


app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});