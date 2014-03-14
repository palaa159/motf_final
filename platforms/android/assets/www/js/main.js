var motf = {}, self;
var looper;

motf.init = function() {
	// disable android backbtn
	document.addEventListener('backbutton', function() {
		// do nothing
	}, false);
	self = this;
	self.poetScroll = 0;
	self.pageNoFooter = ['pLanding', 'pOffine'];
	self.pageFooterNoChange = ['pPoetDetail', 'pDetailCreate', 'pUGCPoetDetail'];
	self.history = [];
	self.appWidth = window.innerWidth;
	self.appHeight = window.innerHeight;
	self.footerHandler();
	self.isPoemOn = false;
	parse.init();
	self.goToPage('pLanding');
};

motf.footerHandler = function() {
	// spread footer
	return $('.menu').each(function(i, v) {
		$(this).css({
			left: i * motf.appWidth / 4,
			width: motf.appWidth / 4
		});
	});
};

motf.deployVideoList = function(list) {
	var template = Handlebars.compile($('#tempPoet').html());
	return template(list);
};

motf.deployPoet = function(poetnum) {
	var template = Handlebars.compile($('#tempPoetDetail').html());
	var videoSize = {
		width: self.appWidth,
		height: self.appWidth * 9 / 16
	};
	self.videoData[poetnum].size = videoSize;
	self.videoData[poetnum].poem = replaceAll('\n', '<br>', self.videoData[poetnum].poem);
	return template(self.videoData[poetnum]);
};

motf.deployUGC = function(poetnum) {
	var template = Handlebars.compile($('#tempUGCPoetDetail').html());
	return template(self.UGCData[poetnum]);
};

motf.deployMap = function() {
	var template = Handlebars.compile($('#tempMap').html());
	return template();
};

motf.deployInfo = function() {
	var template = Handlebars.compile($('#tempInfo').html());
	var data = {
		width: self.appWidth - 35,
		height: (self.appWidth - 35) * 9 / 16,
		url: self.videoData[0].url
	};
	return template(data);
};

motf.deployCreate = function() {
	var template = Handlebars.compile($('#tempCreate').html());
	return template();
};

motf.deployDetailCreate = function() {
	var template = Handlebars.compile($('#tempDetailCreate').html());
	return template();
};

motf.deployOffline = function() {
	var template = Handlebars.compile($('#tempOffline').html());
	return template();
};

///////////// GO TO //////////////
motf.goToPage = function(pageid) {
	var pageidForMenu;
	if (_.contains(self.pageNoFooter, pageid)) {
		$('footer').hide();
	} else if (_.contains(self.pageFooterNoChange, pageid)) {
		// do nothing
	} else {
		if(pageid == 'pMapAfterUGC' || pageid == 'pMapAfterUGCPoetDetail') {
			pageidForMenu = 'pMap';
		} else {
			pageidForMenu = pageid;
		}
		$('footer').show();
		// RESET ICON
		$('.footerIcon').css({
			'-webkit-filter': 'invert(100%)'
		});
		$('#icon' + pageidForMenu).css({
			'-webkit-filter': 'invert(0%)'
		});
		$('.menuTitle').css({
			color: 'white'
		});
		$('#menu' + pageidForMenu).find('p').css({
			color: 'black'
		});
		// RESET
		$('.menu').removeClass().addClass('menu');
		$('#menu' + pageidForMenu).addClass('menuSelected');
	}
	switch (pageid) {
		case 'pOffline':
			return this.createPage('pOffline', self.deployOffline());
		case 'pLanding':
			var landing = Handlebars.compile($('#tempLanding').html()),
				data = {
					loadText: 'Retrieveing data...'
				};
			return this.createPage('pLanding', landing(data));
		case 'pPoets':
			return this.createPage('pPoetList', self.deployVideoList(self.videoData));
		case 'pPoetDetail':
			return this.createPage('pPoetDetail', self.deployPoet(self.currPoet), 'slide');
		case 'pPoetDetailPrevNext':
			return this.createPage('pPoetDetail', self.deployPoet(self.currPoet));
		case 'pUGCPoetDetail':
			return this.createPage('pUGCPoetDetail', self.deployUGC(self.currUGCData, 'slide'));
		case 'pMap':
			return this.createPage('pMap', self.deployMap());
		case 'pMapAfterUGC':
			return this.createPage('pMapAfterUGC', self.deployMap());
		case 'pMapAfterUGCPoetDetail':
			return this.createPage('pMapAfterUGCPoetDetail', self.deployMap());
		case 'pInfo':
			return this.createPage('pInfo', self.deployInfo());
		case 'pCreate':
			return this.createPage('pCreate', self.deployCreate());
		case 'pDetailCreate':
			return this.createPage('pDetailCreate', self.deployDetailCreate(), 'slide');
	}
};

///////////// END OF GO TO //////////////

