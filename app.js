var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var redis = require('redis')


var app = express();

//Create client
var client = redis.createClient();
client.on('connect', function(){
  console.log('Redis Server is Connected');
})

// Template engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
  client.lrange('tasks', 0, -1, function(error, reply){
    client.hgetall('call', function(error,call){
      return res.render('index', {
        tasks: reply,
        call: call,
      });
    })
  });
});

app.post('/task/add', function(req, res){
  var task = req.body.task;
  console.log(task);
  client.rpush('tasks', task, function(error, reply){
    if(error) {
      return res.send({
        msg: error
      });
    }
    return res.redirect('/');
  });
});

app.post('/task/delete', function(req,res){
  var tasksToDel = req.body.tasks;
  client.lrange('tasks', 0, -1, function(error, tasks){
    for(var i = 0; i < tasks.length; i++){
      if(tasksToDel.indexOf(tasks[i]) > -1){
        client.lrem('tasks', 0, tasks[i], function(err){
          if(err){
            console.log(err);
          }
        });
      }
    }
    return res.redirect('/');
  });
});

app.post('/call/add', function(req,res){
  var newCall = {
    name: req.body.name,
    company: req.body.company,
    phone: req.body.phone,
    time: req.body.time
  };

  client.hmset('call', [
    'name', newCall.name,
    'company', newCall.company,
    'phone', newCall.phone,
    'time', newCall.time,
  ], function(error, reply){
    if(error){
      console.log(error);
    }
    console.log(reply);
    return res.redirect('/');
  });
});

app.listen(3000);
console.log('Listeng to port 3000');
module.exports = app;
