/////////////// MAP ////////////////
var southEast = new L.LatLng(40.780899, -73.840369),
    northWest = new L.LatLng(40.845863, -73.924432),
    bounds = new L.LatLngBounds(southEast, northWest);
var mapView = {
    lat: null,
    lng: null,
    newLatLng: null,
    map: null,
    myPos: null,
    videoNodes: null,
    UGCNode: null,
    zoomUGC: function(num) {
        mapView.map.invalidateSize();
        mapView.map.setView([motf.UGCData[num].lat, motf.UGCData[num].lng], 15);
        mapView.UGCNode[num].openPopup();
        // mapView.map.invalidateSize();
    },
    zoom: function(num) {
        mapView.map.setView(motf.videoData[num].geoData, 16);
        mapView.map.invalidateSize();
        mapView.videoNodes[num].openPopup();
    },
    init: function(geoarray) {
        if (geoarray == undefined) {
            geoarray = [40.816911, -73.887223];
        }
        console.log('map init');
        this.map = new L.map('map', {
            center: geoarray,
            minZoom: 14,
            zoom: 15,
            zoomControl: false
        });
        // set map bound
        this.map.setMaxBounds(bounds);

        // user
        L.tileLayer('http://a.tiles.mapbox.com/v3/palaa159.gaehc27p/{z}/{x}/{y}.png', {
            detectRetina: true,
            reuseTiles: true
        }).addTo(mapView.map);
        mapView.myPos = new L.circleMarker([0, 0], {
            stroke: false,
            fillColor: '#fb0005',
            fillOpacity: 1,
            radius: 5
        }).bindPopup('This is YOU').addTo(mapView.map);
        mapView.map.invalidateSize();
    },
    detectUserLocation: function() {
        // console.log('### detecting location');
        if (navigator.geolocation) {
            var timeoutVal = 10 * 1000 * 1000;
            navigator.geolocation.watchPosition(
                mapView.mapToPosition,
                alertError, {
                    enableHighAccuracy: true,
                    timeout: timeoutVal,
                    maximumAge: 0
                });
        } else {
            alert("Geolocation is not supported by this browser");
        }

        function alertError(error) {
            var errors = {
                1: 'Permission denied',
                2: 'Position unavailable',
                3: 'Request timeout'
            };
            if (sys.os == 'web') {
                alert('Geolocation error');
            } else {
                // navigator.notification.alert('Error: Geolocation not detected',
                //     function() {},
                //     'Memories of the Future',
                //     'Dismiss');
            }
        }
    },
    mapToPosition: function(position) {
        mapView.lng = position.coords.longitude;
        mapView.lat = position.coords.latitude;
        mapView.newLatLng = new L.LatLng(mapView.lat, mapView.lng);
        mapView.myPos.setLatLng(mapView.newLatLng);
        // check if myPos is in rect
        if (bounds.contains(mapView.newLatLng)) {
            $('#clientLocate').fadeIn();
        } else {
            $('#clientLocate').fadeOut();
        }
        // $('#locatingBox').fadeOut();
        mapView.mapFullOpacity();
        // mapView.map.invalidateSize();
    },
    feedVideo: function() {
        // console.log('$$$ feeding >>> VIDEO');
        mapView.videoNodes = [];
        $.each(motf.videoData, function(i, v) {
            var nodeID = v.ID;
            // remove i = 0
            if (i !== 0)
                mapView.videoNodes[i] = L.marker(v.geoData, {})
                    .bindLabel(nodeID.toString(), {
                        noHide: true
                    })
                    .bindPopup('<a onclick="mapView.setCurrDataOnMap(' + i + ');">  <div id="chevron"></div>    <div class="contextualView">' + v.author + '<br>' + v.address + '</div></a>')
                    .addTo(mapView.map);
        });
        mapView.map.invalidateSize();
    },
    feedUGC: function() {
        // console.log('$$$ feeding >>> UGC');
        mapView.UGCNode = [];
        $.each(motf.UGCData, function(i, v) {
            // d(JSON.stringify(v));
            if (v.approval) {
                mapView.UGCNode[i] = L.marker([v.lat + 0.001, v.lng], {
                    icon: mapView.UGCIcon
                })
                    .bindPopup('<a onclick="mapView.setCurrUGCData(' + i + ');"><div id="chevron"></div><div class="contextualView">' + v.title + '</div></a>')
                    .addTo(mapView.map);
            }
        });
    },
    setCurrDataOnMap: function(i) {
        motf.currPoet = i;
        motf.goToPage('pPoetDetail');
    },
    setCurrUGCData: function(i) {
        motf.currUGCData = i;
        motf.goToPage('pUGCPoetDetail');
    },
    videoIcon: L.icon({
        iconUrl: 'js/vendor/images/marker-icon-2x.png',
        iconSize: [20, 32], // size of the icon
        // shadowSize:   [50, 64], // size of the shadow
        iconAnchor: [18, 18], // point of the icon which will correspond to marker's location
        // shadowAnchor: [4, 62],  // the same for the shadow
        popupAnchor: [-6, -15] // point from which the popup should open relative to the iconAnchor

    }),
    UGCIcon: L.icon({
        iconUrl: 'js/vendor/images/ugc-icon-2x.png',
        iconSize: [19, 30], // size of the icon
        // shadowSize:   [50, 64], // size of the shadow
        // iconAnchor: [12, 55], // point of the icon which will correspond to marker's location
        // shadowAnchor: [4, 62],  // the same for the shadow
        popupAnchor: [0, -15] // point from which the popup should open relative to the iconAnchor
    }),
    clientLocate: function() {
        mapView.map.setView(mapView.newLatLng, 16);
    },
    mapHalfOpacity: function() {
        $('#map').animate({
            'opacity': 0.5
        });
    },
    mapFullOpacity: function() {
        $('#map').animate({
            'opacity': 1
        });
    }
};

