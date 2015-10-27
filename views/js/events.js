/*********************************
 * 차량 디바이스와 관련된 데이터
 *
 * this.gps [][]
 * 	0 : gps time (DATE)
 *  1 : lat
 *  2 : lon
 *  3 : H-Ell(m)
 *  4 : SDHoriz(m)
 *  5 : SDHeight(m)
 *  6 : VEast(m/s)
 *  7 : VNorth(m/s)
 *  8 : Vup Sol(m/s)
 *  9 : Roll(deg)
 * 10 : Pitch(deg)
 * 11 : Heading(deg)
 *
 * this.thurmal [][]
 *  0 : gps time (DATE)
 *  1 : miliseconds (ms)
 *  2 : 대기온도
 *  3 : 대기습도
 *  4 : 노면온도
 *
 * this.atTemp [][] 외부온도
 *  0 : gps time (DATE)
 *  1 : 채널1 값
 *  2 : 채널2 값
 *********************************/
var ROADINFO = new function() {
	this.gps = [];
	this.thurmal = [];
	this.atTemp = [];
	this.thurmalDocs = [];
	this.atTempDocs = [];

	this.clearRepo = function() {
		this.gps = [];
		this.thurmal = [];
		this.atTemp = [];
		this.thurmalDocs = [];
		this.atTempDocs = [];
	};

	this.buildThurmalDocs = function() {
		if (this.gps.length == 0 || this.thurmal.length == 0) {
			return;
		}

		var points = [];
		for (var i = 0 , len = this.thurmal.length ; i < len ; i++) {
		//for (var i = 0 , len = 280 ; i < len ; i++) {

			var latlon = getThurmalLatLon(this.thurmal[i][0], Number(this.thurmal[i][1]) * 0.01);
			if (latlon) {

				var ch1 = getAtTemp(this.thurmal[i][0])[0];
				var ch2 = getAtTemp(this.thurmal[i][0])[1];

				this.thurmalDocs.push({
					"_id" : "thurmal_" + date2FullStr(this.thurmal[i][0]) + "_" + this.thurmal[i][1].padLeft(),
					"lat" : latlon[0],
					"lon" : latlon[1],
					"temp" : this.thurmal[i][2],
					"mois" : this.thurmal[i][3],
					"rsTemp" : this.thurmal[i][4],
					"ch1" : ch1,
					"ch2" : ch2
				});

			} else {
				//console.log("["+ date2FullStr(this.thurmal[i][0]," ") +"]적외선 정보에 해당하는 gps 데이터가 없습니다.");
			}
		}
	};

	this.buildAtTempDocs = function() {
		if (this.gps.length == 0 || this.atTemp.length == 0) {
			return;
		}
		var points = [];
		for (var i = 0 , len = this.atTemp.length ; i < len ; i++) {
			var latlon = getAtTempLatLon(this.atTemp[i][0]);
			if (latlon) {
				this.atTempDocs.push({
					"_id" : "atTemp_" + date2FullStr(this.atTemp[i][0]),
					"lat" : latlon[0],
					"lon" : latlon[1],
					"ch1" : this.atTemp[i][1],
					"ch2" : this.atTemp[i][2],
				});

			} else {
				//console.log("["+ date2FullStr(this.atTemp[i][0]," ") +"]대기온도 정보에 해당하는 gps 데이터가 없습니다.");
			}
		}
	};

	this.drawAllDocs = function() {
		var prevOptionIdx = getOptions(Number(this.atTempDocs[0].ch1)).index;
		var segmentLatLon = [new L.LatLng(this.atTempDocs[0].lat, this.atTempDocs[0].lon)];
		for (var i = 1, len = this.atTempDocs.length ; i < len ; i++) {

			var option = getOptions(Number(this.atTempDocs[i].ch1));
			var latlng = new L.LatLng(this.atTempDocs[i].lat, this.atTempDocs[i].lon);
			segmentLatLon.push(latlng);
			if (prevOptionIdx !== option.index || i == len -1) {
				leafletMap.atTempLayer.addLayer(
					new L.Polyline(segmentLatLon, {"color" : option.color})
				);

				prevOptionIdx = option.index;
				segmentLatLon = [latlng];
			}
		}

		prevOptionIdx = getOptions(Number(this.thurmalDocs[0].temp)).index;
		segmentLatLon = [new L.LatLng(this.thurmalDocs[0].lat, this.thurmalDocs[0].lon)];

		for (var i = 1, len = this.thurmalDocs.length ; i < len ; i++) {
			var option = getOptions(Number(this.thurmalDocs[i].temp));
			var latlng = new L.LatLng(this.thurmalDocs[i].lat, this.thurmalDocs[i].lon);
			segmentLatLon.push(latlng);

			if (prevOptionIdx !== option.index || i == len -1) {
				leafletMap.thurmalLayer.addLayer(
					new L.Polyline(segmentLatLon, {"color" : option.color})
				);

				prevOptionIdx = option.index;
				segmentLatLon = [latlng];
			}
		}

		leafletMap.fitMap();
		for (var i = 1, len = this.thurmalDocs.length -1 ; i < len ; i++) {
			var start = new L.LatLng(this.thurmalDocs[i].lat, this.thurmalDocs[i].lon);
			var end = new L.LatLng(this.thurmalDocs[i+1].lat, this.thurmalDocs[i+1].lon);
			leafletMap.popupLayer.addLayer(
				(new L.Polyline([start, end], {"weight": 20, "opacity": 0}))
					.bindPopup("적외선 장비<br/>" + 
							   "대기온도 : " + this.thurmalDocs[i].temp + "<br/>" +
							   "대기습도 : " + this.thurmalDocs[i].mois + "<br/>" +
							   "노면온도 : " + this.thurmalDocs[i].rsTemp + "<br/>" +
							   "<br/>" + 
							   "대기온도 장비<br/>" +
							   "채널1 : " + this.thurmalDocs[i].ch1 + "<br/>" + 
							   "채널2 : " + this.thurmalDocs[i].ch2)
			);
		}
	};

	function getThurmalLatLon(target, ms) {
		if (ROADINFO.gps.length == 0) {
			return false;
		}

		for (var i = 0, len = ROADINFO.gps.length-1 ; i < len ; i++) {
			if (datesEqual(ROADINFO.gps[i][0], target)) {

				//leafletMap.addMarker(ROADINFO.gps[i][1], ROADINFO.gps[i][2]);
				var lat = internal_div(ROADINFO.gps[i][1], ROADINFO.gps[i+1][1], ms, 1-ms);
				var lon = internal_div(ROADINFO.gps[i][2], ROADINFO.gps[i+1][2], ms, 1-ms);
				return [lat, lon];
			}
		}
		return false;
	}

	function getAtTempLatLon(target) {
		if (ROADINFO.gps.length == 0) {
			return false;
		}

		for (var i = 0, len = ROADINFO.gps.length-1 ; i < len ; i++) {
			if (datesEqual(ROADINFO.gps[i][0], target)) {
				return [ROADINFO.gps[i][1], ROADINFO.gps[i][2]];
			}
		}
		return false;
	}

	function getAtTemp(target) {
		if (ROADINFO.atTemp.length == 0) {
			return "";
		}

		var copyDate = new Date(target.valueOf());

		var sec = parseInt(target.getSeconds() / 10) * 10;
		copyDate.setSeconds(sec);

		for (var i = 0, len = ROADINFO.atTemp.length-1 ; i < len ; i++) {
			if((ROADINFO.atTemp[i][0] - copyDate) <= (10*1000)) {
				return [ROADINFO.atTemp[i][1], ROADINFO.atTemp[i][2]];
			}
		}
		return "";
	}
};

