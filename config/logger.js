var winston = require('winston');
require('winston-daily-rotate-file')
require('date-utils');
var moment = require('moment-timezone');


var logger = new (winston.Logger)({
    transports:[
        new winston.transports.Console({
            level:'info',
            colorize:false
        }),
        new winston.transports.DailyRotateFile({
            level:'debug',
            filename:'./Scheduler/spotEnv-log',
            maxsize:1024,
            datePattern:'yyyy-MM-ddTHH-mm.log',
            timestamp:function(){
                var date = moment().tz("Asia/Seoul").format();
                return date.toString();
            }
        })
    ]
});

module.exports = logger;