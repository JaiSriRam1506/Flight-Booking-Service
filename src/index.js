const express = require('express');
const { ServerConfig } = require('./config');
const apiRoutes = require('./routes');
const CRONS=require('./utils/common/cron-jobs')
const {RabbitMQ}=require('./config')

const app = express();

//This is used to get JSON or URLEncoded body from Request for all type of req
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use('/api', apiRoutes);

app.listen(ServerConfig.PORT, async() => {
    console.log(`Successfully started the server on PORT : ${ServerConfig.PORT}`);
    await RabbitMQ.connectToRabbitMQ();
    //CRONS();
    console.log("Queue is Up")
});