/*********************************
 * 자료입력 버튼과 관련된 이벤트
 *********************************/
$("#insertButton").click(function() {
	ROADINFO.clearRepo();

	var checkBox = $("#newDbCheckbox");
	var dbNameBox = $("#dbName");
	var insertModal = $("#insertModal");

	var selectedDb = $("#dbList").val();
	if (selectedDb == null) {
		checkBox
			.prop("checked", true)
			.prop("disabled", true);
	} else {
		dbNameBox
			.val(selectedDb)
			.prop("disabled", true);

		checkBox.change(function() {
			if (this.checked) {
				dbNameBox
					.val('')
					.prop("disabled", false);
			} else {
				dbNameBox
					.val(selectedDb)
					.prop("disabled", true);
			}
		});
	}

	insertModal.modal('toggle');
});
	
/*********************************
 * 저장버튼 클릭시 이벤트
 *********************************/
$("#saveButton").click(function() {
	var checkBox = $("#newDbCheckbox");
	var dbNameBox = $("#dbName");
	var insertModal = $("#insertModal");

	var gpsFile = $("#gpsFile");
	var thurmalFile = $("#thurmalFile");
	var atTempFile = $("#atTempFile");

	if (ROADINFO.gps.length == 0 || ROADINFO.thurmal.length == 0 || ROADINFO.atTemp == 0) {
		return;
	}

	var dbName = dbNameBox.val();
	if (dbName) {

		leafletMap.clearLayers();

		ROADINFO.buildAtTempDocs();
		ROADINFO.buildThurmalDocs();
		ROADINFO.drawAllDocs();

		if(checkBox.prop("checked")) {
			// 신규생성
			database.createDb(dbName, function(err, dbName) {
				if (err) {
					// 에러핸들링
				} else {
					appendListItem("#dbList", dbName, dbName);
					database.bulkInsert(dbName, ROADINFO.thurmalDocs);
					database.bulkInsert(dbName, ROADINFO.atTempDocs);
					$("#dbList").val(dbName);
				}
			});
		} else {
			// 기존업데이트
			database.bulkInsert(dbName, ROADINFO.thurmalDocs);
			database.bulkInsert(dbName, ROADINFO.atTempDocs);
		}

		dbNameBox
			.val('')
			.prop("disabled", false);
		checkBox
			.prop("checked", false)
			.prop("disabled", false);

		if (isIE) {
			gpsFile.replaceWith( gpsFile.val('').clone(true) );
			thurmalFile.replaceWith( thurmalFile.val('').clone(true) );
			atTempFile.replaceWith( atTempFile.val('').clone(true) );
		} else {
			gpsFile.val("");
			thurmalFile.val("");
			atTempFile.val("");
		}

		$("#gpsFileName").text("");
		$("#thurmalFileName").text("");
		$("#atTempFileName").text("");

		$("#gpsProgress")
			.css("width", "0%")
			.text("");
		$("#thurmalProgress")
			.css("width", "0%")
			.text("");
		$("#atTempProgress")
			.css("width", "0%")
			.text("");


		insertModal.modal('toggle');

	} else {
		dbNameBox.focus();
	}
});

