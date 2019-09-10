var mongoose = require("./connect");

// 创建数据表的描述对象
var replySchema = new mongoose.Schema({
    nickname:String,
    content:String,
    time:Number
});

// 创建数据表操作对象
var Reply = mongoose.model("reply",replySchema);

module.exports = Reply;