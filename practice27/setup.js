import amqplib from 'amqplib';

async function setupQueues() {
    const connection = await amqplib.connect('amqp://localhost');
    const channel = await connection.createChannel();

    await channel.assertExchange('tasks_exchange', 'direct', { durable: true });
    await channel.assertExchange('dlx_exchange', 'direct', { durable: true });
    await channel.assertQueue('dead_letter_queue', { durable: true });
    await channel.bindQueue('dead_letter_queue', 'dlx_exchange', 'dead');

    const retryDelays = [2000, 4000, 8000]; 
    
    for (let i = 0; i < retryDelays.length; i++) {
        const delay = retryDelays[i];
        const retryQueueName = `retry_queue_${delay}ms`;
        
        await channel.assertQueue(retryQueueName, {
            durable: true,
            arguments: {
                'x-dead-letter-exchange': 'tasks_exchange',
                'x-dead-letter-routing-key': 'task',
                'x-message-ttl': delay,
            },
        });
    }

    await channel.assertQueue('task_queue', {
        durable: true,
        arguments: {
            'x-dead-letter-exchange': 'dlx_exchange',
            'x-dead-letter-routing-key': 'dead',
        },
    });
    await channel.bindQueue('task_queue', 'tasks_exchange', 'task');

    console.log('Очередь настроена!');
    await connection.close();
}

setupQueues().catch(console.error);