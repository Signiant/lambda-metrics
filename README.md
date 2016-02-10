# lambda-metrics
An AWS Lambda function written in node.js that creates custom metrics for other Lambda functions indicating the failure rate as a percent.   

This function is used to create the metrics required by the [lambda-promotion](https://github.com/Signiant/lambda-promotion) tool for monitoring.

## Setup

### Function Setup
First, create a new SNS topic.  This topic will be sent notifications from any lambda functions you wish to monitor, and will invoke the metric calculating function.
Once you have created the topic, create a new function.  This project is structured to be deployed with the lambda-promotion tool.    

If deploying with the tool, be sure to modify the SNS topic in the function configuration (deploy/environments/prod.lam.json) to point to the one you just created.  

  If deploying manually
  - create a new role using the policy found in deploy/policy.lam.JSON
  - create a new lambda function using the new role, and configuration values specified in deploy/environments/prod.lam.json
  - subscribe the new function to the SNS topic you created

### Monitoring a Function

If using the lambda promotion tool to deploy the function you wish to monitor, running the lambda-monitor.sh script will set up function monitoring automatically.

If deploying manually  
- Create an alarm to monitor the function's Error metric.  This alarm should be set to trigger whenever the metric's sum is >= 1 for 1 period of 1 minute.  Set this alarm to notify the SNS topic when the state changes to ALARM
- Create a new SNS topic
- Set up subscriptions your notification endpoints
- Create another alarm.  This alarm should be set to monitor the function's PercentFailure metric.  Set this alarm to trigger whenever the maximum is greater than or equal to the desired threshold (between 1 and 100), and have it notify the newly created SNS topic.
