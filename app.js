/*jshint node:true*/

// app.js
// This file contains the server side JavaScript code for your application.
// This sample application uses express as web application framework (http://expressjs.com/),
// and jade as template engine (http://jade-lang.com/).

var express = require('express');
var https = require('https');
var url = require('url');
var util = require('util');

// setup middleware
var app = express();
app.use(express.errorHandler());
app.use(express.urlencoded()); // to support URL-encoded bodies
app.use(app.router);

app.use(express.static(__dirname + '/public')); //setup static public directory
app.set('view engine', 'jade');
app.set('views', __dirname + '/views'); //optional since express defaults to CWD/views

// There are many useful environment variables available in process.env.
// VCAP_APPLICATION contains useful information about a deployed application.
var appInfo = JSON.parse(process.env.VCAP_APPLICATION || "{}");
// TODO: Get application information and use it in your app.

// defaults for dev outside bluemix
var service_url = 'https://gateway.watsonplatform.net/qagw/service';
var service_username = '7b0710cb-8c80-433a-b780-d1042ba8abfc';
var service_password = 'Z7BPYJwDoBdV';
var answers, feedback;

// VCAP_SERVICES contains all the credentials of services bound to
// this application. For details of its content, please refer to
// the document or sample of each service.
if (process.env.VCAP_SERVICES) {
  console.log('Parsing VCAP_SERVICES');
  var services = JSON.parse(process.env.VCAP_SERVICES);
  //service name, check the VCAP_SERVICES in bluemix to get the name of the services you have
  var service_name = 'question_and_answer';
  
  if (services[service_name]) {
    var svc = services[service_name][0].credentials;
    service_url = svc.url;
    service_username = svc.username;
    service_password = svc.password;
  } else {
    console.log('The service '+service_name+' is not in the VCAP_SERVICES, did you forget to bind it?');
  }

} else {
  console.log('No VCAP_SERVICES found in ENV, using defaults for local development');
}

console.log('service_url = ' + service_url);
console.log('service_username = ' + service_username);
console.log('service_password = ' + new Array(service_password.length).join("X"));

var auth = "Basic " + new Buffer(service_username + ":" + service_password).toString("base64");

// render index page
app.get('/', function(req, res){
    res.render('index');
});

// Handle the form POST containing the question to ask Watson and reply with the answer
app.post('/', function(req, res){
  
  // Set the service endpoint (healthcare or travel)
  //var parts = url.parse(service_url +'/v1/question/healthcare');
  //var parts = url.parse(service_url +'/v1/question/travel');
  console.log("INF", "Requested service = " + req.body.ServiceGroup);
  var parts = url.parse(service_url +'/v1/question/' + req.body.ServiceGroup);
  
  // create the request options to POST our question to Watson
  var options = { host: parts.hostname,
    port: parts.port,
    path: parts.pathname,
    method: 'POST',
    headers: {
      'Content-Type'  :'application/json',
      'Accept':'application/json',
      'X-synctimeout' : '30',
      'Authorization' :  auth }
  };

  // Create a request to POST to Watson
  var watson_req = https.request(options, function(result) {
    result.setEncoding('utf-8');
    var response_string = '';

    result.on('data', function(chunk) {
      response_string += chunk;
    });
    
    result.on('end', function() {
      var answers_pipeline = JSON.parse(response_string);
      answers = answers_pipeline[0];
      console.log("[INF]", "Watson answers = " + util.inspect(answers_pipeline[0]));
      console.log("[INF]", "Answers: " + util.inspect(answers.question.answers));
      console.log("[INF]", "EvidenceList: " + util.inspect(answers.question.evidencelist));
      feedback = new Array(answers.length);
      answers.question.answers.forEach(function(answer, index){
        feedback[index] = {
            questionId: answers.question.id,
            answerid : answer.id,
            feedback : "0",
            comment : ""
        };
      });
      return res.render('index',{'questionText': req.body.questionText, 'answers': answers, 'feedback': feedback})
    })

  });

  watson_req.on('error', function(e) {
    return res.render('index', {'error': e.message})
  });

  // create the question to Watson
  var questionData = {
    'question': {
      'evidenceRequest': { 
        'items': 5 // the number of anwers
      },
      'questionText': req.body.questionText // the question
    }
  };

  // Set the POST body and send to Watson
  watson_req.write(JSON.stringify(questionData));
  watson_req.end();

});

