/**
+ * подключаешь video.js потом player_api.js и потом свой скрипт
+ * parse.php находится в корне и вместе с индексом
+ * КОНСТРУКТОР видео :
+ * 		video(DOM element video ID, DOM element audio ID, 
+ * 			[айди транскрипции, айди оригинала, айди перевода, айди худ перевода],
+ * 			[айди контроль панели, play id, pause id, stop id, say id],
+ * 			[айди таймлайна, айди внутреннего дива таймлайна]);
+ *
+ * функция получения субтитров :
+ * getSubs(путь до субтитров видео, путь до координтов аудио, функция замыкание после получения видео);
+ *
+ * в параметр функции возвращается объект с двумя массивами 
+ * и если есть какие  то ошибки то и с объектом ошибок
+ * все дальнейшие действия с полученными субтитрами\координатами делать только внутри функции
+ *
+ * у объекта видео есть два метода для добавления субтитров и координатов :
+ * video.setSubs, video.setCoords
+ * в них передаешь субтитры видео и координаты аудио
+ * массив с видео называется videoSubs, с аудио audioCoords в объекте который в параметре функции замыкания
+ *
+ * 
+ */
var v = new video(
	'video', 'voice', 
	['yt/yt.srt','yt/yt_voice.srt'],
	['crypt', 'org', 'slate', 'org2'], 
	['controlPane', 'autopause', 'audiotext', 'play', 'stop', 'say', 'prevframe', 'nextframe'],
	['timelineId', 'inTimeline', 'timeSpend', 'videoDur'],// айди всего таймлайна, айди пиптика, айди куда печатать пройденное время, айди дива куда печатать длительность
	['volume', 'volumeIn']); 
/*
+var v2 = new video(
+	'video2', 'voice2', 
+	['crypt2', 'org2', 'slate2', 'org22'], 
+	['controlPane2', 'autopause2', 'audiotext2', 'play2', 'pause2', 'stop2', 'say2', 'prevframe2', 'nextframe2'],
+	['timelineId2', 'inTimeline2', 'timeSpend2', 'videoDur2'],// айди всего таймлайна, айди пиптика, айди куда печатать пройденное время, айди дива куда печатать длительность
+	['volume2', 'volumeIn2']); 
+
+getSubs('abba/ABBA.srt', 'abba/ABBA_voice.srt', function(r2){
+	v2.setSubs(r2.videoSubs);
+	v2.setCoords(r2.audioCoords);
+	// var n = new timeline('shit', 'bot', function(arg, num)
+	//   {
+	//     console.log(arg);
+	//     if(num)
+	//       console.log(num);
+	//   }, 'prcnts', 5, 'slider');
+});
+*/
