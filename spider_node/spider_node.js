/**
 * Created by dista on 2016/12/7.
 */
var http = require('http');
var fs = require('fs');
var cheerio = require('cheerio');
var request = require('request');//使用request模块使http请求变得简单
var url = "http://www.ss.pku.edu.cn/index.php/newscenter/news/2391";//初始化url
var i = 0;
function fetchPage(x) {
    startRequest(x)
}
function startRequest(x) {
    //采用http模块向服务器发起一次get请求
    http.get(x, function (res) {
        var html = '';//储存所请求网页的整理html内容
        // var titles = [];
        res.setEncoding('utf-8');//防止中文乱码
        //监听data事件，每次取一块数据
        res.on('data', function (chunk) {
            html += chunk;
        });
        //监听end事件，当整个网页的html都获取完毕，执行回调函数
        res.on('end', function () {
            var $ = cheerio.load(html);//采用cheerio模块解析html
            var time = $('.article-info a:first-child').next().text().trim();
            var news_item = {
                //新闻标题
                title: $('div.article-title a').text().trim(),
                //发布时间
                Time: time,
                //新闻url
                link: "http://www.ss.pku.edu.cn" + $('div.article-title a').attr('href'),
                //供稿单位
                author: $('[title=供稿]').text().trim(),
                i: i = i + 1
            };
            console.log(news_item);
            var news_title=$('div.article-title a').text().trim();
            savedContent($,news_title);//储存每篇新闻内容及标题
            savedImg($,news_title);//储存每篇文章的图片及图片名

            //下一篇新闻的url
            var nextLink="http://www.ss.pku.edu.cn"+$("li.next a").attr('href');
            //去除url后面的中文
            str1=nextLink.split('-');
            str=encodeURI(str1[0]);
            //通过控制i，控制爬多少篇文章
            if(i<=500){
                fetchPage(str);
            }
        });

    })
        .on('error',function (err) {
            console.log(err);

        });
}
//储存新闻内容
function savedContent($,news_title) {
    $('.article-content p').each(function (index,item) {
        var x=$(this).text();
        var y=x.substring(0,2).trim();
        if(y==''){
            x=x+'\n';
            fs.appendFile('./data/'+news_title+'.txt',x,'utf-8',function(err){
                if(err){
                    console.log(err);
                }
            });
        }
    })
}
//储存图片及图片名
function savedImg($,news_title){
    $('.article-content img').each(function (index,item) {
        var img_title=$(this).parent().next().text().trim();
        if(img_title.length>35||img_title==""){
            img_title="Null";
        }
        var img_filename=img_title+".jpg";
        var img_src='http://www.ss.pku.edu.cn'+$(this).attr('src');
        request.head(img_src,function (err,res,body) {
            if(err){
                console.log(err);
            }
        });
        request(img_src).pipe(fs.createWriteStream('./image/'+news_title+"-"+img_filename));
    })
}
fetchPage(url);//运行主程序