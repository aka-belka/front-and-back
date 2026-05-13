import amqplib from 'amqplib';

const MAX_RETRIES = 3;
const WORKER_ID = process.env.WORKER_ID || Math.floor(Math.random() * 1000);
const RETRY_DELAYS = {
    1: 2000,
    2: 4000,
    3: 8000,
};

function getRetryQueueName(attemptNumber) {
    const delay = RETRY_DELAYS[attemptNumber];
    return `retry_queue_${delay}ms`;
}

async function processTask(task) {
    console.log(`[Worker ${WORKER_ID}] Обработка задачи ${task.id} (тип: ${task.type})`);

    await new Promise(resolve => setTimeout(resolve, 500));

    if (Math.random() < 0.3) {
        throw new Error('Случайная ошибка');
    }

    console.log(`[Worker ${WORKER_ID}] Задача ${task.id} выполнена`);
}

async function startWorker() {
    const connection = await amqplib.connect('amqp://localhost');
    const channel = await connection.createChannel();
    
    channel.prefetch(1);

    console.log(`[Worker ${WORKER_ID}] Ожидание задач...`);

    channel.consume('task_queue', async (msg) => {
        if (!msg) return;

        const task = JSON.parse(msg.content.toString());
        const retryCount = msg.properties.headers?.['x-retry-count'] || 0;

        console.log(`[Worker ${WORKER_ID}] Получена задача ${task.id}, попытка ${retryCount + 1}/${MAX_RETRIES}`);

        try {
            await processTask(task);
            channel.ack(msg);
            
        } catch (err) {
            console.error(`[Worker ${WORKER_ID}] Ошибка: ${err.message}`);
            
            const newRetryCount = retryCount + 1;
            
            if (newRetryCount < MAX_RETRIES) {
                const retryQueueName = getRetryQueueName(newRetryCount);
                const delayMs = RETRY_DELAYS[newRetryCount];
                
                console.log(`[Worker ${WORKER_ID}] Повторная попытка ${newRetryCount + 1}/${MAX_RETRIES} через ${delayMs}мс (очередь: ${retryQueueName})`);
                
                channel.sendToQueue(
                    retryQueueName,
                    msg.content,
                    {
                        persistent: true,
                        headers: { 'x-retry-count': newRetryCount }
                    }
                );
                
                channel.ack(msg);
                
            } else {
                console.error(`[Worker ${WORKER_ID}] Исчерпаны все ${MAX_RETRIES} попытки, сообщение уходит в DLQ`);
                channel.nack(msg, false, false);
            }
        }
    });
}

startWorker().catch(console.error);