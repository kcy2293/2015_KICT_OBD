
/*************************
 * DateFormat function
 *************************/
Number.prototype.padLeft = function(base,chr){
   var  len = (String(base || 10).length - String(this).length)+1;
   return len > 0? new Array(len).join(chr || '0')+this : this;
}

/*format yyyy-MM-dd HH:mm:ss*/
function dateFormat(d, dv1, mid, dv2){
	dv1 = (dv1 == null)? '-':dv1;
	mid = (mid == null)? ' ':mid;
	dv2 = (dv2 == null)? ':':dv2;
return [ d.getFullYear(), (d.getMonth()+1).padLeft(), d.getDate().padLeft()].join(dv1)+
	 mid + [ d.getHours().padLeft(), d.getMinutes().padLeft(), d.getSeconds().padLeft()].join(dv2);
}

function dateDayFormat(d, dv1, mid, dv2){
	var theDay = d.getDay();
	var DDay;
	switch(theDay) {
		case 1: DDay = "(월)"; break;
		case 2: DDay = "(화)"; break;
		case 3: DDay = "(수)"; break;
		case 4: DDay = "(목)"; break;
		case 5: DDay = "(금)"; break;
		case 6: DDay = "(토)"; break;
		case 7: DDay = "(일)"; break;
	}

	dv1 = (dv1 == null)? '-':dv1;
	mid = (mid == null)? ' ':mid;
	dv2 = (dv2 == null)? ':':dv2;

return [ d.getFullYear(), (d.getMonth()+1).padLeft(), d.getDate().padLeft()].join(dv1) + DDay
	 + mid + [ d.getHours().padLeft(), d.getMinutes().padLeft(), d.getSeconds().padLeft()].join(dv2);
}

/*20150715*/
function date2Str(d){
	return [ d.getFullYear(), (d.getMonth()+1).padLeft(), d.getDate().padLeft()].join('')
}

function date2FullStr(d, div) {
	div = (div == null)? '' : div;
	return [ d.getFullYear(), (d.getMonth()+1).padLeft(), d.getDate().padLeft(), d.getHours().padLeft(), d.getMinutes().padLeft(), d.getSeconds().padLeft()].join(div);
}

function addDays(theDate, days) {
    return new Date(theDate.getTime() + days*24*60*60*1000);
}

function addHours(theDate, hr) {
    return new Date(theDate.getTime() + hr*60*60*1000);
}

function addMins(theDate, mm) {
    return new Date(theDate.getTime() + mm*60*1000);
}

function addSecs(theDate, ss) {
    return new Date(theDate.getTime() + ss*1000);
}

function subHours(theDate, hr) {
    return new Date(theDate.getTime() - hr*60*60*1000);
}

/*format HH:mm*/
function HourFormat(d){
	return  d.getHours().padLeft() + ':' + d.getMinutes().padLeft();
}

/*format HH:mm*/
function time2Date(t, add){
	var d = new Date();
	var current =   new Date( d.getFullYear(), (d.getMonth()).padLeft(), d.getDate().padLeft(), t.split(':')[0], parseInt(t.split(':')[1]/10)*10, 00, 00);
	return dateFormat(addMins(current, add));
}

function Date2time(d){
	return [ d.getHours().padLeft(), d.getMinutes().padLeft()].join(':');
}

function getTodayStr() {
	var d = new Date();
	return [ d.getFullYear(), (d.getMonth()+1).padLeft(), d.getDate().padLeft()].join("-");
}

function getYesterDayNight(current) {
	return (new Date(current.valueOf() - ((current.getHours() + 1) * 60 * 60 * 1000) + ((59 - current.getMinutes()) * 60 * 1000) - (current.getSeconds() * 1000)));
}

function getTonight(current) {
	return (new Date(current.valueOf() + ((23 - current.getHours()) * 60 * 60 *1000) + ((59 - current.getMinutes()) * 60 * 1000) - (current.getSeconds() * 1000)));
}

function getYesterDayStr() {
	var today = new Date();
	var d = new Date(today.valueOf() - (24*60*60*1000));
	return [ d.getFullYear(), (d.getMonth()+1).padLeft(), d.getDate().padLeft()].join("-");
}

function getTomorrowStr() {
	var today = new Date();
	var d = new Date(today.valueOf() + (24*60*60*1000));
	return [ d.getFullYear(), (d.getMonth()+1).padLeft(), d.getDate().padLeft()].join("-");
}

//S == 2015:07:22 17:43:00 
function str2Date(s){
	var ymd = s.split(' ')[0];
	var hms = s.split(' ')[1];
	return new Date(ymd.split(':')[0], ymd.split(':')[1], ymd.split(':')[2], hms.split(':')[0], hms.split(':')[1],hms.split(':')[2]);
}

//S == 2015/07/22 17:43:00 
function str2Date2(s) {
	var ymd = s.split(' ')[0];
	var hms = s.split(' ')[1];
	var yy = (ymd.split('/')[1] == "1") ? Number(ymd.split('/')[0]) -1 : ymd.split('/')[0];
	var mm = (ymd.split('/')[1] == "1") ? 12 : Number(ymd.split('/')[1]) -1;

	return new Date(yy, mm, ymd.split('/')[2], hms.split(':')[0], hms.split(':')[1], hms.split(':')[2]);
}

