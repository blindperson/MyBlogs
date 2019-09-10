var mongoose = require("./connect");

// 创建数据表的描述对象
var userSchema = new mongoose.Schema({
    account:String,
    password:String,
    email:String
});

// 创建数据表操作对象
var User = mongoose.model("user",userSchema);

module.exports = User;