/************************
 * 데이터베이스 삭제
 ************************/
$("#deleteButton").click(function() {
	var selectedDb = $("#dbList").val();
	if (selectedDb != null) {
		database.deleteDb(selectedDb, function(err, result) {
			if (err) {
				// 에러핸들링
			} else {
				leafletMap.clearLayers();
				if (result.ok) {
					database.setDbList(function(dbName) {
						leafletMap.drawAllDocs(database, dbName);
					});
				}
			}
		});
	}
});

/************************
 * 데이터베이스 변경시
 ************************/
$("#dbList").change(function() {
	var dbName = $("#dbList").val();
	leafletMap.clearLayers();
	leafletMap.drawAllDocs(database, dbName);
});

/************************
 *  GPS 파일 데이터 추출
 ************************/
$("#gpsFile").change(function(e) {
	var file = e.target.files[0];
	$("#gpsFileName").text(file.name);

	var fileReader = new FileReader();
	fileReader.addEventListener("load", function(event) {
		var lines = event.target.result.split(/[\r\n]+/g);
		var progress = $("#gpsProgress");
		var beforePer = 0;
		ROADINFO.gps = [];

		for(var i = 0, len = lines.length ; i < len ; i++) {

			var per = (((i+1) / len)*100).toFixed(0);
			if (beforePer != per) {
				beforePer = per;
				progress
					.css("width", per+"%")
					.text(per+"%");
			}

			if (i < 13 || i == len-1) {
				continue;
			} else if (lines[i].length < 100) {
				continue;
			} else {
				var latArr = (lines[i].substring(28, 43).trim()).split(' ');
				var lonArr = (lines[i].substring(45, 59).trim()).split(' ');

				var lat = dms_to_deg(latArr[0], latArr[1], latArr[2]);
				var lon = dms_to_deg(lonArr[0], lonArr[1], lonArr[2]);

				var mdyhms = lines[i].substring(16, 26).trim() + " " + lines[i].substring(0, 14).trim();
				var date = mdyhms2Date(mdyhms);

				ROADINFO.gps.push([
					date, 
					lat, 
					lon,
					Number(lines[i].substring(61, 72).trim()), // H-Ell(m)
					Number(lines[i].substring(74, 85).trim()), // SDHoriz(m)
					Number(lines[i].substring(87, 98).trim()), // SDHeight(m)
					Number(lines[i].substring(100, 108).trim()), // VEast(m/s)
					Number(lines[i].substring(110, 118).trim()), // VNorth(m/s)
					Number(lines[i].substring(120, 131).trim()), // Vup Sol(m/s)
					Number(lines[i].substring(133, 143).trim()), // Roll(deg)
					Number(lines[i].substring(145, 154).trim()), // Pitch(deg)
					Number(lines[i].substring(156, 165).trim()) // Heading(deg)
				]);
			}

		}
		if (ROADINFO.gps.length == 0) {
			progress
				.text("데이터 추출 실패");
		}
	});

	fileReader.readAsText(file);
});