app.post('/feedback', function(req, res){
  // create the request options to POST our question to Watson
  var parts = url.parse(service_url+'/v1/feedback');
  var options = {
    host : parts.hostname,
    path : parts.pathname,
    method : 'POST',
    auth : auth,
    headers : {
      'Content-Type' : 'application/json',
      'Accept' : 'application/json',
      'X-SyncTimeout' : 30
     }
  };

  // create the feedback text to send Watson
  /*
  var feedback = {
    "questionId" : req.body.questionId,
    "answerid" : req.body.answerId,
    "feedback" : req.body.feedback
  };
  */
  
  console.log("[INF]", "Sending feedback index: " + req.body.feedbackIndex +
      "\n" + util.inspect(feedback));
  if (feedback[req.body.feedbackIndex].feedback == req.body.feedback){
    console.log("[WARN]", "Requested feedback is same as current feedback.\n" +
        "Not sending feedback.");
    return res.render('index',{'questionText': req.body.questionText, 'answers': answers, 'feedback': feedback});
  };
  
  feedback[req.body.feedbackIndex].feedback = req.body.feedback;
  console.log("[INF]", "Sending feedback: " + util.inspect(feedback[req.body.feedbackIndex]));
  
  var feedback_req = https.request(options, function(result) {
    result.setEncoding('utf-8');
    var response_string = '';
    result.on("data", function(chunk) {
      response_string += chunk;
    });
    
    result.on('end', function() {
      console.log("[INF]", "Feedback request end");
      console.log("[INF]", "Feedback response: " + response_string);
      console.log("[INF]", "Sending feedback: \n" + util.inspect(feedback));
      return res.render('index',{'questionText': req.body.questionText, 'answers': answers, 'feedback': feedback});
    });

    feedback_req.on('error', function(e) {
      console.log("problem" + e.message);
    });
  });
  
  feedback_req.write(JSON.stringify(feedback[req.body.feedbackIndex]));
  feedback_req.end();
  //return res.render('index',{'questionText': req.body.questionText, 'answers': answers, 'feedback': feedback});
  //return res.redirect('/', 'index',{'questionText': req.body.questionText, 'answers': answers, 'feedback': feedback});
});

app.post('/comment', function(req, res){
  // retrieve the credential information from VCAP_SERVICES for Watson QAAPI
  var host   = VCAP_SERVICES["QA API Gateway"][0].credentials.uri;
  var passwd = VCAP_SERVICES["QA API Gateway"][0].credentials.password;
  var userid = VCAP_SERVICES["QA API Gateway"][0].credentials.username;
  // create the request options to POST our question to Watson
  var parts = url.parse(host);
  var options = {
    host : parts.hostname,
    path : parts.pathname+'/v1/feedback',
    method : 'POST',
    auth : userid + ":" + passwd,
    headers : {
      'Content-Type' : 'application/json',
      'Accept' : 'application/json',
      'X-SyncTimeout' : 30
    }
  };

  // create the Question text to ask Watson
  var comment = {
    "questionId" : req.body.questionId,
    "answerid" : req.body.answerId,
    "comment" : req.body.comment
  };

  var req = https.request(options, function(result) {
    result.on("data", function(chunk) {
    res.write(chunk);
  });
    result.on('end', function() {
      res.end();
    });
  });

  req.on('error', function(e) {
  console.log("problem" + e.message);
  });
  // Set the POST body and send to Watson
  req.write(JSON.stringify(comment));
  req.write("\n\n");
  req.end();
});



// The IP address of the Cloud Foundry DEA (Droplet Execution Agent) that hosts this application:
var host = (process.env.VCAP_APP_HOST || 'localhost');
// The port on the DEA for communication with the application:
var port = (process.env.VCAP_APP_PORT || 3000);
// Start server
app.listen(port, host);
