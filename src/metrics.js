var CloudWatchAlarm = require('./lib/cw-alarm.js');
var async = require('async');
var sleep = require('sleep');


exports.handler = function(event, context){

  console.log('Received event:', JSON.stringify(event, null, 2));
  // Event stops triggering within a few minutes without a delay
  sleep.sleep(1);


  var message = JSON.parse(event.Records[0].Sns.Message);
  var cw = new CloudWatchAlarm(message);

  //Reset alarm state to OK
  cw.resetAlarm(function(err, data){
    if(err){
      console.log("Error setting alarm state", err, err.stack);
    }else{
      console.log("Successfully set alarm state");
      setMetrics(cw, event, context);
    }
  });
}

function setMetrics(cw, event, context){
  async.parallel({
    errors: function(callback){ cw.getMetrics('Errors', callback) },
    invocations: function(callback){ cw.getMetrics('Invocations', callback) }
    },
    function(err, results){
      if(err){
        console.log("ERROR fetching metrics", err, err.stack);
        context.fail("Unable to retrieve metrics");
      }else{
        var errors = results.errors;
        var invocations = results.invocations;
        console.log("Metrics retrieved");
        console.log("Errors: ",errors," Invocations: ",invocations);
        if(invocations != 0){
          var percentFailure = (errors / invocations) * 100
          console.log("Percent failure: ", percentFailure);
          cw.putCustomMetrics(percentFailure, function(err, data){
            if(err){
              console.log("ERROR - unable to post custom metric", err, err.stack);
              context.fail("Unable to post custom metric");
            }else{
              console.log("Successfully posted custom metric");
              console.log(data);
              context.succeed("Successfully posted custom metric");
            }
          });
        }else{
          console.log("Warning - no invocations found");
          context.succeed("No invocations to process");
        }
      }
    });
}
