const amqplib=require('amqplib')
const {MESSAGE_QUEUE}=require('./server-config')

let channel;
async function connectToRabbitMQ(){
try {
   const conn=await amqplib.connect("amqp://localhost");
   channel=await conn.createChannel();
   await channel.assertQueue(MESSAGE_QUEUE)
} catch (error) {
    throw error;
}
}

async function addMessageRB(data){
    try {
        await channel.sendToQueue(MESSAGE_QUEUE,Buffer.from(JSON.stringify(data)));
    } catch (error) {
        console.log("Queue Error",error)
        throw error;
    }

}
module.exports={
    connectToRabbitMQ,
    addMessageRB
}