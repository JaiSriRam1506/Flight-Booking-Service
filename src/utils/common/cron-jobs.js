const cron=require('node-cron');

const {BookingService}=require('../../services')

function scheduleCron(){
    cron.schedule('5 * * * * *',async ()=>{
    console.log('Started Cron Jobs')
    await BookingService.cancelOldBookings();
    });
}
module.exports=scheduleCron;