// DETAIL MAP
var detailMap = {
    map: null,
    marker: null,
    init: function() {
        this.map = L.map('detailNodeMap', {
            dragging: false,
            touchZoom: false,
            tap: false,
            doubleClickZoom: false,
            center: motf.videoData[0].geoData,
            zoomControl: false,
            zoom: 15
        });
        L.tileLayer('http://a.tiles.mapbox.com/v3/palaa159.gaehc27p/{z}/{x}/{y}.png', {
            detectRetina: true,
            reuseTiles: true
        }).addTo(detailMap.map);
        detailMap.marker = L.marker(motf.videoData[0].geoData)
            .bindLabel(motf.videoData[0].ID.toString(), {
                noHide: true
            });
        detailMap.map.addLayer(detailMap.marker);
        detailMap.map.invalidateSize();
    },
    zoom: function(num) {
        // delete all markers
        detailMap.map.removeLayer(detailMap.marker);

        detailMap.marker = L.marker(motf.videoData[num].geoData)
            .bindLabel(motf.videoData[num].ID.toString(), {
                noHide: true
            });
        detailMap.map.addLayer(detailMap.marker);
        detailMap.map.setView(motf.videoData[num].geoData, 16);
    }
};

// UGC MAP VIEW
var UGCMapView = {
    map: null,
    lat: null,
    lng: null,
    init: function() {
        this.map = new L.Map('ugcMap', {
            center: [40.816911, -73.887223],
            minZoom: 14,
            zoom: 15,
            zoomControl: false
        });
        // set map bound
        this.map.setMaxBounds(bounds);
        // user
        L.tileLayer('http://a.tiles.mapbox.com/v3/palaa159.gaehc27p/{z}/{x}/{y}.png', {
            detectRetina: true,
            reuseTiles: true
        }).addTo(this.map);
        $('#ugcMap').animate({
            opacity: 1
        });
    },
    capture: function() {
        var centerW = $('#ugcMap').width() / 2,
            centerH = $('#ugcMap').height() / 2 + 13;
        this.lat = this.map.containerPointToLatLng([centerW, centerH]).lat;
        this.lng = this.map.containerPointToLatLng([centerW, centerH]).lng;
        console.warn('@@@ capture >>> ' + this.lat + ', ' + this.lng);
    }
};

/////////////// PARSE ////////////////

