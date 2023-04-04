var express = require('express');
var router = express.Router();
var pg=require('pg');
var config={
    user:'vkhluytq',
    database:'vkhluytq',
    password:'tZ10hocEC2HkV1hSpBpJLL_maQA11uqq',
    host:'snuffleupagus.db.elephantsql.com',
    port:5432,
    max:100,
    idleTimeoutMillis:30000,
};

var pool=new pg.Pool(config);
module.exports=pool;