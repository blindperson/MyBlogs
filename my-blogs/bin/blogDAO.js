var mongoose = require("./connect");

// 创建数据表的描述对象
var blogSchema = new mongoose.Schema({
    title:String,
    tag:String,
    content:String,
    time:Number,
    readCount:Number,
    // 关联user数据表中的一条数据的id
    author:{type:mongoose.Schema.Types.ObjectId,ref:"user"},
    // 关联reply数据表中的多条数据的id
    reply:[{type:mongoose.Schema.Types.ObjectId,ref:"reply"}],
});

// 创建数据表操作对象
var Blog = mongoose.model("blog",blogSchema);

module.exports = Blog;