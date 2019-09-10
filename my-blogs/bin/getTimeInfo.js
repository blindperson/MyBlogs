function getTimeInfo(time){
    // 形参:time表示这条博客的时间，距离1970.1.1的毫秒数
    // stamp：时间戳
    var nowStamp = new Date().getTime();
    // 现在和这条博客发布的时间差

    var timeDistance = (nowStamp - time)/1000;
    if (timeDistance<60) {
        return "刚刚";
    }
    else if (timeDistance < 600) {
        var m = Math.floor(timeDistance / 60) ;
        return m + "分钟之前";
    }
    else if (timeDistance < 3600) {
        return "1小时以内";
    }
    else  {
        // 具体的时间
        var timeObj = new Date(time);
        var h = timeObj.getHours();
        var m = timeObj.getMinutes();
        h = h <10 ? "0" + h : h;
        m = m <10 ? "0" + m : m;
        var year = timeObj.getFullYear();
        var month = timeObj.getMonth()+1;
        var day = timeObj.getDate();
        // if (timeDistance<24*3600) {
        if (day == new Date().getDate() && timeDistance<24*3600) {
            // 今天发布的，显示几时几分即可
            return h + ":" + m;
        } else {
            // 今天之间发布的
           
            return year + "-" + month + "-" + day + " " + h +":"+m;
        
        }
    }
}
module.exports = getTimeInfo;