var parse = {
    videoObj: Parse.Object.extend('firstPhase'),
    UGCObj: Parse.Object.extend('ugc'),
    video: null,
    UGC: null,

    init: function() {
        Parse.initialize('LcwUW1mhSbxh25gcPfHKFENrbt6YegsB8bxF5VJZ', 'lewWw2HFlo1kk9qnJy1y1OrWfZGVNjSTjAfqRF8e');
        this.video = new this.videoObj();
        this.UGC = new this.UGCObj();
    },
    fetchVideo: function() {
        console.log('fetching video');
        this.video.fetch({
            success: function(object) {
                motf.videoData = sortByKey(object._serverData.results, 'ID');
                parse.fetchUGC();
                motf.goToPage('pPoets');
            },
            error: function(model, error) {
                motf.goToPage('pOffline');
            }
        });
    },
    fetchUGC: function(data) {
        console.log('fetch UGC');
        this.UGC.fetch({
            success: function(object) {
                // console.log(JSON.stringify(object));
                motf.UGCData = null;
                motf.UGCData = object._serverData.results;
                // console.log(' after fetchUGC: ' + G.UGCData.length);
                if (data) {
                    $('#submitCover').fadeOut('fast', function() {
                        motf.goToPage('pMapAfterUGC');
                    });
                }
            },
            error: function(model, error) {
                // alert(model + error);
                // console.warn('##########ERROR##########');
                motf.UGCData = null;
                motf.goToPage('pOffline');
                // alert('error retrieving data, please restart the app');
            }
        });
    },
    storeUGC: function(lat, lng, author, title, content) {
        console.log('storing ' + lat, lng, author, title, content);
        // loading session page with cancel
        $('#submitCover').fadeIn();

        parse.UGC.save({
            lat: lat - 0.0009,
            lng: lng,
            author: author,
            title: title,
            content: content,
            approval: true
        }, {
            success: function(object) {
                $('#ugcTitle').val('');
                $('#ugcContent').val('');
                $('#ugcAuthor').val('');
                parse.init();
                setTimeout(function() {
                    parse.fetchUGC(true);
                }, 3000);
            },
            error: function(model, err) {
                navigator.notification.alert(
                    'There is something wrong with the server, Your poem is not stored',
                    function() {
                        motf.goToPage('pageMap');
                    },
                    'Memories of the Future',
                    'Dismiss');
            }
        });
    }
};

var checkSystem = function() {
    // console.log('checking system');
    // check if iOS7
    var IOS = /(iPad|iPhone|iPod)/g.test(navigator.userAgent), // return true, false
        IOS7 = /(iPad|iPhone);.*CPU.*OS 7_\d/i.test(navigator.userAgent), // return true, false
        ua = navigator.userAgent.toLowerCase(),
        ANDROID = ua.indexOf("android") > -1; // return true, false
    if (!IOS && !IOS7 && !ANDROID) {
        // return WEB
        return 'web';
    } else if (IOS7) {
        // return IOS7
        return 'ios7';
    } else if (!IOS7 && IOS) {
        // return IOS6
        return 'ios6';
    } else if (ANDROID) {
        // return ANDR
        return 'android';
    }
};

//////////// HELPERS //////////////
var sortByKey = function(array, key) {
    return array.sort(function(a, b) {
        var x = a[key];
        var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
},
    replaceAll = function(find, replace, str) {
        return str.replace(new RegExp(find, 'g'), replace);
    },
    makeid = function() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < 5; i++)
            if (i == 0) {
                text += possible.charAt(Math.floor(Math.random() * possible.length - 11));
            } else {
                text += possible.charAt(Math.floor(Math.random() * possible.length));
            }

        return text;
    },
    centerEl = function(el) {
        return $(el).css({
            position: 'absolute',
            left: motf.appWidth / 2 - $(el).outerWidth() / 2,
            top: motf.appHeight / 2 - $(el).outerHeight() / 2
        });
    };

///////////// HANDLEBARS /////////////
Handlebars.registerHelper('compare', function(lvalue, operator, rvalue, options) {

    var operators, result;

    if (arguments.length < 3) {
        throw new Error("Handlerbars Helper 'compare' needs 2 parameters");
    }

    if (options === undefined) {
        options = rvalue;
        rvalue = operator;
        operator = "===";
    }

    operators = {
        '==': function(l, r) {
            return l == r;
        },
        '===': function(l, r) {
            return l === r;
        },
        '!=': function(l, r) {
            return l != r;
        },
        '!==': function(l, r) {
            return l !== r;
        },
        '<': function(l, r) {
            return l < r;
        },
        '>': function(l, r) {
            return l > r;
        },
        '<=': function(l, r) {
            return l <= r;
        },
        '>=': function(l, r) {
            return l >= r;
        },
        'typeof': function(l, r) {
            return typeof l == r;
        }
    };

    if (!operators[operator]) {
        throw new Error("Handlerbars Helper 'compare' doesn't know the operator " + operator);
    }

    result = operators[operator](lvalue, rvalue);

    if (result) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }

});

//Note: this example assumes jQuery is available on your site. 
Retina = function() {
    return {
        init: function() {
            //Get pixel ratio and perform retina replacement
            //Optionally, you may also check a cookie to see if the user has opted out of (or in to) retina support
            var pixelRatio = !! window.devicePixelRatio ? window.devicePixelRatio : 1;
            if (pixelRatio > 1) {
                $("img").each(function(idx, el) {
                    el = $(el);
                    if (el.attr("data-src2x")) {
                        el.attr("data-src-orig", el.attr("src"));
                        el.attr("src", el.attr("data-src2x"));
                    }
                });
            }
        }
    };
}();
//Init
Retina.init();