const { StatusCodes } = require('http-status-codes');
const { BookingService } = require('../services');
const { SuccessResponse, ErrorResponse } = require('../utils/common');

async function createBooking(req, res) {
    try {
        //console.log("body",req.body);
        const response = await BookingService.createBooking({
            flightId: req.body.flightId,
            userId: req.body.userId,
            noOfSeat: req.body.noOfSeat
        });
        SuccessResponse.data = response;
        return res
                .status(StatusCodes.OK)
                .json(SuccessResponse);
    } catch(error) {
        ErrorResponse.error = error;
        return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse);
    }
}


async function makePayment(req,res){
    try {
        const response=await BookingService.makePayment({
        bookingId:req.body.bookingId,
        userId:req.body.userId,
        totalCost:req.body.totalCost
        });
    
        SuccessResponse.data=response;
        return res
                  .status(StatusCodes.OK)
                  .json(SuccessResponse)
    } catch (error) {

        ErrorResponse.data=error
        return res
                  .status(StatusCodes.INTERNAL_SERVER_ERROR)
                  .json(ErrorResponse)
        
    }
}
module.exports = {

    createBooking,
    makePayment
}