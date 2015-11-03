//                   1         2         3         4         5         6         7         8         9         0         1         2         3         4         5         6
var idx = "01234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456";
var str = " 8:24:29.000000  9/17/2015   37 39 38.41317  126 43 00.58528       38.983        0.929        1.135     0.000     0.000     0.000 52     0.00000    0.00000    0.00000"



console.log("GPS TIME(HMS)");
console.log(str.substring(0,14).trim() +"|");
console.log("==================");
console.log("DATE (MDY)");
console.log(str.substring(16, 26).trim() +"|");
console.log("==================");
console.log("Latitude");
console.log(str.substring(28, 43).trim() +"|");
console.log("==================");
console.log("Longitude");
console.log(str.substring(45, 59).trim() +"|");
console.log("==================");
console.log("H-Ell(m)");
console.log(str.substring(61, 72).trim() +"|");
console.log("==================");
console.log("SDHoriz(m)");
console.log(str.substring(74, 85).trim() +"|");
console.log("==================");
console.log("SDHeight(m)");
console.log(str.substring(87, 98).trim() +"|");
console.log("==================");
console.log("VEast(m/s)");
console.log(str.substring(100, 108).trim() +"|");
console.log("==================");
console.log("VNorth(m/s)");
console.log(str.substring(110, 118).trim() +"|");
console.log("==================");
console.log("Vup Sol(m/s)");
console.log(str.substring(120, 131).trim() +"|");
console.log("==================");
console.log("Roll(deg)");
console.log(str.substring(133, 143).trim() +"|");
console.log("==================");
console.log("Pitch(deg)");
console.log(str.substring(145, 154).trim() +"|");
console.log("==================");
console.log("Heading(deg)");
console.log(str.substring(156, 165).trim() +"|");
console.log("==================");

var aaa = [
	["111", "222", "333"],
	["aaa", "bbb", "ccc"]
];

console.log(aaa);
console.log(aaa[0][1]);