motf.createPage = function(pageclass, handlebars, effect) {
	// unbind menu and every pages
	self.unbindAllListeners();
	if (effect == undefined) effect = 'fade';
	var id = makeid();
	this.history.push(id);
	$('.sectionContainer').append('<section class="page ' + pageclass + '" id="' + id + '">' + handlebars + '</section>');
	// effect
	if (effect == 'fade') {
		$('#' + id + '> header').appendTo('.appContainer');
		if (sys.os == 'ios7') {
			$('header').css({
				top: '18px'
			});
		}
		$('#' + id).fadeIn('fast');
	} else if (effect == 'slide') {
		$('#' + id + '> header').appendTo('.appContainer');
		if (sys.os == 'ios7') {
			$('header').css({
				top: '18px'
			});
		}
		$('#' + id).css({
			left: '100%',
			top: 0,
			display: 'block'
		});
		$('#' + id).animate({
			left: 0
		}, 200);
	}

	if (self.history.length > 1) {
		console.log('removing prev page');
		return this.removeBefore(pageclass);
	} else {
		self.bindEvent(pageclass);
		return 'first page created';
	}
};

motf.removeBefore = function(pageclass) {
	// remove prev
	return setTimeout(function(id) {
		console.log(self.history[0] + ' removed');
		$('#' + self.history[0]).remove();
		self.history.shift();
		// bind menu
		self.bindEvent(pageclass);
	}, 300);
};

////////// BIND AND UNBIND ///////////
motf.bindEvent = function(id) {
	self.bindMenu();
	console.log('binding event for ' + id);
	switch (id) {
		case 'pOffline':
			centerEl('#offlineMessage');
			$('#offlineMessage').show();
			$('footer').hide();
			looper = widow.setInterval(function() {
				$.ajax({
					url: 'http://fiddle.jshell.net/favicon.png',
					success: function(data) {
						self.goToPage('pLanding');
					}, error: function() {
						// do nothing hahaha
					}
				});
			}, 5000);
			window.addEventListener('online', function() {
				self.goToPage('pLanding');
			});
			break;
		case 'pLanding':
			self.currPage = 'pLanding';
			centerEl('#fetching');
			parse.fetchVideo();
			break;
		case 'pPoetList':
			if (sys.os == 'ios7') {
				$('#listView').css({
					'padding-bottom': '72px'
				});
			}
			self.currPage = 'pPoets';
			self.currPoet = -1;
			// move to scroll
			$('.page').animate({
				scrollTop: self.poetScroll
			}, 200);
			// track scroll
			$('.page').scroll(function(e) {
				self.poetScroll = $(this).scrollTop();
			});
			// bind click
			$('.listNode').on('tap', function() {
				// add poetNum
				self.currPoet = parseInt($(this).children().children().html());
				return self.goToPage('pPoetDetail');
			});
			break;
		case 'pPoetDetail':
			// bind back, prev, next, map, poem toggle
			$('.poemDetailBack').on('tap', function() {
				self.currPoet = -1;
				self.goToPage(self.currPage);
			});
			$('.poemDetailPrev').on('tap', function() {
				self.isPoemOn = false;
				if (self.currPoet == 0) {
					self.currPoet = 15;
					self.goToPage('pPoetDetailPrevNext');
				} else {
					self.currPoet -= 1;
					self.goToPage('pPoetDetailPrevNext');
				}
			});
			$('.poemDetailNext').on('tap', function() {
				self.isPoemOn = false;
				if (self.currPoet == 15) {
					self.currPoet = 0;
					self.goToPage('pPoetDetailPrevNext');
				} else {
					self.currPoet += 1;
					self.goToPage('pPoetDetailPrevNext');
				}
			});
			$('.readPoem').on('tap', function() {
				if (self.isPoemOn) {
					self.isPoemOn = !self.isPoemOn;
					$('.poem').slideUp('fast', function() {
						// go to top
						$('.page').animate({
							scrollTop: 0
						}, 300);
						$('.readPoem').html('+ Read poem')
							.removeClass('readPoemOn');
					});
				} else {
					self.isPoemOn = !self.isPoemOn;
					$('.readPoem').html('- Read poem')
						.addClass('readPoemOn');
					$('.poem').slideDown('fast', function() {
						// scroll to poem
						$('.page').animate({
							scrollTop: $('.poem').offset().top - 100
						}, 300);
					});
				}
			});
			// init map
			detailMap.init();
			detailMap.zoom(self.currPoet);
			$('#detailNodeMap').on('tap', function() {
				self.goToPage('pMap');
			});
			break;
		case 'pMapAfterUGC':
			self.currPage = 'pMap';
			mapView.init([self.UGCData[self.UGCData.length - 1].lat, self.UGCData[self.UGCData.length - 1].lng]);
			mapView.feedVideo();
			mapView.feedUGC();
			mapView.zoomUGC(self.UGCData.length - 1);
			mapView.detectUserLocation();
			break;
		case 'pMapAfterUGCPoetDetail':
			self.currPage = 'pMap';
			mapView.init([self.UGCData[self.currUGCData].lat, self.UGCData[self.currUGCData].lng]);
			mapView.feedVideo();
			mapView.feedUGC();
			mapView.zoomUGC(self.currUGCData);
			mapView.detectUserLocation();
			break;
		case 'pMap':
			self.currPage = 'pMap';
			// init map
			if (self.currPoet > -1) {
				mapView.init(self.videoData[self.currPoet].geoData);
				mapView.feedVideo();
				mapView.feedUGC();
				mapView.zoom(self.currPoet);
				mapView.detectUserLocation();
			} else {
				mapView.init();
				mapView.feedVideo();
				mapView.feedUGC();
				mapView.detectUserLocation();
			}
			// bind locate btn
			$('#clientLocate').on('tap', function() {
				mapView.clientLocate();
			});
			break;
		case 'pCreate':
			self.currPage = 'pCreate';
			var isBtnhere = false;
			UGCMapView.init();
			// center crosshair
			centerEl('#crosshair');
			UGCMapView.map.on('move', function() {
				if (!isBtnhere) {
					$('#ugcAddPoem').fadeIn('fast').on('tap', function() {
						UGCMapView.capture();
						self.goToPage('pDetailCreate');
					});
					isBtnhere = true;
				}
			});
			break;
		case 'pDetailCreate':
			// fix input
			$('input, textarea').on('tap', function() {
				$(this).focus();
			});
			// center cover
			centerEl('.submitCoverContainer');
			// bind back btn
			$('.ugcBack').on('tap', function() {
				self.goToPage('pCreate');
			});
			$('#ugcCreateBtn').on('tap', function() {
				// hide keyboard
				$('input, textarea').blur();
				setTimeout(function() {
					window.scrollTo(0, 0);
				}, 0);
				// submit UGC
				var ugcTitle = $('#ugcTitle').val(),
					ugcContent = $('#ugcContent').val(),
					ugcAuthor = $('#ugcAuthor').val();

				console.log('### processing UGC');
				// check
				if (ugcTitle.length > 3 && ugcContent.length > 3 && ugcAuthor.length < 20) {
					// store
					parse.storeUGC(UGCMapView.lat, UGCMapView.lng, ugcAuthor, ugcTitle, ugcContent);
				} else if (ugcContent.length < 4) {
					if (sys.os == 'web') {
						alert('Your input is too short. Please try again.');
					} else {
						navigator.notification.alert(
							'Please enter a longer poem.',
							function() {},
							'Poem Too Short',
							'OK');
					}

				} else if (ugcTitle.length < 4) {
					if (sys.os == 'web') {
						alert('Your input is too short. Please try again.');
					} else {
						navigator.notification.alert(
							'Please enter a longer title.',
							function() {},
							'Title Too Short',
							'OK');
					}

				} else if (ugcAuthor.length > 20) {
					if (sys.os == 'web') {
						alert('Your input is too short. Please try again.');
					} else {
						navigator.notification.alert(
							'Please enter a shorter name.',
							function() {},
							'Name Too Long',
							'OK');
					}

				}
			});
			break;
		case 'pUGCPoetDetail':
			// bind back
			$('.UGCPoemDetailBack').on('tap', function() {
				console.log('tap on UGC detail back btn');
				self.goToPage('pMapAfterUGCPoetDetail');
			});
			break;
	}
};