/************************
 * 적외선 파일 데이터 추출
 ************************/
$("#thurmalFile").change(function(e) {
	var file = e.target.files[0];
	$("#thurmalFileName").text(file.name);

	var fileReader = new FileReader();
	fileReader.addEventListener("load", function(event) {
		var lines = event.target.result.split(/[\r\n]+/g);
		var progress = $("#thurmalProgress");

		ROADINFO.thurmal = [];

		var beforePer = 0;

		var imsiCnt = 0;
		for (var i = 1, len = lines.length ; i < len ; i++) {
			var per = (((i+1) / len)*100).toFixed(0);
			if (beforePer != per) {
				beforePer = per;
				progress
					.css("width", per+"%")
					.text(per+"%");
			}

			var fields = (lines[i].replace(/"/g, "")).split(',');
			if (fields.length != 6) {
				continue;
			}
			if (Number(fields[1].substring(0, 4)) < 2015) {
				continue;
			} else {
				imsiCnt++;
			}


			ROADINFO.thurmal.push([
				subHours(str2Date2(fields[1]), 9),
				Number(fields[5].split('.')[1]),
				fields[2],
				fields[3],
				fields[4]
			]);
		}

		if (ROADINFO.thurmal.length == 0) {
			progress
				.text("데이터 추출 실패");
		}

	});

	fileReader.readAsText(file);
});

/************************
 * 대기온도 파일 데이터 추출
 ************************/
$("#atTempFile").change(function(e) {
	var file = e.target.files[0];
	$("#atTempFileName").text(file.name);

	var fileReader = new FileReader();
	fileReader.addEventListener("load", function(event) {
		var lines = event.target.result.split(/[\r\n]+/g);
		var progress = $("#atTempProgress");

		ROADINFO.atTemp = [];

		var beforePer = 0;
		for (var i = 1, len = lines.length ; i < len ; i++) {
			var per = (((i+1) / len)*100).toFixed(0);
			if (beforePer != per) {
				beforePer = per;
				progress
					.css("width", per+"%")
					.text(per+"%");
			}

			var fields = lines[i].split(',');

			if (fields.length != 4) {
				continue;
			}

			ROADINFO.atTemp.push([
				subHours(str2Date3(fields[0]), 9),
				fields[1],
				fields[2]
			]);
		}

		if (ROADINFO.atTemp.length == 0) {
			progress
				.text("데이터 추출 실패");
		}

	});

	fileReader.readAsText(file);
});

