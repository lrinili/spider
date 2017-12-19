var express = require('express');
var utility = require('utility');
var superagent = require('superagent'); //模拟发起请求
var cheerio = require('cheerio'); // 对返回dom解析
var eventproxy = require('eventproxy'); //控制并发
var url = require('url')
var app = express();
var codeUrl = "https://cnodejs.org/"
var ep = new eventproxy()
	var topics = []
app.get('/',function(req,res){
	superagent.get('http://cnodejs.org/')
		.end(function(err,resp){
		     if (err || !resp.ok) {
		       res.send(JSON.stringify(err))
		     } 
		     // res.send(JSON.stringify(resp.text))
			  var $ = cheerio.load(resp.text)
			  var items  = []
			  $('#topic_list .topic_title').each(function(item,el){

			  	items.push({
			  		title:$(el).attr('title'),
			  		href:$(el).attr('href'),
			  		topicUrl:url.resolve(codeUrl,$(el).attr('href'))
			  	})
			  })

             items.forEach(function(item2,kye2){
             	superagent.get(item2.topicUrl)
             		.end(function(err2,resp2){
             			if(err2.err){
             				//console.log(err2)
             			}else{
             				console.log(resp2.text)
             				ep.emit('topic_html',[item2.topicUrl,resp2.text])
             			}
             		})
             })
		
			ep.after('topic_html',40,function(data){
				//res.send(data)  
				var i= 0
				 i++
				console.log('data',i)
				topics =  data.map(function(item4,key4){
							var tpicUrl4 = item4[0]
							var tpicHtml4 = item4[1]
							var $ = cheerio.load(tpicHtml4)
							//console.log('12',tpicHtml4)
							return ({
								title: $(".topic_full_title").text().trim(),
								href:tpicUrl4,
								comment1:$(".reply_content").eq(0).text().trim()
							})
						})
				 res.send(topics)  
			} )

       // res.send(topics)  

   })

})

app.listen('3000',function(){
	console.log('app is listening at port 3000')
})