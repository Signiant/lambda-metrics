var AWS = require('aws-sdk');
AWS.config.region = 'us-east-1'//remove pre-deploy
var cw = new AWS.CloudWatch({apiVersion: '2010-08-01'});
var moment = require('moment');
var _ = require('lodash');


function CloudWatchAlarm(message){
  this.alarm = message;
  this.functionName = this.alarm.Trigger.Dimensions[0].value;
  this.resourceName = this.alarm.Trigger.Dimensions[1].value;
  this.endTime = moment(this.alarm.StateChangeTime).unix();
  this.startTime = moment(this.alarm.StateChangeTime).subtract(5, 'minutes').unix()

  this.stateParams = {
    AlarmName: this.alarm.AlarmName,
    StateValue: this.alarm.OldStateValue,
    StateReason: 'State reset'
  }

  this.metricParams = {
    EndTime: this.endTime,
    Namespace: 'AWS/Lambda',
    Period: 60,
    StartTime: this.startTime,
    Statistics: [ 'Sum' ],
    Dimensions: [
      {
        Name: 'FunctionName',
        Value: this.functionName
      },
      {
        Name: 'Resource',
        Value: this.resourceName
      }
    ]
  }

  this.customMetric = {
    MetricData: [
      {
        MetricName: 'PercentFailure',
        Dimensions: [
          {
            Name: 'FunctionName',
            Value: this.functionName
          },
          {
            Name: 'Resource',
            Value: this.resourceName
          }
        ],
        Timestamp: moment(this.alarm.startTime).unix(),
        Unit: 'Percent'
      },
    ],
    Namespace: 'Lambda'
  }

}

CloudWatchAlarm.prototype.resetAlarm = function(callback){
  cw.setAlarmState(this.stateParams, callback);
}

CloudWatchAlarm.prototype.getMetrics = function(metricName, callback){
  this.metricParams.MetricName = metricName;
  cw.getMetricStatistics(this.metricParams, function(err, data){
    console.log(data);
      if(!err){
        data = _.sum(_.map(data.Datapoints, 'Sum'))
      }
      callback(err, data)
  });
}

CloudWatchAlarm.prototype.putCustomMetrics = function(metric, callback){
  this.customMetric.MetricData[0].Value = metric;
  cw.putMetricData(this.customMetric, callback);
}


module.exports = CloudWatchAlarm;
