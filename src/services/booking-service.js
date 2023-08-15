const axios=require('axios')
const {ServerConfig}=require('../config')
const AppError=require('../utils/error/app-error')
const {StatusCodes}=require('http-status-codes')

const {BookingRepository}=require('../repositories')

const {Enums}=require('../utils/common')

const {BOOKED,CANCELLED}=Enums.BOOKING_STATUS;

const bookingRepository=new BookingRepository();

const db=require('../models')
const serverConfig = require('../config/server-config')

async function createBooking(data){
    const transaction=await db.sequelize.transaction();

    try {
        const flight=await axios(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}`);
        const flightData=flight.data.data;
        if(data.noOfSeat>flightData.totalSeats){
            throw new AppError('Not Enough Seats available',StatusCodes.BAD_REQUEST)
        }
        const totalBillingAmount=data.noOfSeat*flightData.price;
        const bookingPayload={...data,totalCost:totalBillingAmount};

        const booking=await bookingRepository.createBooking(bookingPayload,transaction);
        await axios.patch(`${serverConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}/seats`,{
            seats:data.noOfSeat,
        })
        await transaction.commit();
        return booking;

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}


async function makePayment(data){
    const transaction=await db.sequelize.transaction();

    try {
        const bookingDetails=await bookingRepository.get(data.bookingId,transaction);

        if(bookingDetails.status==CANCELLED){
            throw new AppError('Booking has already Cancelled',StatusCodes.BAD_REQUEST)
        }

        if(bookingDetails.status==BOOKED){
            throw new AppError('Booking has already Completed',StatusCodes.BAD_REQUEST)
        }

        const bookingDate=new Date(bookingDetails.createdAt);
        const currentTime=new Date();

        if(currentTime-bookingDate>300000){
            cancelBooking(data.bookingId);
            throw new AppError('Booking Time Limit has Expired',StatusCodes.BAD_REQUEST);
        }

        if(bookingDetails.totalCost!=data.totalCost){
            throw new AppError('Payment has failed',StatusCodes.BAD_REQUEST)
        }

        if(bookingDetails.userId!=data.userId){
            throw new AppError('User ID Doesn\'t Match',StatusCodes.BAD_REQUEST)
        }

        await bookingRepository.update(data.bookingId,{status:BOOKED},transaction);

        await transaction.commit();

        
    } catch (error) {
        await transaction.rollback();
        throw error;
        
    }
}


async function cancelBooking(bookingId){
    const transaction=await db.sequelize.transaction();

    try {
        const bookingDetails=await bookingRepository.get(bookingId,transaction);
        if(bookingDetails.status==CANCELLED){
            await transaction.commit();
            return true;
        }
        await axios.patch(`${serverConfig.FLIGHT_SERVICE}/api/v1/flights/${bookingDetails.flightId}/seats`,{
            seats:bookingDetails.noOfSeat,
            type:'inc'
        });
        await bookingRepository.update(bookingId,{status:CANCELLED},transaction);
        await transaction.commit();

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}

async function cancelOldBookings(){
    try {
        const time=new Date(Date.now() - 1000 * 300);
        const response= await bookingRepository.cancelOldBooking(time);
        return response;
    } catch (error) {
        throw error;
    }
    
}
module.exports={
    createBooking,
    makePayment,
    cancelOldBookings
}