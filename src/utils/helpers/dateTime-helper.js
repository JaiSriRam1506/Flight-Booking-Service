const dateTimeFun=function(arrTime,depTime){
let getDate1=new Date(arrTime);
let getDate2=new Date(depTime);
return getDate1.getTime()>getDate2.getTime();
}

module.exports={
    dateTimeFun,
}