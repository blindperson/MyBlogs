// 处理服务器对象
var express = require("express");
// 生成服务器对象
var app = express();
// 设置服务器的静态文件夹
app.use(express.static("www"));

// 处理请求报文请求体中的数据，将数据对象添加到req.body属性上
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended:false}));

// 处理模板引擎
var art = require("express-art-template");
// app.engine("ext:后缀名",一个模块);
// 参数一：模板的后缀名 参数二：设置服务器使用的模板引擎
app.engine("html",art);



// 处理session模块
var session = require("express-session");
// 指定session存储到数据mongodb中
var mongoStore = require("connect-mongo")(session);
// 把session存储到已经打开的blog数据库
var mongoose= require("./connect");
app.use(session({
    secret:"keyboard cat",
    resave:false,
    saveUninitialized:false,
    store:new mongoStore({mongooseConnection:mongoose.connection}),
}));


app.listen(3000,function(){
    console.log("服务器启动成功");
});
module.exports = app;