/************************
 * 전역변수
 ************************/
var _TOTAL_DATABASE = "total_data";
var sharedObject = {
	database : _TOTAL_DATABASE,
	viewType : "thurmal",
	totalDocs : undefined,
	onStartClip: false,
	onEndClip: false,
	sTime: undefined,
	eTime: undefined,
	startIcon: undefined,
	endIcon: undefined
};

/************************
 * 화면 레이아웃
 ************************/
$(window).resize(function () {
	var h = $(window).height(),
	offsetTop = 500; // Calculate the top offset
	$('#map1').css('height', (h - offsetTop));

	$('#thurmalTable').bootstrapTable('resetView', { height: getHeightByDiv("#thurmalChart") });
	$('#atTempTable').bootstrapTable('resetView', { height: getHeightByDiv("#thurmalChart") });
}).resize();

/************************
 * Leaflet MAP
 ************************/
var LeafletMap = function(where) {

	this.thurmalLayer = new L.featureGroup([]);
	this.atTempLayer = new L.featureGroup([]);
	this.thurmalPoints = [];
	this.atTempPoints = [];

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
		layers: [this.thurmalLayer]
	});

	L.Proj.TileLayer.TMS.provider('DaumMap.Street').addTo(this.map);
	this.map.setView([36,127.5], 2);
	L.control.scale().addTo(this.map);
	var overlayMaps = {
		"적외선 온도" : this.thurmalLayer,
		"대기 온도" : this.atTempLayer
	};
	L.control.layers(overlayMaps, null, {collapsed: false}).addTo(this.map);

	this.startBtn = L.easyButton('<span>S</span>', function() {
		if (sharedObject.onStartClip) {
			sharedObject.onStartClip = false;
			this.button.style.backgroundColor = "#fff";
		} else {
			sharedObject.onStartClip = true;
			this.button.style.backgroundColor = "#EAC669";
		}
	}, "부분입력: 시작점").addTo(this.map);

	this.endBtn = L.easyButton('<span>E</span>', function() {
		if (sharedObject.onEndClip) {
			sharedObject.onEndClip = false;
			this.button.style.backgroundColor = "#fff";
		} else {
			sharedObject.onEndClip = true;
			this.button.style.backgroundColor = "#EAC669";
		}
	}, "부분입력: 종료점").addTo(this.map);
};

LeafletMap.prototype.btnOff = function(type) {
	if (type.indexOf("start") > -1) {
		this.startBtn.button.style.backgroundColor = "#fff";
		sharedObject.onStartClip = false;
	}
	else if (type.indexOf("end") > -1) {
		this.endBtn.button.style.backgroundColor = "#fff";
		sharedObject.onStartClip = false;
	}
};

LeafletMap.prototype.addDefaultMarker = function(lat, lon) {
	return new L.marker([lat, lon]).addTo(this.map);
};

LeafletMap.prototype.addStartIcon = function(latlng) {
	var startIcon = new L.Icon({
		iconUrl: 'images/markerS.png',
		iconAnchor: [10, 30]
	});
	sharedObject.startIcon = new L.marker(latlng, {icon: startIcon}).addTo(this.map);
};
LeafletMap.prototype.addEndIcon = function(latlng) {
	var endIcon = new L.Icon({
		iconUrl: 'images/markerE.png',
		iconAnchor: [10, 30]
	});
	sharedObject.endIcon = new L.marker(latlng, {icon: endIcon}).addTo(this.map);
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
};

LeafletMap.prototype.drawAllDocs = function(docs) {

	this.thurmalPoints = [];
	this.atTempPoints = [];

	for (var i = 0 , len = docs.length ; i < len ; i++) {
		var types = docs[i].id.split('_');

		if (types[0].search("thurmal") > -1) {
			var ll = new L.LatLng(docs[i].doc.lat, docs[i].doc.lon);
			ll.temp = Number(docs[i].doc.temp);
			ll.mois = docs[i].doc.mois;
			ll.rsTemp = docs[i].doc.rsTemp;
			ll.title = "적외선 온도";
			ll.dist = docs[i].doc.dist;
			ll.time = types[1];
			this.thurmalPoints.push(ll);
		}

		if (types[0].search("atTemp") > -1) {
			var ll = new L.LatLng(docs[i].doc.lat, docs[i].doc.lon);
			ll.temp = Number(docs[i].doc.ch1);
			ll.title = "대기 온도";
			ll.ch1 = docs[i].doc.ch1;
			ll.ch2 = docs[i].doc.ch2;
			ll.dist = docs[i].doc.dist;
			ll.time = types[1];
			this.atTempPoints.push(ll);
		}
	}

	var option, popup;
	for (var i = 0, len = this.atTempPoints.length - 1 ; i < len ; i++) {
		option = getOptions(this.atTempPoints[i].temp);
		popup = L.popup()
					.setLatLng(this.atTempPoints[i])
					.setContent("대기온도 장비<br/>" +
						   "채널1 : " + this.atTempPoints[i].ch1 + "<br/>" + 
						   "채널2 : " + this.atTempPoints[i].ch2);
		popup.time = this.atTempPoints[i].time;
		this.atTempLayer.addLayer(
			(new L.Polyline([this.atTempPoints[i], this.atTempPoints[i+1]], {"color": option.color, "lineCap": "butt"})).bindPopup(popup)
		);
	}

	for (var i = 0, len = this.thurmalPoints.length - 1 ; i < len ; i++) {
		option = getOptions(this.thurmalPoints[i].temp);
		popup = L.popup()
					.setLatLng(this.thurmalPoints[i])
					.setContent("적외선 장비<br/>" + 
						   "대기온도 : " + this.thurmalPoints[i].temp + "<br/>" +
						   "대기습도 : " + this.thurmalPoints[i].mois + "<br/>" +
						   "노면온도 : " + this.thurmalPoints[i].rsTemp);
		popup.time = this.thurmalPoints[i].time;

		this.thurmalLayer.addLayer(
			(new L.Polyline([this.thurmalPoints[i], this.thurmalPoints[i+1]], {"color": option.color, "lineCap": "butt"}))
				.bindPopup(popup)
		);
	}

	this.map.fitBounds(this.thurmalPoints);
};

