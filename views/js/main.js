/************************
 * 전역변수
 ************************/
var chartColArr = [];

/************************
 * 화면 레이아웃
 ************************/
$(window).resize(function () {
	var h = $(window).height(),
	//offsetTop = 120; // Calculate the top offset
	offsetTop = 520; // Calculate the top offset
	$('#map1').css('height', (h - offsetTop));
}).resize();

/************************
 * Leaflet MAP
 ************************/
var LeafletMap = function(where) {

	this.thurmalLayer = new L.featureGroup([]);
	this.atTempLayer = new L.featureGroup([]);
	this.popupLayer = new L.featureGroup([]);

	this.thurmalIcon = L.icon({
		iconUrl: 'images/editmarker.png',
		shadowUrl: 'images/editmarker-shadow.png',
		iconSize: [11, 11],
		iconAnchor: [6, 6]
	});

	this.map = L.map(where, {
		crs: L.Proj.CRS.TMS.Daum,
		continuousWorld: true,
		worldCopyJump: false,
		zoomControl: true,
		layers: [this.thurmalLayer, this.atTempLayer, this.popupLayer]
	});

	L.Proj.TileLayer.TMS.provider('DaumMap.Street').addTo(this.map);
	this.map.setView([36,127.5], 2);
	L.control.scale().addTo(this.map);
	var overlayMaps = {
		"적외선 온도" : this.thurmalLayer,
		"대기 온도" : this.atTempLayer
	};
	L.control.layers(null, overlayMaps, {collapsed: false}).addTo(this.map);
};

LeafletMap.prototype.addMarker = function(lat, lon) {
	new L.marker([lat, lon]).addTo(this.map);
};

LeafletMap.prototype.addThurmalIcon = function(lat, lon) {
	new L.marker([lat, lon], {icon: this.thurmalIcon}).addTo(this.map);
};

LeafletMap.prototype.fitMap = function() {
	this.map.fitBounds(this.thurmalLayer);
};

LeafletMap.prototype.clearLayers = function() {
	this.thurmalLayer.clearLayers();
	this.atTempLayer.clearLayers();
	this.popupLayer.clearLayers();
};

LeafletMap.prototype.drawAllDocs = function(db, dbName) {

	var _this = this;

	if (!db) {
		console.error("데이터베이스가 인스턴스화 되지 않았습니다.");
		return;
	}

	db.getAllDocs(dbName, function(docs) {
		var thurmalPoints = [];
		var atTempPoints = [];
		var xTArr = ["x"], dataT1 =["대기온도"], dataT2=["노면온도"], dataT3=["대기습도"];
		var xAArr = ["x"], dataA1 =["ch1"], dataA2=["ch2"];

		for (var i = 0 , len = docs.length ; i < len ; i++) {
			var type = docs[i].id.split('_')[0];

			if (type.search("thurmal") > -1) {
				var ll = new L.LatLng(docs[i].doc.lat, docs[i].doc.lon);
				ll.temp = Number(docs[i].doc.temp);
				ll.mois = docs[i].doc.mois;
				ll.rsTemp = docs[i].doc.rsTemp;
				ll.title = "적외선 온도";
				ll.ch1 = docs[i].doc.ch1;
				ll.ch2 = docs[i].doc.ch2;
				ll.dist = docs[i].doc.dist;
				thurmalPoints.push(ll);
				xTArr.push(Math.round(ll.dist)/1000);
				dataT1.push(ll.temp);
				dataT2.push(ll.rsTemp);
				dataT3.push(ll.mois);
			}

			if (type.search("atTemp") > -1) {
				var ll = new L.LatLng(docs[i].doc.lat, docs[i].doc.lon);
				ll.temp = Number(docs[i].doc.ch1);
				ll.title = "대기 온도";
				ll.dist = docs[i].doc.dist;
				atTempPoints.push(ll);
				xAArr.push(Math.round(ll.dist)/1000);
				dataA1.push(ll.temp);
				dataA2.push(Number(docs[i].doc.ch2));
			}
		}

		//if 적외선 데이타 일경우
		chartColArr.push(xTArr); 		chartColArr.push(dataT1); 		chartColArr.push(dataT2);  chartColArr.push(dataT3);
		var chartDataJson = {x: 'x', columns: chartColArr, count:10};
		chartDataJson.axes = { "대기온도":'y', "노면온도":'y', "대기습도": 'y2'	}	;
		var y2label =true;
		//if 적외선이 아닐 경우
		//chartColArr.push(xAArr); 		chartColArr.push(dataA1); 		chartColArr.push(dataA2);  
		//var y2label =false;
		//console.log(chartColArr);

		var lineChart1 = c3.generate({
				bindto: '#lineChart1',
				data: chartDataJson,
				axis: {
								x: { label: '거리(km)'},
								y: {	label: '온도(℃)'},
								y2: {	show: y2label, label: '습도(%)'}
						},
				onclick: function (d, i) { console.log("onclick", d, i); }
		});

		var prevOptionIdx = getOptions(atTempPoints[0].temp).index;
		var segmentLatLon = [atTempPoints[0]];

		for (var i = 1, len = atTempPoints.length ; i < len ; i++) {
			var option = getOptions(atTempPoints[i].temp);
			segmentLatLon.push(atTempPoints[i]);

			if (prevOptionIdx !== option.index || i == len -1) {
				_this.atTempLayer.addLayer(
					new L.Polyline(segmentLatLon, {"color" : option.color})
				);

				prevOptionIdx = option.index;
				segmentLatLon = [atTempPoints[i]];
			}
		}

		prevOptionIdx = getOptions(thurmalPoints[0].temp).index;
		segmentLatLon = [thurmalPoints[0]];

		for (var i = 1, len = thurmalPoints.length ; i < len ; i++) {
			var option = getOptions(thurmalPoints[i].temp);
			segmentLatLon.push(thurmalPoints[i]);

			if (prevOptionIdx !== option.index || i == len -1) {
				_this.thurmalLayer.addLayer(
					new L.Polyline(segmentLatLon, {"color" : option.color})
				);

				prevOptionIdx = option.index;
				segmentLatLon = [thurmalPoints[i]];
			}
		}

		_this.map.fitBounds(thurmalPoints);

		for (var i = 0, len = thurmalPoints.length - 1 ; i < len ; i++) {
			_this.popupLayer.addLayer(
				(new L.Polyline([thurmalPoints[i], thurmalPoints[i+1]], {"weight": 20, "opacity": 0}))
					.bindPopup("적외선 장비<br/>" + 
							   "대기온도 : " + thurmalPoints[i].temp + "<br/>" +
							   "대기습도 : " + thurmalPoints[i].mois + "<br/>" +
							   "노면온도 : " + thurmalPoints[i].rsTemp + "<br/>" +
							   "<br/>" + 
							   "대기온도 장비<br/>" +
							   "채널1 : " + thurmalPoints[i].ch1 + "<br/>" + 
							   "채널2 : " + thurmalPoints[i].ch2)
			);
		}
	});
};


