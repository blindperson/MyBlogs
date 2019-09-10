var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/blog",{useNewUrlParser:true},function(err){
    if (err) {
        console.log("服务器开启失败" + err);
    } else {
        console.log("服务器开启成功");
    }
});
module.exports = mongoose;