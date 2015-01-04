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
			i: -1,
			Subs: {
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
			prev : function() {
				if(Player.i > 0)
				{
					this.set('counter', this.get('counter') - 1);
				}
			},
			frame: function(i) {
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
				var subline = Player.Coords.Video[i ? i : Player.i];
				var frameStr = subline[0];
				var frame = {
					start: toSec(frameStr.split(' --> ')[0]),
					end: toSec(frameStr.split(' --> ')[1])
				};
				return frame;
			},
			check: function(framend) {
				Player.Video.interval = setInterval(function() {
					if(Player.Video.el.currentTime >= framend) {
						Player.Main.MainModel.next();

						if(Player.Video.autopause)
							Player.Video.el.pause();

						Player.Video.flag = true;
						console.log('vnutr');
						clearInterval(Player.Video.interval);
					}
				},10);
			}
		};


		//Player.Main
		(function() {
			var mainCollection = Backbone.Collection;
			Player.Main.Collections.ModelsCollection = new mainCollection();
			Player.Main.Models.Main = Backbone.Model.extend({
				defaults: {
					counter:-1,
					next: false,
					prev: false
				},
				next : function() {
					if(Player.i != Player.Coords.Video.length - 1) {
						this.set('prev', false);
						this.set('next', true);
						Player.next.call(this);
						Player.i++;
					}
				},
				prev : function() {
					if(Player.i > 0) {
						this.set('next', false);
						this.set('prev', true);
						Player.prev.call(this);
						Player.i--;
					}
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
					counter: -1,
					subs: []
				},
				next: Player.next,
				prev: Player.prev
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


		//play/pause 
		(function() {
			$('#' + cpan[3]).click(function() {

				clearInterval(Player.Video.interval);


				if(Player.Video.el.paused) {
					if(Player.i === -1)
						Player.Main.MainModel.next();
					Player.Video.autopause = false;
					Player.Video.el.play();
				}
				else
					Player.Video.el.pause();
			});


			Player.Video.el.ontimeupdate = function() {
				var currentTime = this.currentTime;
				var frame = Player.frame();
				// if(frame.end < currentTime)
				// 	Player.Main.MainModel.next();

				//autopause flag
				if(frame.end - .5 < currentTime)
					if(Player.Video.flag) {
						Player.check(frame.end);
						Player.Video.flag = false;
					}
			}
		})();
		
		//prev/next 
		(function() {
			//prev
			$('#' + cpan[6]).click(function() {

				clearInterval(Player.Video.interval);


				if(Player.Video.el.paused) { // paused
					if(Player.i == 0) return;
					Player.Main.MainModel.prev();
					var frame = Player.frame();
					Player.Video.el.currentTime = frame.start;
				} else {  // played
					var frame = Player.frame();
					Player.Video.el.currentTime = frame.start;
					Player.Video.el.pause();
				}
			});

			//next
			$('#' + cpan[7]).click(function() {

				clearInterval(Player.Video.interval);


				if(Player.Video.el.paused) {  // paused
					Player.Video.el.play();
				} else {  // played
					Player.Main.MainModel.next();
					var frame = Player.frame();
					Player.Video.el.currentTime = frame.start;
					Player.Video.el.pause();
				}
				Player.Video.autopause = true;
			});
		})();


	});//getSubs

	// setInterval(function(){
	// 	Player.Main.MainModel.changeCounter();
	// 	console.log(Player.i);
	// }, 500);

}