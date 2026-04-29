const mongoose = require('mongoose');
const express = require('express');
const app = express();

mongoose.connect('mongodb://ValeraMongoAdmin:1love_you))@localhost:27017/admin')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Connection error:', err));

app.use(express.json());

const userSchema = new mongoose.Schema({
    id: { type: Number, unique: true},
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    age: { type: Number, required: true, min: 0 },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
}, {  
    versionKey: false ,
    toJSON: {
        transform: (doc, ret) => {
            delete ret._id;
            return ret;
        }
    }});

userSchema.pre('save', async function() {
    if (this.isNew && !this.id) {
        const lastUser = await mongoose.model('User').findOne().sort('-id');
        const newId = lastUser ? lastUser.id + 1 : 1;
        this.id = newId;
        this._id = newId; 
    }
});

userSchema.pre('findOneAndUpdate', function() {
    this.set({ updated_at: Date.now() });
});
const User = mongoose.model('User', userSchema);

app.post('/api/users', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).send(user);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find();
        res.send(users);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.get('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findOne({ id: parseInt(req.params.id) });
        if (!user) return res.status(404).send('User not found');
        res.send(user);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

app.patch('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findOneAndUpdate(
            { id: parseInt(req.params.id) },
            req.body,
            { new: true } 
        );
        if (!user) return res.status(404).send('User not found');
        res.send(user);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

app.delete('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findOneAndDelete({ id: parseInt(req.params.id) });
        if (!user) return res.status(404).send('User not found');
        res.send(user);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});