//S == 2015-07-22 17:43:00 
function str2Date3(s) {
	var ymd = s.split(' ')[0];
	var hms = s.split(' ')[1];
	var yy = (ymd.split('-')[1] == "1") ? Number(ymd.split('-')[0]) -1 : ymd.split('-')[0];
	var mm = (ymd.split('-')[1] == "1") ? 12 : Number(ymd.split('-')[1]) -1;

	return new Date(yy, mm, ymd.split('-')[2], hms.split(':')[0], hms.split(':')[1], hms.split(':')[2]);
}

//S == 9/17/2015 8:24:29.000000
function mdyhms2Date(s) {
	var mdy = s.split(' ')[0];
	var hms = (s.split(' ')[1]).split('.')[0];
	var yy = (mdy.split('/')[0] == "1") ? Number(mdy.split('/')[2]) -1 : mdy.split('/')[2];
	var mm = (mdy.split('/')[0] == "1") ? 12 : Number(mdy.split('/')[0]) -1;

	return new Date(yy, mm, mdy.split('/')[1], hms.split(':')[0], hms.split(':')[1],hms.split(':')[2]);
}

function timeCompare(t, ref) {
	var d = new Date();
	return (t.getHours()*60 + t.getMinutes()) < (d.getHours()*60 + d.getMinutes() + ref)  ;
}

function datesEqual(a, b) {
   return (!(a>b || b>a))
}

/*************************
 * Browser Detect 
 *************************/
var ua = navigator.userAgent.toLowerCase();
var check = function(r) {
    return r.test(ua);
};
var DOC = document;
var isStrict = DOC.compatMode == "CSS1Compat";
var isOpera = check(/opera/);
var isChrome = check(/chrome/);
var isWebKit = check(/webkit/);
var isSafari = !isChrome && check(/safari/);
var isSafari2 = isSafari && check(/applewebkit\/4/); // unique to
// Safari 2
var isSafari3 = isSafari && check(/version\/3/);
var isSafari4 = isSafari && check(/version\/4/);
var isIE = !isOpera && check(/msie/);
var isIE7 = isIE && check(/msie 7/);
var isIE8 = isIE && check(/msie 8/);
var isIE6 = isIE && !isIE7 && !isIE8;
var isGecko = !isWebKit && check(/gecko/);
var isGecko2 = isGecko && check(/rv:1\.8/);
var isGecko3 = isGecko && check(/rv:1\.9/);
var isBorderBox = isIE && !isStrict;
var isWindows = check(/windows|win32/);
var isMac = check(/macintosh|mac os x/);
var isAir = check(/adobeair/);
var isLinux = check(/linux/);
var isSecure = /^https/i.test(window.location.protocol);
var isIE7InIE8 = isIE7 && DOC.documentMode == 7;


function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}


function todayMSec(d){
	var t = (isChrome) ? " 00:00:00":"T00:00:00";
	return (new Date(dateFormat(d).substr(0,10) + t).getTime() -10*60*1000  );
}

/*************************
 * Cookies
 *************************/
function setCookie(key, value, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = key + "=" + value + "; " + expires;
}

function getCookie(key) {
    var name = key + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return undefined;
}

function deleteCookie(key) {
	document.cookie = key + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
}

/*************************
 * SelectBox
 *************************/
function appendListItem(divid, value, text) {
	$(divid).append("<option value='" + value +"'>" + text +"</option>");
}

function removeListItem(divid, value) {
	$(divid + " option[value="+value).remove();
}

/*************************
 * 높이구하기
 *************************/
function getHeightByDiv(divid) {
	return $(divid).outerHeight(true);
}

/*************************
 * 경위도변환 유틸
 *************************/
function deg_to_dms(deg) {
}

function dms_to_deg(d, m, s) {
	return Number(d) + (Number(m) / 60) + (Number(s) / 3600);
}

/*************************
 * 내분점 
 *************************/
function internal_div(p1, p2, m, n) {
	return (m*p2 + n*p1) / (m + n);
}

/*************************
 * JSON
 *************************/
function getObjectKeyIndex(obj, keyToFind) {
	var i = 0, key;
	for (key in obj) {
		if (key == keyToFind) {
			return i;
		}
		i++;
	}
	return null;
}
function getNextIndex(obj, index) {
	return index >= Object.keys(obj).length - 1 ? 0 : index + 1;
}

/*************************
 * 로딩 관련
 *************************/
function loadingOnText() {
	var over = "<div id='overlay' style='left: 0; top: 0; \
								position: absolute; \
								bottom: 0;\
								right: 0;\
								background: #000;\
								opacity: 0.8;\
								filter: alpha(opacity=80);\
								z-index: 1000;'>" +
					"<div style='position:absolute;top:10%; left:40%; font-color: white;font-size:2em; font-weight: bold;'>자료를 구성중입니다.</div>" +

				"</div>";

	$(over).appendTo('body');
}

function loadingOff() {
	$("#overlay").remove();
}

function loadingOnImg() {
	var over = "<div id='overlay' style='left: 0; top: 0; \
								position: absolute; \
								bottom: 0;\
								right: 0;\
								background: #000;\
								opacity: 0.8;\
								filter: alpha(opacity=80);\
								z-index: 1000;'>" +
					"<img id='loading' src='images/loader.gif' style='left:40%;top:40%;\
															position: absolute;\
															width: 188px; \
															height: 129px; '></div>" +

				"</div>";

	$(over).appendTo('body');
}
