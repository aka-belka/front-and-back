import express from 'express';
import amqplib from 'amqplib';

const app = express();
app.use(express.json());

app.post('/tasks', async (req, res) => {
    const { type, payload } = req.body;

    if (!type || !payload) {
        return res.status(400).json({ error: 'type и payload обязательны' });
    }

    const task = {
        id: Date.now(),
        type,
        payload,
        createdAt: new Date().toISOString(),
    };

    try {
        const connection = await amqplib.connect('amqp://localhost');
        const channel = await connection.createChannel();

        const exchangeName = 'tasks_exchange';
        await channel.assertExchange(exchangeName, 'direct', { durable: true });

        channel.publish(
            exchangeName,
            'task',                
            Buffer.from(JSON.stringify(task)),
            { persistent: true }
        );

        console.log(`Задача ${task.id} отправлена в exchange '${exchangeName}'`);
        await channel.close();
        await connection.close();

        res.status(201).json({ message: 'Задача отправлена', taskId: task.id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Producer: http://localhost:${PORT}`));