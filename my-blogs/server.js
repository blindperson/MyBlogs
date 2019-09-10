var app = require("./bin/app");
var md5 = require("md5");
var User = require("./bin/userDAO");
var Blog = require("./bin/blogDAO");
var Reply = require("./bin/replyDAO");
var getTimeInfo = require("./bin/getTimeInfo");

// 获取首页
app.get("/",function(req,res){
    // 查询服务器所有的博客
  Blog.find().populate("author").exec(function(err,data){
        data = data.reverse();
        if (!err) {
            data.forEach(function(b){
                // 将博客的发布时间改为时间的描述
                b.timeInfo = getTimeInfo(b.time);
                // 将标签tag进行拆分
                b.tagInfo = b.tag.split(" ");
            });
            res.render("index.html",{
                title:"首页",
                location:"index",
                user:req.session.user,
                blogs:data,
            });
        }
    });
});

// 获取注册页面
app.get("/register",function (req,res){
    res.render("register.html",{
        title:"注册",
        location:"register",
    });
})
    
// 注册接口
app.post("/register",function(req,res) {
    var reg = /^\w{3,}$/;
    if (!reg.test(req.body.account) || !reg.test(req.body.password)) {
        res.send("错误");
        return ;
    }
    // 判断账号是否已经注册
    User.findOne({account:req.body.account},function(err,user){
        if (!err) {
            if (user) {
                res.render("register.html",{
                    title:"注册",
                    location:"register",
                    tip:"用户名已经被注册!"
                });   
            }else{
                var u = new User(req.body);
                u.password = md5(u.password);
                u.save(function(err){
                    if (err) {
                        res.render("register.html",{
                            title:"注册",
                            location:"register",
                            tip:"服务器数据库异常!"
                        }); 
                    }else{
                        res.redirect("/login");
                    }
                });
            }
        } 
    });
});

// 获取登录界面
app.get("/login",function(req,res) {
    res.render("login.html",{
        title:"登录",
        location:"login",
    });
});

// 登录接口
app.post("/login",function(req,res){
    // 判断账号密码是否正确
    var condition = {
        account:req.body.account,
        password:md5(req.body.password)
    }
    User.findOne(condition,function(err,user){
        if (!err) {
            if (user) {
                req.session.user = user;
                res.redirect("/");
            } else {
                res.render("login.html",{
                    title:"登录",
                    location:"login",
                    tip:"账号或密码错误"
                });
            }
        }
    });
});

//获取标签页面 
app.get("/tag",function(req,res){
    Blog.find(function(err,data){
        var tags =[];
        // 找到每一条博客
        data.forEach(function(blog){
            var arr=blog.tag.split(" ");
            // 遍历每条博客的每一个标签
            arr.forEach(function(tag){
                // 去重
                if (tag && tags.indexOf(tag)<0) {
                    tags.push(tag);
                }
                
            });
        });
        res.render("tag-list.html",{
            title:"标签",
            location:"tag",
            user:req.session.user,
            tags:tags,
        });
    });
});

// 退出登录
app.get("/logout",function(req,res){
    // 清楚全部的session
    // req.session.destroy(function(){});
    req.session.user = null ;
    res.redirect("/");
});

// 获取发帖页面
app.get("/publish",function(req,res){
    if (req.session.user) {
        res.render("publish.html",{
            title:"发帖",
            location:"publish",
            user:req.session.user,
        });
    } else {
        res.redirect("/login");
    }
   
});

// 发帖接口
app.post("/publish",function(req,res){
    if (!req.session.user) {
        return res.redirect("/login");
    }

    // 封装要存储的blog对象
    var blog = {
        title: req.body.title,
        tag: req.body.tag,
        content: req.body.content,
        time: new Date().getTime(),
        readCount:0,
        author:req.session.user._id,
        reply:[],
    }

    // 存储到数据库
    var b = new Blog(blog);
    b.save(function(err){
        if (!err) {
            res.redirect("/");
        }
    });

});

// 博客的详情页面
app.get("/blog",function(req,res){
    Blog.findOne(req.query).populate("author").populate("reply").exec(function(err,blog){
        if (!err) {
            // 找不到对应的博客则重定向到首页
            if (!blog) {
                res.redirect("/");
                return;
            }
            // 博客浏览量加一
            blog.readCount++;
            // 存回数据库
            blog.save(function(err){});


            // 渲染模板并返回
            blog.timeInfo = getTimeInfo(blog.time);
            blog.reply.forEach(function(rep){
                rep.timeInfo = getTimeInfo(rep.time);
            });
            res.render("blog.html",{
                title:"博客",
                user:req.session.user,
                blog:blog,
            });
        }
    });
});

// 回帖接口
app.post("/reply",function(req,res){
    
    // 找到对应的博客
    Blog.findOne(req.query,function(err,blog){
        // 找不到对应的博客则重定向到首页
        if (!blog) {
            res.redirect("/");
            return;
        }

        var nickname = "游客";
        if (req.session.user) {
            // 登陆的情况
            nickname = req.session.user.account;
        }else{
            // 没有登陆
            if (req.body.nickname) {
                nickname = req.body.nickname;
            }
        }
        // 生成回复的数据对象
        var reply = new Reply({
            nickname:nickname,
            content:req.body.content,
            time:new Date().getTime()
        });

        reply.save(function(err){
            if (!err) {
                blog.reply.push(reply._id);
                blog.save(function(err){
                    if (!err) {
                        res.redirect("/blog?_id="+blog._id);
                    }
                });
            }
        });
    });
});

//删除博客 
app.get("/delete",function(req,res){
    // 没登陆重定向到登陆界面
    if (!req.session.user) {
        res.redirect("/login");
    }
    // 找到对应的博客
    Blog.findOne(req.query).exec(function(err,blog){
        console.log(req.query);
        // 权限设置
        if (blog.author != req.session.user._id) {
            res.send("错误");
            return ;
        }
        // 删除对应的回复
        blog.reply.forEach(function(repid){
            Reply.deleteOne({_id:repid},function(err){});
        });
        Blog.deleteOne(req.query,function(err){
            if (!err) {
                res.redirect("/");
            }
        });
    })
});
// 条件查询响应的博客
app.get("/search",function(req,res){
    var condition = {};
    if (req.query.author) {
        condition.author =req.query.author;
    }
    if (req.query.tag) {
        condition.tag = new RegExp(req.query.tag);
    }
    Blog.find(condition).populate("author").exec(function(err,data){
        res.render("search.html",{
            title:"搜索结果",
            user:req.session.user,
            data:data,
            condition:{zuozhe:req.query.zuozhe,tag:req.query.tag},
        });
    });
});