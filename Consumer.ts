const amqp = require('amqplib');
const axios = require('axios');

async function recibirEvento() {
    const connection = await amqp.connect('amqp://Kato:kato@34.231.168.155');
    const channel = await connection.createChannel();

    const exchange = 'colaKato'; 

    await channel.assertExchange(exchange, 'direct', { durable: true });

    const queueName = 'kato'; 
    const queue = await channel.assertQueue(queueName, { exclusive: false });
    await channel.bindQueue(queue.queue, exchange, 'kato');

    console.log('Escuchando eventos de RabbitMQ');

    channel.consume(queue.queue, async(mensaje: { content: any; } | null) => {
        if (mensaje !== null) {
            console.log(`Mensaje recibido de RabbitMQ: ${mensaje.content}`);
            
          
            const id = mensaje.content
            try {
                const id = Number(mensaje.content)
                const response = await axios.post('https://katoapi2.onrender.com/mensaje', {
                   id
                });
                console.log("Respuesta de API externa:",response.data);
            } catch (error) {
                console.error("Error al enviar el mensaje a la API externa:", error);
            }
        }
    }, { noAck: true });
}

recibirEvento().catch(console.error);