/************************
 * 데이터베이스
 ************************/
var CouchDB = function(url, baseName) {
	this.url = url
	this.baseName = baseName;
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
			callback(e, null);
		}
	});
};
CouchDB.prototype.getDb = function(dbName, callback) {
	var _this = this;
	$.ajax({
		type: "GET",
		dataType: "json", 
		url: this.url + "/obd_" + dbName,
		success: function(data) {
			callback(null, data);
		},
		error: function(e) {
			callback(e, null);
		}
	});
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
			callback(null, result.rows);
		},
		error : function(e) {
			callback(e, null);
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
 * C3 Chart
 ************************/
var C3LineChart = function() {
	this.thurmalDiv = "#thurmalChart";
	this.atTempDiv = "#atTempChart";

	this.thurmalAxis = {
		x:  { label: '거리(km)'},
		y:  { label: '온도(℃)'},
		y2: { show: true, label: '습도(%)'}
	};

	this.atTempAxis = {
		x:  { label: '거리(km)'},
		y:  { label: '온도(℃)'}
	};

	this.xTArr = ['x'], this.dataT1 =["대기온도"], this.dataT2=["노면온도"], this.dataT3=["대기습도"];
	this.xAArr = ["x"], this.dataA1 =["채널1"], this.dataA2=["채널2"];
};

C3LineChart.prototype.drawChart = function(docs) {

	for (var i = 0 , len = docs.length ; i < len ; i++) {
		var type = docs[i].id.split('_')[0];
		if (type.search("thurmal") > -1) {
			this.xTArr.push(Math.round(Number(docs[i].doc.dist))/1000);
			this.dataT1.push(Number(docs[i].doc.temp));
			this.dataT2.push(docs[i].doc.rsTemp);
			this.dataT3.push(docs[i].doc.mois);
		}
		if (type.search("atTemp") > -1) {
			this.xAArr.push(Math.round(Number(docs[i].doc.dist))/1000);
			this.dataA1.push(Number(docs[i].doc.ch1));
			this.dataA2.push(Number(docs[i].doc.ch2));
		}
	}

	this.thurmalChart = c3.generate({
					bindto: this.thurmalDiv,
					data: {
						x: "x", 
						count: 10,
						axes: { "대기온도":'y', "노면온도":'y', "대기습도": 'y2'},
						columns: [ this.xTArr, this.dataT1, this.dataT2, this.dataT3 ]
					},
					axis: this.thurmalAxis
				});
	this.atTempChart = c3.generate({
					bindto: this.atTempDiv,
					data: {
						x: "x", 
						count: 10,
						axes: { "대기온도":'y', "노면온도":'y'},
						columns: [ this.xAArr, this.dataA1, this.dataA2 ]
					},
					axis: this.atTempAxis
				});

	this.loadByType();
};

C3LineChart.prototype.loadByType = function() {

	if (sharedObject.viewType.indexOf("thurmal") > -1) {
		$(this.atTempDiv).parent().attr('class', 'col-sm-6 hide');
		$(this.thurmalDiv).parent().attr('class', 'col-sm-6 show');
	}

	if (sharedObject.viewType.indexOf("atTemp") > -1) {
		$(this.thurmalDiv).parent().attr('class', 'col-sm-6 hide');
		$(this.atTempDiv).parent().attr('class', 'col-sm-6 show');
	}
};

/************************
 * Bootstrap-Table
 ************************/
var BootTable = function() {
	this.div = "#dataTable";

	this.thurmalColumns = [];
	this.atTempColumns = [];
	this.thurmalTData = [];
	this.atTempTData = [];
};

BootTable.prototype.loadByType = function() {
	$(this.div).bootstrapTable('destroy');

	if (sharedObject.viewType.indexOf("thurmal") > -1) {
		$(this.div).bootstrapTable({
			height: getHeightByDiv("#thurmalChart"),
			classes: 'table table-condensed table-striped',
			columns: this.thurmalColumns,
			data: this.thurmalTData
		});
	}

	if (sharedObject.viewType.indexOf("atTemp") > -1) {
		$(this.div).bootstrapTable({
			height: getHeightByDiv("#atTempChart"),
			classes: 'table table-condensed table-striped',
			columns: this.atTempColumns,
			data: this.atTempTData
		});
	}
};

BootTable.prototype.buildTableData = function(docs) {

	var ttlen = 0;
	var atlen = 0;
	var type, date, ms, yymmdd, hhmmss;

	for (var i = 0 , len = docs.length ; i < len ; i++) {
	//for (var i = 0 , len = 1 ; i < len ; i++) {
		type = docs[i].id.split('_')[0];
		date = docs[i].id.split('_')[1];

		yymmdd = date.substring(0, 8);
		hhmmss = date.substring(8, 10) + ":" + date.substring(10, 12) + ":" + date.substring(12, 14)

		if (type.search("thurmal") > -1) {
			ms = docs[i].id.split('_')[2];
			hhmmss += "." + ms;

			this.thurmalTData.push({
				id: ++ttlen,
				yymmdd: yymmdd,
				hhmmss: hhmmss,
				temp: docs[i].doc.temp,
				rsTemp: docs[i].doc.rsTemp,
				mois: docs[i].doc.mois,
				dist: Math.round(Number(docs[i].doc.dist))/1000
			});
		}
		if (type.search("atTemp") > -1) {
			this.atTempTData.push({
				id: ++atlen,
				yymmdd: yymmdd,
				hhmmss: hhmmss,
				ch1: docs[i].doc.ch1,
				ch2: docs[i].doc.ch2,
				dist: Math.round(Number(docs[i].doc.dist))/1000
			});
		}
	}

	this.thurmalColumns = [{
			field: 'id',
			title: 'No.',
			align: 'center'
		}, {
			field: 'yymmdd', 
			title: '관측일',
			align: 'center'
		}, {
			field: 'hhmmss', 
			title: '관측시간',
			align: 'center'
		}, {
			field: 'temp',
			title: '대기온도',
			align: 'center'
		}, {
			field: 'rsTemp', 
			title: '노면온도',
			align: 'center'
		}, {
			field: 'mois',
			title: '습도',
			align: 'center'
		}, {
			field: 'dist',
			title: '상대거리',
			align: 'center'
		}];
	
	this.atTempColumns = [{
			field: 'id',
			title: 'No.',
			align: 'center'
		}, {
			field: 'yymmdd', 
			title: '관측일',
			align: 'center'
		}, {
			field: 'hhmmss', 
			title: '관측시간',
			align: 'center'
		}, {
			field: 'ch1',
			title: '채널1',
			align: 'center'
		}, {
			field: 'ch2', 
			title: '채널2',
			align: 'center'
		}, {
			field: 'dist',
			title: '상대거리',
			align: 'center'
		}];

	this.loadByType();
};

/************************
 * main
 ************************/
loadingOnText();

var lastName = getCookie("name") || _TOTAL_DATABASE;
if (lastName) {
	sharedObject.database = lastName;
}

var leafletMap = new LeafletMap('map1');
var lineChart = new C3LineChart();
var table = new BootTable();
var database = new CouchDB("http://localhost:5984", sharedObject.database);

// 초기 데이터 조회
database.getAllDocs(database.baseName, function(err, docs) {
	if (!err) {
		if (docs.length) {
			sharedObject.totalDocs = docs;
			leafletMap.drawAllDocs(docs);
			lineChart.drawChart(docs);
			table.buildTableData(docs);
		} else {
			$(".easy-button-container").css("display", "none");
			$(".leaflet-control-layers").css("display", "none");
		}
		loadingOff();
	} else { 
		if (lastName.indexOf(_TOTAL_DATABASE) < 0) {
			deleteCookie("name");
			window.location.reload();
		} else {
			if (err.status == 404) {
				database.createDb(database.baseName, function(err, result) {
					if (err) {
						alert(err.responseJSON.reason);
					} else {
						window.location.reload();
					}
				});
			}
		}
	}
});

// 데이터베이스 리스트조회 및 추가
database.getDbList(function(list) {
	$("#dbList").empty();
	var dbNames = [database.baseName];

	list.forEach(function(name, i) {
		if(name.indexOf("obd_") >= 0) {
			var subName = name.substr(4, name.length-1);
			if (subName.indexOf(database.baseName) < 0) {
				dbNames.push(subName);
			}
		}
	});
	dbNames.forEach(function(name) {
		appendListItem("#dbList", name, name);
	});
});

