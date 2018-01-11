import React from 'react'
import ReactDOM from 'react-dom'

import './index.css'
import './config'

import App from './App'

// experimental w(°ｏ°)w
var express = require ('express');
var bodyParser = require ('body-parser');
var postListener = express();

var Slack = require('slack-node');
// /exprimental w(°ｏ°)w

ReactDOM.render(<App />, document.getElementById('root'));

postListener.post('/getUsers', urlencodedParser, function(req, res){
  webhookUri = "https://hooks.slack.com/services/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";

  slack = new Slack();
  slack.setWebhook(webhookUri);

  slack.webhook({
    channel: "#whosthere",
    username: "webhookbot",
    text: "This is posted to #general and comes from a bot named webhookbot."
  }, function(err, response) {
    //console.log(response);
  });
});
