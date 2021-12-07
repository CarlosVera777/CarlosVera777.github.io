class UTMLatLng {
    datumName = "WGS 84";
    a;
    eccSquared;
    status = false;

    constructor(datumNameIn) {
        if (datumNameIn !== undefined)
        {
            this.datumName = datumNameIn;
        }
        this.setEllipsoid(this.datumName);
    }

    convertLatLngToUtm (latitude, longitude,precision)
    {
        var ZoneNumber;

        if (this.status)
        {
            return 'No ecclipsoid data associated with unknown datum: ' + this.datumName;
        }

        if(!Number.isInteger(precision))
        {
            return 'Precision is not integer number.';
        }

        latitude = parseFloat(latitude);
        longitude = parseFloat(longitude);

        var LongTemp = longitude;
        var LatRad = this.toRadians(latitude);
        var LongRad = this.toRadians(LongTemp);

        if (LongTemp >= 8 && LongTemp <= 13 && latitude > 54.5 && latitude < 58) {
            ZoneNumber = 32;
        } else if (latitude >= 56.0 && latitude < 64.0 && LongTemp >= 3.0 && LongTemp < 12.0) {
            ZoneNumber = 32;
        } else {
            ZoneNumber = ((LongTemp + 180) / 6) + 1;

            if (latitude >= 72.0 && latitude < 84.0) {
                if (LongTemp >= 0.0 && LongTemp < 9.0) {
                    ZoneNumber = 31;
                } else if (LongTemp >= 9.0 && LongTemp < 21.0) {
                    ZoneNumber = 33;
                } else if (LongTemp >= 21.0 && LongTemp < 33.0) {
                    ZoneNumber = 35;
                } else if (LongTemp >= 33.0 && LongTemp < 42.0) {
                    ZoneNumber = 37;
                }
            }
        }
        ZoneNumber = parseInt(ZoneNumber);

        var LongOrigin = (ZoneNumber - 1) * 6 - 180 + 3;  //+3 puts origin in middle of zone
        var LongOriginRad = this.toRadians(LongOrigin);

        var UTMZone = this.getUtmLetterDesignator(latitude);

        var eccPrimeSquared = (this.eccSquared) / (1 - this.eccSquared);

        var N = this.a / Math.sqrt(1 - this.eccSquared * Math.sin(LatRad) * Math.sin(LatRad));
        var T = Math.tan(LatRad) * Math.tan(LatRad);
        var C = eccPrimeSquared * Math.cos(LatRad) * Math.cos(LatRad);
        var A = Math.cos(LatRad) * (LongRad - LongOriginRad);

        var M = this.a * ((1 - this.eccSquared / 4 - 3 * this.eccSquared * this.eccSquared / 64 - 5 * this.eccSquared * this.eccSquared * this.eccSquared / 256) * LatRad
            - (3 * this.eccSquared / 8 + 3 * this.eccSquared * this.eccSquared / 32 + 45 * this.eccSquared * this.eccSquared * this.eccSquared / 1024) * Math.sin(2 * LatRad)
            + (15 * this.eccSquared * this.eccSquared / 256 + 45 * this.eccSquared * this.eccSquared * this.eccSquared / 1024) * Math.sin(4 * LatRad)
            - (35 * this.eccSquared * this.eccSquared * this.eccSquared / 3072) * Math.sin(6 * LatRad));

        var UTMEasting = parseFloat(0.9996 * N * (A + (1 - T + C) * A * A * A / 6
            + (5 - 18 * T + T * T + 72 * C - 58 * eccPrimeSquared) * A * A * A * A * A / 120)
        + 500000.0);

        var UTMNorthing = parseFloat(0.9996 * (M + N * Math.tan(LatRad) * (A * A / 2 + (5 - T + 9 * C + 4 * C * C) * A * A * A * A / 24
            + (61 - 58 * T + T * T + 600 * C - 330 * eccPrimeSquared) * A * A * A * A * A * A / 720)));

        if (latitude < 0)
            UTMNorthing += 10000000.0;
        UTMNorthing = this.precisionRound(UTMNorthing,precision);
        UTMEasting = this.precisionRound(UTMEasting,precision);
        return {Easting: UTMEasting, Northing: UTMNorthing, ZoneNumber: parseInt(ZoneNumber), ZoneLetter: UTMZone};

    }

    precisionRound(number, precision) {
        var factor = Math.pow(10, precision);
        return Math.round(number * factor) / factor;
    }

    setEllipsoid (name)
    {
        switch (name) {
            case 'Airy':
            this.a = 6377563;
            this.eccSquared = 0.00667054;
            break;
            case 'Australian National':
            this.a = 6378160;
            this.eccSquared = 0.006694542;
            break;
            case 'Bessel 1841':
            this.a = 6377397;
            this.eccSquared = 0.006674372;
            break;
            case 'Bessel 1841 Nambia':
            this.a = 6377484;
            this.eccSquared = 0.006674372;
            break;
            case 'Clarke 1866':
            this.a = 6378206;
            this.eccSquared = 0.006768658;
            break;
            case 'Clarke 1880':
            this.a = 6378249;
            this.eccSquared = 0.006803511;
            break;
            case 'Everest':
            this.a = 6377276;
            this.eccSquared = 0.006637847;
            break;
            case 'Fischer 1960 Mercury':
            this.a = 6378166;
            this.eccSquared = 0.006693422;
            break;
            case 'Fischer 1968':
            this.a = 6378150;
            this.eccSquared = 0.006693422;
            break;
            case 'GRS 1967':
            this.a = 6378160;
            this.eccSquared = 0.006694605;
            break;
            case 'GRS 1980':
            this.a = 6378137;
            this.eccSquared = 0.00669438;
            break;
            case 'Helmert 1906':
            this.a = 6378200;
            this.eccSquared = 0.006693422;
            break;
            case 'Hough':
            this.a = 6378270;
            this.eccSquared = 0.00672267;
            break;
            case 'International':
            this.a = 6378388;
            this.eccSquared = 0.00672267;
            break;
            case 'Krassovsky':
            this.a = 6378245;
            this.eccSquared = 0.006693422;
            break;
            case 'Modified Airy':
            this.a = 6377340;
            this.eccSquared = 0.00667054;
            break;
            case 'Modified Everest':
            this.a = 6377304;
            this.eccSquared = 0.006637847;
            break;
            case 'Modified Fischer 1960':
            this.a = 6378155;
            this.eccSquared = 0.006693422;
            break;
            case 'South American 1969':
            this.a = 6378160;
            this.eccSquared = 0.006694542;
            break;
            case 'WGS 60':
            this.a = 6378165;
            this.eccSquared = 0.006693422;
            break;
            case 'WGS 66':
            this.a = 6378145;
            this.eccSquared = 0.006694542;
            break;
            case 'WGS 72':
            this.a = 6378135;
            this.eccSquared = 0.006694318;
            break;
            case 'ED50':
            this.a = 6378388;
            this.eccSquared = 0.00672267;
                break; // International Ellipsoid
                case 'WGS 84':
            case 'EUREF89': // Max deviation from WGS 84 is 40 cm/km see http://ocq.dk/euref89 (in danish)
            case 'ETRS89': // Same as EUREF89 
            this.a = 6378137;
            this.eccSquared = 0.00669438;
            break;
            default:
            this.status = true;
                //   new Error('No ecclipsoid data associated with unknown datum: '.name);

        }
    };

    getUtmLetterDesignator = function (latitude) {
        latitude = parseFloat(latitude);
        if ((84 >= latitude) && (latitude >= 72))
            return 'X';
        else if ((72 > latitude) && (latitude >= 64))
            return 'W';
        else if ((64 > latitude) && (latitude >= 56))
            return 'V';
        else if ((56 > latitude) && (latitude >= 48))
            return 'U';
        else if ((48 > latitude) && (latitude >= 40))
            return 'T';
        else if ((40 > latitude) && (latitude >= 32))
            return 'S';
        else if ((32 > latitude) && (latitude >= 24))
            return 'R';
        else if ((24 > latitude) && (latitude >= 16))
            return 'Q';
        else if ((16 > latitude) && (latitude >= 8))
            return 'P';
        else if ((8 > latitude) && (latitude >= 0))
            return 'N';
        else if ((0 > latitude) && (latitude >= -8))
            return 'M';
        else if ((-8 > latitude) && (latitude >= -16))
            return 'L';
        else if ((-16 > latitude) && (latitude >= -24))
            return 'K';
        else if ((-24 > latitude) && (latitude >= -32))
            return 'J';
        else if ((-32 > latitude) && (latitude >= -40))
            return 'H';
        else if ((-40 > latitude) && (latitude >= -48))
            return 'G';
        else if ((-48 > latitude) && (latitude >= -56))
            return 'F';
        else if ((-56 > latitude) && (latitude >= -64))
            return 'E';
        else if ((-64 > latitude) && (latitude >= -72))
            return 'D';
        else if ((-72 > latitude) && (latitude >= -80))
            return 'C';
        else
            return 'Z';

    };

    toRadians (deg) {
        return deg * Math.PI / 180;
    };

};