/************************
 * 데이터베이스
 ************************/
var CouchDB = function(url) {
	this.url = url
};

CouchDB.prototype.getDbList = function(callback) {
	$.ajax({
		type: "GET",
		dataType: "json", 
		url: this.url + '/_all_dbs',
		success: function(data) {
			callback(data);
		},
		error: function(e) {
			alert(e.responseJSON.reason);
		}
	});
};

CouchDB.prototype.setDbList = function(callback) {
	$.ajax({
		type: "GET",
		dataType: "json", 
		url: this.url + '/_all_dbs',
		success: function(data) {
			$("#dbList").empty();
			var firstDb;
			data.forEach(function(name, i) {
				if(name.indexOf("obd_") >= 0) {
					var subName = name.substr(4, name.length-1);
					appendListItem("#dbList", subName, subName);
					if (!firstDb) {
						firstDb = subName;
					}
				}
			});
			if (firstDb) callback(firstDb);
		},
		error: function(e) {
			alert(e.responseJSON.reason);
		}
	});
};

CouchDB.prototype.createDb = function(dbName, callback) {
	$.ajax({
		type: "PUT",
		dataType: "json",
		url: this.url + "/obd_" + dbName,
		success: function(result) {
			callback(null, dbName);
		}, 
		error: function(e) {
			alert(e.responseJSON.reason);
		}
	});
};

CouchDB.prototype.deleteDb = function(dbName, callback) {
	$.ajax({
		type: "DELETE",
		dataType: "json",
		url: this.url + "/obd_" + dbName,
		success: function(result) {
			callback(null, result);
		}, 
		error: function(e) {
			alert(e.responseJSON.reason);
		}
	});
};

CouchDB.prototype.bulkInsert = function(dbName, docs, callback) {

	$.ajax({
		type: "POST", 
		contentType: "application/json",
		dataType: "json",
		url: this.url + "/obd_" + dbName + "/_bulk_docs",
		data: JSON.stringify({"docs": docs}),
		success: function(result) {
			if (callback) {
				callback(result);
			}
		},
		error : function(e) {
			alert(e.responseJSON.reason);
		}
	});
};

CouchDB.prototype.getAllDocs = function(dbName, callback) {
	$.ajax({
		type: "GET", 
		dataType: "json",
		url: this.url + "/obd_" + dbName + "/_all_docs?include_docs=true",
		success: function(result) {
			callback(result.rows);
		},
		error : function(e) {
			alert(e.responseJSON.reason);
		}
	});
};

function getOptions(temp) {
	var legend = [20, 22, 24, 26, 28, 30];
	var colors = ['#000066', '#330066', '#660066', '#990066', '#CC0066', '#ff0066'];

	for (var i = 0, len = legend.length ; i < len ; i++) {
		if (temp <= legend[i]) {
			return {"index" : i, "color" : colors[i]};
		}
	}
	return {"index" : legend.length -1, "color" : colors[legend.length-1]};
}

/************************
 * main
 ************************/
var leafletMap = new LeafletMap('map1');
var dbUrl = "http://localhost:5984";
var database = new CouchDB(dbUrl);

database.getDbList(function(list) {
	$("#dbList").empty();
	list.forEach(function(name, i) {
		if(name.indexOf("obd_") >= 0) {
			var subName = name.substr(4, name.length-1);
			appendListItem("#dbList", subName, subName);
		}
	});

	var dbName = $("#dbList").val();

	if (dbName) {
		leafletMap.drawAllDocs(database, dbName);
	}
});