motf.bindMenu = function() {
	console.log('binding menu');
	$('.menu').on('tap', function() {
		var title = $(this).attr('title');
		self.currPoet = -1;
		self.goToPage(title);
	});
};

motf.unbindAllListeners = function() {
	$('*').unbind('tap');
	$('#ugcAddPoem').hide();
	detailMap.map = null;
	mapView.map = null;
	UGCMapView.map = null;
	$('#submitCover').hide();
	$('header').remove();
	window.clearInterval(looper);
};


////////// INIT ///////////

var sys = {
	os: null,
	init: function() {
		// CHECK SYSTEM
		sys.os = checkSystem();
		if (sys.os == 'web') { // IF WEB, then init web
			motf.init();
		} else if (sys.os == 'ios7') {
			// edit css
			$('.sectionContainer').addClass('ios7');
			sys.bindEvents();
		} else {
			sys.bindEvents();
		}
	},
	bindEvents: function() {
		document.addEventListener('deviceready', this.onDeviceReady, false);
	},
	onDeviceReady: function() {
		motf.init();
		sys.receivedEvent('geolocation');
	},
	receivedEvent: function(id) {
		// alert(id);
		var onSuccess = function(position) {
			alert('Latitude: ' + position.coords.latitude + '\n' +
				'Longitude: ' + position.coords.longitude + '\n' +
				'Altitude: ' + position.coords.altitude + '\n' +
				'Accuracy: ' + position.coords.accuracy + '\n' +
				'Altitude Accuracy: ' + position.coords.altitudeAccuracy + '\n' +
				'Heading: ' + position.coords.heading + '\n' +
				'Speed: ' + position.coords.speed + '\n' +
				'Timestamp: ' + position.timestamp + '\n');
		};

		function onError(error) {
			alert('code: ' + error.code + '\n' +
				'message: ' + error.message + '\n');
		}
		// navigator.geolocation.getCurrentPosition(onSuccess, onError);
	}
};
sys.init();