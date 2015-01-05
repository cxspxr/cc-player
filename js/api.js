function p(s){ // parse for '//'
	var org = s;
	var a = s.split(' ');
	var res = '';
	for(d in a){
		var t = a[d];

		if(t!==''){
		// console.log(t);
		if(t.search(/\/\//)!==-1){
			t = t.slice(0, t.search(/\/\/\/\//)-1);
		}
		if(t.search(/\/\/\/\//)!==-1){
			t = t.slice(0, t.search(/\/\/\/\//)-1);
		}
		if(t.search(/\/[^\/]+\//)!==-1){
			t = t.replace('\/', '<u>');
			t = t.replace('\/', '</u>');
		}
			res += t + ' ';
		} else {
			res += ' ';
		}
	}
	if(res.search(/\/[^u]/)!==-1){
		// console.log('in');
		var check = true;
		for(var j=0;j<5;j++){
			if(res.search(/\/[^u]/)!==-1){
				if(check){
					var s = res.search(/\/[^u]/);
					var left = res.slice(0, s);
					var slash = res.slice(s,s+1);
					var right = res.substr(s+1);

					slash = '<u>';
					res = left + slash + right;
					check = false;
				} else {
					var s = res.search(/\/[^u]/);
					var left = res.slice(0, s);
					var slash = res.slice(s,s+1);
					var right = res.substr(s+1);

					slash = '</u>';
					res = left + slash + right;
					check = true;
				}
			}
		}
	}
	return res;
}

function getSubs(path, path_voice, call){
	function getXmlHttp(){
		var xmlhttp;
		try {
			xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
		} catch (e) {
			try {
				xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
			} catch (E) {
				xmlhttp = false;
			}
		}

		if (!xmlhttp && typeof XMLHttpRequest!='undefined') {
			xmlhttp = new XMLHttpRequest();
		}
		
		return xmlhttp;
	}

	var x = getXmlHttp();

	x.open('get', 'parse.php'+'?path='+encodeURIComponent(path)
	+'&voice=' + encodeURIComponent(path_voice), true);

	x.onreadystatechange = function(){
		if(x.readyState === 4){
			call(JSON.parse(x.responseText));
		}
	}
	x.send(null);
}

function video(video, audio, coords, subs, cpan, tline, volume ) {
	getSubs(coords[0], coords[1], function(r) {
		var Player = {
			i: null,
			counter: null,
			Subs: {
				Models: {},
				Views: {},
				Collections: {}
			},
			Text: {
				Models: {},
				Views: {},
				Collections: {}
			},
			Coords: {
				Video : r.videoSubs,
				Audio : r.audioCoords
			},
			Main: {
				Models:{},
				Views:{},
				Collections:{},
				MainModel: {}
			},
			Audio: {
				el: document.getElementById(audio)
			},
			Video: {
				el: document.getElementById(video),
				autopause: false,
				interval: null,
				flag: true
			},
			next : function() {
				if(Player.i != Player.Coords.Video.length - 1)
					this.set('counter', this.get('counter') + 1);
			},
			setCount: function(n) {
				Player.i = n;
				this.set('counter', n);
			},
			timeline: new timeline(tline[1], tline[0], function(a) {
				Player.Video.autopause = false;
				Player.Video.el.currentTime = Player.Video.el.duration * parseFloat(a)/100;
				_.each(Player.Coords.Video, function(el, i) {
					var frame = Player.frame(i);
					if(Player.Video.el.currentTime > frame.start && Player.Video.el.currentTime < frame.end) {
						Player.Main.MainModel.setCount(i);
					}
				});
				Player.Audio.el.pause();
			}, 'prcnts', 0),
			prev : function() {
				if(Player.i > 0)
				{
					this.set('counter', this.get('counter') - 1);
				}
			},
			frame: function(i, audio) {
				function toSec(str){
					var str = str.split(':'),
					h = parseInt(str[0]),
					m = parseInt(str[1]),
					s = parseFloat(str[2].split(',').join('.'));

					return h === 0 && m === 0 ? s : 
					m > 0 ? m * 60 + s : 
					h > 0 && m === 0 ? h * 3600 + s : 
					h > 0 && m > 0 ? h * 3600 + m * 60 + s : false;
				}
				var subline = audio ? Player.Coords.Audio[i] 
					: Player.Coords.Video[i || i == 0 ? i : Player.i];
				var frameStr = subline[0];
				var frame = {
					start: toSec(frameStr.split(' --> ')[0]),
					end: toSec(frameStr.split(' --> ')[1])
				};
				return frame;
			},
			check: function(framend) {
				Player.Video.interval = setInterval(function() {
					// console.log(framend + "  f  " + Player.Video.el.currentTime);
					if(Player.Video.el.currentTime >= framend) {
						// console.log('CATCH ' + framend + "  f  " + Player.Video.el.currentTime);
						Player.Main.MainModel.next();
						if(Player.Video.autopause)
							Player.Video.el.pause();
						Player.Video.flag = true;
						clearInterval(Player.Video.interval);
					}
				},10);
			}
		};


		//duration
		Player.Video.el.onloadedmetadata = function() {
			var duration = this.duration;
			$('#' + tline[3]).html(parseInt(duration/60) + ":" + parseInt(duration%60));
		};

		//Player.Main
		(function() {
			var mainCollection = Backbone.Collection;
			Player.Main.Collections.ModelsCollection = new mainCollection();
			Player.Main.Models.Main = Backbone.Model.extend({
				defaults: {
					counter: Player.counter,
					next: false,
					prev: false,
					setCount: false
				},
				next : function() {
					if(Player.i != Player.Coords.Video.length - 1) {
						this.set('setCount', false);
						this.set('prev', false);
						this.set('next', true);
						Player.next.call(this);
						Player.i++;
					}
				},
				prev : function() {
					if(Player.i > 0) {
						this.set('setCount', false);
						this.set('next', false);
						this.set('prev', true);
						Player.prev.call(this);
						Player.i--;
					}
				},
				setCount: function(n) {
					this.set('next', false);
					this.set('prev', false);
					this.set('setCount', true);
					Player.setCount.call(this, n);
				}
			});
			var main = new Player.Main.Models.Main();
			Player.Main.MainModel = main;
			Player.Main.Views.Main = Backbone.View.extend({
				initialize: function() {
					this.model.on('change:counter', this.render, this)
				},
				render: function() {
				var self = this;
					Player.Main.Collections.ModelsCollection.each(function(m) {
						if(self.model.get('next')) {
							m.next();
						}
						else if(self.model.get('prev')) {
							m.prev();
						}
						else if(self.model.get('setCount')) {
							m.setCount(Player.i);
						}
					});
				}
			});
			var mainView = new Player.Main.Views.Main({model:main});
		})();

		//Player.Subs
		(function() {
			Player.Subs.Models.Line = Backbone.Model.extend({
				defaults: {
					data: '',
					index: 0
				}
			});

			//new sub models
			var crypt = new Player.Subs.Models.Line({index:1});
			var org = new Player.Subs.Models.Line({index:2});
			var trans = new Player.Subs.Models.Line({index:3});
			var trans2 = new Player.Subs.Models.Line({index:4});

			//sub collection
			Player.Subs.Collections.Line = Backbone.Collection.extend({
				model:Player.Subs.Models.Line
			});
			var subsCollection = new Player.Subs.Collections.Line();
			subsCollection.add(crypt);
			subsCollection.add(org);
			subsCollection.add(trans);
			subsCollection.add(trans2);

			//subs model
			Player.Subs.Models.Main = Backbone.Model.extend({
				defaults: {
					counter: Player.counter,
					subs: []
				},
				next: Player.next,
				prev: Player.prev,
				setCount: Player.setCount
			});
			//new subs model
			var subsModel = new Player.Subs.Models.Main();
			//save coords
			subsModel.set('subs', Player.Coords.Video);
			//subs view 
			Player.Subs.Views.Main = Backbone.View.extend({
				initialize: function() {
					this.model.on('change:counter', this.render, this);
				},
				render: function() {
					//collection of text models
					var self = this;
					this.collection.each(function(s) {
						s.set('data', self.model.get('subs')[self.model.get('counter')]);
					});
				}
			});
			//new subs view
			var subsView = new Player.Subs.Views.Main({
				collection:subsCollection, model:subsModel
			});

			//subview
			Player.Subs.Views.Line = Backbone.View.extend({
				initialize: function() {
					this.model.on('change:data', this.render, this)
				},
				render : function() {
					if(this.model.get('index') == 2 || this.model.get('index') == 3) {
						this.$el.html(p(this.model.get('data')[this.model.get('index')]));
					} else
						this.$el.html(this.model.get('data')[this.model.get('index')]);
				}
			});

			//sub views
			var cryptView = new Player.Subs.Views.Line({model:crypt, el: $('#'+ subs[0])});
			var orgView = new Player.Subs.Views.Line({model:org, el : $('#' + subs[1])});
			var transView = new Player.Subs.Views.Line({model:trans, el : $('#' + subs[2])});
			var trans2View = new Player.Subs.Views.Line({model:trans2, el : $('#' + subs[3])});


			//add main models to the Player.Main.Collections.MainModels
			Player.Main.Collections.ModelsCollection.add(subsModel);
		})();

		//autist
		(function() {


			var Line = Backbone.Model.extend({
				defaults: {
					org : '',
					trans: ''
				}
			});

			var LineView = Backbone.View.extend({
				initialize: function() {
					this.model.set('view',this);
					this.$el.html("<span class='au-left'>" + this.model.get('org') 
						+ "</span>" + "<span class='au-right'>" + this.model.get('trans') 
						+ "</span>" );
				}
			});

			var Lines = Backbone.Collection;
			Player.Text.Collections.Lines = new Lines;

			var LinesViews = Backbone.Collection;
			Player.Text.Collections.LinesViews = new LinesViews; 

			_.each(Player.Coords.Video, function(el, i) {
				var line = new Line({
					org: Player.Coords.Video[i][2].replace(/\//g, '').replace(/\(/g, '').replace(/\)/g, ''),
					trans: Player.Coords.Video[i][4]
				});

				var lineView = new LineView({model: line});
				Player.Text.Collections.LinesViews.add(lineView);

				Player.Text.Collections.Lines.add(line);
			});

			var LineMain = Backbone.Model.extend({
				defaults: {
					counter : Player.counter
				},
				setCount: Player.setCount,
				next: Player.next,
				prev: Player.prev
			});
			Player.Text.Models.Main = new LineMain;

			var LineMainView = Backbone.View.extend({
				initialize: function() {
					this.model.on('change:index', this.draw, this);
					this.model.on('change:counter', this.changer, this);
				},
				id: 'autext',
				render: function() {
					this.$el.css({'width' : Player.Video.el.width + 'px', 
						'height' : Player.Video.el.height + 'px',
						'background-color' : 'white', 'position' : 'absolute',
						'display' : 'none', 'top' : '0', 'overflow-x' : 'hidden',
						'cursor' : 'pointer'});
					
					var self = this;
					this.collection.each(function(m, i, col) {
						self.el.appendChild(m.get('view').el);
						m.get('view').$el.click(function() {
							var index = col.indexOf(m);
							Player.Text.Models.Main.set('index', index);
						});
					});
				},
				draw: function() {
					this.collection.each(function(m) {
						m.get('view').$el.css({'background-color' : 'white', 'color' : 'black'});
					});

					Player.Text.Collections.Lines.at(Player.Text.Models.Main.get('index'))
						.get('view').$el.css({'background-color': 'green', 'color': 'white'});


					Player.Main.MainModel.setCount(Player.Text.Models.Main.get('index'));
					var frame = Player.frame();
					Player.Video.el.currentTime = frame.start;
					Player.Audio.el.pause();
				},
				changer: function() {
					this.collection.each(function(m) {
						m.get('view').$el.css({'background-color' : 'white', 'color' : 'black'});
					});

					Player.Text.Collections.Lines.at(Player.Text.Models.Main.get('counter'))
						.get('view').$el.css({'background-color': 'green', 'color': 'white'});
				}
			});

			Player.Text.Views.LineMain = new LineMainView({collection: Player.Text.Collections.Lines, 
				model: Player.Text.Models.Main});
			Player.Video.el.parentNode.appendChild(Player.Text.Views.LineMain.el);
			Player.Text.Views.LineMain.render();


			Player.Main.Collections.ModelsCollection.add(Player.Text.Models.Main);
		})();



		//play/pause 
		(function() {
			$('#' + cpan[3]).click(function() {

				clearInterval(Player.Video.interval);

				if(Player.Video.el.paused) {
					if(Player.i === null) {
						Player.Main.MainModel.setCount(0);
					}
					Player.Video.autopause = false;
					Player.Video.el.play();
				}
				else
					Player.Video.el.pause();

				Player.Audio.el.pause();

			});


			Player.Video.el.ontimeupdate = function() {
				if(Player.i === null)
					return;
				var currentTime = this.currentTime;
				var frame = Player.frame();
				// if(frame.end < currentTime)
				// 	Player.Main.MainModel.next();

				//autopause flag
				if(frame.end - .5 < currentTime) {
					if(Player.Video.flag) {
						Player.Video.flag = false;
						Player.check(frame.end);
					}
				}


				//timespend
				var time = Player.Video.el.currentTime;
				$('#' + tline[2]).html(time > 60 ? '0' + parseInt(time/60) + ':' + (parseInt(time%60)<10
				?'0'+parseInt(time%60):parseInt(time%60)) : time < 10 
				? '00:' + '0' + parseInt(time) : '00:' + parseInt(time));

				//goTo timeline
				Player.timeline.goTo('%', Player.Video.el.currentTime/Player.Video.el.duration * 100);
			}
		})();
		
		//prev/next 
		(function() {
			//prev
			$('#' + cpan[6]).click(function() {

				clearInterval(Player.Video.interval);


				if(Player.Video.el.paused) { // paused
					if(Player.i == 0 || Player.i == null) return;
					Player.Main.MainModel.prev();
					var frame = Player.frame();
					Player.Video.el.currentTime = frame.start;
				} else {  // played
					var frame = Player.frame();
					Player.Video.el.currentTime = frame.start;
					Player.Video.el.pause();
				}

				Player.Audio.el.pause();
			});

			//next
			$('#' + cpan[7]).click(function() {
				Player.Audio.el.pause();
				clearInterval(Player.Video.interval);
				if(Player.i == Player.Coords.Video.length - 1) {
					Player.Video.el.play();
					return;
				}
				if(Player.i === null) {
					Player.Main.MainModel.setCount(0);
				}
				if(Player.Video.el.paused) {  // paused
					Player.Video.el.play();
				} else {  // played
					Player.Main.MainModel.next();
					var frame = Player.frame();
					Player.Video.el.currentTime = frame.start;
					Player.Video.el.pause();
				}
				Player.Video.autopause = true;
				Player.Video.flag = true;
				
			});

		})();

		(function() {
			//stop
			$('#' + cpan[4]).click(function() {
				Player.timeline.goTo('%', 0);
				Player.Video.el.currentTime = 0;
				Player.Video.el.pause();
				Player.Main.MainModel.setCount(0);
				
				Player.Audio.el.pause();
			})
		})();

		//say
		(function() {
			$('#' + cpan[5]).click(function() {
				Player.Video.el.pause();

				if(Player.i === null) {
					var frame = Player.frame(0, 'audio');
					Player.Main.MainModel.setCount(0);
				}
				else {

					var frame = Player.frame(Player.i, 'audio');
					Player.Audio.el.currentTime = frame.start;
					if(Player.Audio.el.paused)
						Player.Audio.el.play();
					else {
						Player.Main.MainModel.next();
						var frame = Player.frame();
						Player.Video.el.currentTime = frame.start;
						Player.Audio.el.pause();	
					}
				}


			});

			Player.Audio.el.ontimeupdate = function() {
				var frame = Player.frame(Player.i, 'audio');

				if(Player.Audio.el.currentTime > frame.end) {
					Player.Main.MainModel.next();
					var frame = Player.frame();
					Player.Video.el.currentTime = frame.start;
					Player.Audio.el.pause();
				}
			}
		})();

		//autext
		$('#' + cpan[2]).change(function() {
			if(this.checked)
				Player.Text.Views.LineMain.$el.fadeIn();
			else
				Player.Text.Views.LineMain.$el.fadeOut();
		});

		//volume
		(function(){
			var vol = new timeline(volume[1], volume[0], function(a) {
				Player.Audio.el.volume = (a/100).toFixed(1);
				Player.Video.el.volume = (a/100).toFixed(1);
			}, 'prcnts', 0);
		})();


	});//getSubs
	
	// setInterval(function(){
	// 	Player.Main.MainModel.changeCounter();
	// 	console.log(Player.i);
	// }, 500);

}