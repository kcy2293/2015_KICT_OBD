    // Division with integer truncation.
    function idiv (n, d) { return Math.floor(n / d); }

    // Get year.
    function GetYear (date) {
        var year = date.getYear();
        if (year< 1900) year += 1900;
        return year;
    }

    // Get Month where January = 1 (not 0).
    function GetMonth (date) {
        return date.getMonth() + 1;
    }

    // Get leap second count.
    //   "from 1999 January 1, 0h UTC, until further notice : UTC-TAI = - 32 s"
    function LeapSecondCount (date) {
        var year = GetYear(date);
        var month = GetMonth(date);
        if ( (year >= 2007) && (month >= 1) ) return 34;
        if ( (year >= 2004) && (month >= 1) ) return 33;
                if ( (year >= 1999) && (month >= 1) ) return 32;
        if ( (year >= 1997) && (month >= 7) ) return 31;
        if ( (year >= 1996) && (month >= 1) ) return 30;
    }


    // Get elapsed seconds since midnight.
    function GetElapsed (date) {
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var seconds = date.getSeconds();
        var elapsed = (((hours * 60) + minutes) * 60) + seconds;
        return elapsed;
    }

    // Get Modified Julian Date.
    function GetMjd1 (date) {
        var year = GetYear(date);
        var month = GetMonth(date);
        var day = date.getDate();
        return GetMjd3(year, month, day);
    }

    function GetMjd3 (year, month, day) {
        var mjd =
        367 * year
        - idiv(7 * (idiv(month + 9, 12) + year), 4)
        - idiv(3 * (idiv(idiv(month + 9, 12) + year - 1, 100) + 1), 4)
        + idiv(275 * month, 9)
        + day
        + 1721028
        - 2400000;
        return mjd;
    }

    // Get day of year.
    function GetDayOfYear (date) {
        var year = GetYear(date);
        var Doy = GetMjd1(date) - GetMjd3(year, 1, 1) + 1;
        return Doy;
    }

    // Format date/time in yyyy-mm-dd format (ISO 8601).
    function FormatIso8601 (date) {
        var year = GetYear(date);
        var month = GetMonth(date);
        var day = date.getDate();
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var seconds = date.getSeconds();

        var s = "";
        s += Fixed4(year) + "-";
        s += Fixed2(month) + "-";
        s += Fixed2(day) + " ";
        s += Fixed2(hours) + ":";
        s += Fixed2(minutes) + ":";
        s += Fixed2(seconds);
        return s;
    }

// Create fixed width integer strings.
    function Fixed2 (n) {
        return (n< 10 ? "0" : "") + n;
    }
    function Fixed3 (n) {
        n = Fixed2(n);
        return (n< 100 ? "0" : "") + n;
    }
    function Fixed4 (n) {
        n = Fixed3(n);
        return (n< 1e3 ? "0" : "") + n;
    }
    function Fixed5 (n) {
        n = Fixed4(n);
        return (n< 1e4 ? "0" : "") + n;
    }
    function Fixed6 (n) {
        n = Fixed5(n);
        return (n< 1e5 ? "0" : "") + n;
    }


    // Format GPS time.
    function FormatGpsTime (date, f) {
        var GpsDayCount = GetMjd1(date) - GetMjd3(1980, 1, 6);
        var GpsWeekCount = Math.floor(GpsDayCount / 7);
        var GpsCycle = Math.floor(GpsWeekCount / 1024);
        var GpsDay = GpsDayCount % 7;
        var GpsWeek = GpsWeekCount % 1024;
        var GpsSecond = (GpsDay * 86400) + GetElapsed(date);

        // N.B. Older browsers do not support switch().
        if (f == 0) {
            return "week " + GpsWeekCount;
        }
        if (f == 1) {
//            return GpsSecond + " s";
            return GpsSecond;
        }
        if (f == 2) {
            var s = "";
            s += "cycle " + GpsCycle;
            s += " week " + Fixed4(GpsWeek);
            s += " day " + GpsDay;
            return s;
        }
    }

   

   

