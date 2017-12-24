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
    if(error) {
      return res.send('error')
    }
      return res.render('index', {
        tasks: reply,
      });
  });
});

app.post('task/add', function(req, res){
  var task = req.body.task;
  client.rpush('tasks', task, function(error, reply){
    if(error) {
      return res.send({
        msg: error
      });
    }
  });
});

app.listen(3000);
console.log('Listeng to port 3000');
module.exports = app;
