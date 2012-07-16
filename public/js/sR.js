

			$(function(){

				$('#feeds a').live('click', function(e){
					e.preventDefault();
					router.navigate($(this).attr('href'), {trigger: true});
					sR.feeds.menu.select(this);
				});

				$('#articles a.read-more').live('click', function(e){
					e.preventDefault();
					var url = $(this).attr('href');	
					if(url) router.navigate(url, {trigger: true});
				});

				$('.refresh').live('click', function(e){
					e.preventDefault();
					window.location.reload(true);
				});

				///////////////////////////////////////////////////////

				var sR = {
					loader: (function(){
						return {
							hide: function(){

							}
						}
					})(),
					tidy: function($article){

						var imgs = ''; 
						
						$article.find('img').each(function(){
							
							var $parent = $(this).parent();
							var src = $(this).attr('src');
							
							if($parent.get(0).tagName.toLowerCase() == 'a'){
								
								var href = $parent.attr('href');
								var ext = href.substring(href.lastIndexOf('.'), href.length);	

								var largeImage = $.inArray(ext, ['.jpg','.jpeg','.png','.gif']) != -1 ? href : src;

								$parent.remove();
									
							}

							imgs += '<li><a href="' + (largeImage || src) + '" style="background: url(' + src + ')" rel="group"></a></li>';

							$(this).remove();

						});
						
						$article.find('hr').remove();
						
						var tags = ['span', 'p'];

						for(var i = 0; i < tags.length; i++){
							$article.find(tags[i]).each(function(){
								if($(this).html() == '') $(this).remove();
							});
						}

						var $iframe = $article.find('iframe');  

						$iframe.attr('width', '100%');
						$iframe.attr('height', '');	

						return imgs;

					},
					ms: {}, // models
					cs: {}, // collections
					vs: {}, // views
					ts: {}, // templates
					feeds: {
						$el: $('#feeds'),
						menu: (function(){
							return {
								select: function(inst){

									sR.feeds.$el.find('a').removeClass('selected');
									$(inst).addClass('selected');

								}
							}

						})(),
						get: function(){

							sR.ms.m_feed = Backbone.Model.extend({});
							sR.vs.v_feed = Backbone.View.extend({
							    tagName: "li",
							    template: _.template($("#t-feed").html()),
							    render: function () {
							    	return this.template(this.model.toJSON());
							    }
							})

							sR.cs.c_feeds = Backbone.Collection.extend({
							    model: sR.ms.m_feed,
							    url: "/data?query=sources",
							    initialize: function(){
							    	// remove loader
							    }
							});

							sR.vs.v_feeds = Backbone.View.extend({
							    render: function () {

							    	this.collection.each(function (m) {
							        	var view = new sR.vs.v_feed({ model: m });
							        	$(sR.feeds.$el).append(view.render());
							    	});

							    	//////////////////////////////////////////	

							        $('.loading').hide();
							        $('.app').show();

							        sR.feeds.menu.select($("[href='" + document.location.pathname + "']"));

							    },
							    initialize: function () {
							        this.collection.bind("reset", this.render, this);
								} 
							});

					        sR.feeds.data = new sR.cs.c_feeds();
			        		new sR.vs.v_feeds({ collection: sR.feeds.data });
			        		sR.feeds.data.fetch();	

						}	
					},
					articles: {
						$el: $('#articles'),
						set: function(render){
							if(!sR.articles.data) { 
					        	sR.articles.get({ render: render });
					        } else {
					        	render(sR.articles.data);
					        } 
						},						
						get: function(c){
							
							sR.ms.m_article = Backbone.Model.extend({});
							sR.vs.v_article = Backbone.View.extend({
							    tagName: "li",
							    template: _.template($("#t-article").html()),
							    render: function () {
							    	return this.template(this.model.toJSON());
							    }
							})

							////////////////////////////////

							sR.cs.c_articles = Backbone.Collection.extend({
							    model: sR.ms.m_article,
							    url: "/data",
							    initialize: function(){
							    		
							    },
				                comparator: function(a, b){
					                var ad = new Date(a.get('publishedDate'));
					                var bd = new Date(b.get('publishedDate'));
					                return bd.getTime() - ad.getTime();
					            }
							});

							sR.vs.v_articles = Backbone.View.extend({
							    render: function () {
							    	this.collection.each(function(m){
							    		m.set({
							    			publishedDate: prettyDate(m.get('publishedDate')),
							    			readMore: '/post/' + m.cid,
							    			author: m.get('author') || 'Anon'
							    		});	
							    	});

							    	c.render(this.collection);

							    	if(!sR.feeds.data) sR.feeds.get();

							    },
							    initialize: function () {
							        this.collection.bind("reset", this.render, this);
								}
							});

							///////////////////////////////////////////////////////////////////////

					        sR.articles.data = new sR.cs.c_articles();
					        new sR.vs.v_articles({ collection: sR.articles.data });
					        sR.articles.data.fetch();

						},
						iterate: function(range){
							sR.articles.$el.empty();
							$(range).each(function(){
								var view = new sR.vs.v_article({ model: this });
								sR.articles.$el.append(view.render());
							});
						}

					}					

				};

				////////////////////////////////////////////////////////////////////////////////////////////

				sR.Router = Backbone.Router.extend({
				    routes: {
				        "": "defaultRoute",
				        "feed/:id": "feed",
				        "post/:id": "post"
				    },
				    defaultRoute: function () {
				    	sR.articles.set(function(collection){
							sR.articles.iterate(collection.models);	
		    			});
				    }, 
				    feed: function(id){
				    	sR.articles.set(function(collection){		  
							sR.articles.iterate(collection.where({sourceID:parseFloat(id)}));	
		    			});
				    },
				    post: function(id){
				    	sR.articles.set(function(collection){		  
							
							var post = collection.getByCid(id);
							var template = _.template($("#t-post").html());

							sR.articles.$el.empty().append(template(post.toJSON()));

							var imgs = sR.tidy(sR.articles.$el);

							if(imgs != ''){

								$('.images').html('<h4>Images</h4><ul>' + imgs + '</ul><div class="clear"></div>');

							}

							$('.images a').fancybox();

		    			});
				    }
				})

				var router = new sR.Router();

				Backbone.history.start({pushState: true});								

			});