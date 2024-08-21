import re
import pandas as pd
import numpy as np

class GpsValidator:
    # Patterns for latitude and longitude
    LAT_PATTERN = re.compile(
        r"""
        ^[NS]?[ ]*
        (?P<deg>-?\d+(?:\.\d+)?)(?:[°D\*\u00B0\s][ ]*
        (?:(?P<min>\d+(?:\.\d+)?)[′']?[ ]*)?
        (?:(?P<sec>\d+(?:\.\d+)?)[″"]?[ ]*)?
        )?[NS]?\s*$
        """,
        re.VERBOSE | re.UNICODE,
    )

    LONG_PATTERN = re.compile(
        r"""
        ^[EW]?[ ]*
        (?P<deg>-?\d+(?:\.\d+)?)(?:[°D\*\u00B0\s][ ]*
        (?:(?P<min>\d+(?:\.\d+)?)[′']?[ ]*)?
        (?:(?P<sec>\d+(?:\.\d+)?)[″"]?[ ]*)?
        )?[EW]?\s*$
        """,
        re.VERBOSE | re.UNICODE,
    )

    @staticmethod
    def validate_latitude(x):
        if isinstance(x, pd.Series):
            return x.apply(GpsValidator._validate_latitude_value)
        return GpsValidator._validate_latitude_value(x)

    @staticmethod
    def validate_longitude(x):
        if isinstance(x, pd.Series):
            return x.apply(GpsValidator._validate_longitude_value)
        return GpsValidator._validate_longitude_value(x)

    @staticmethod
    def _validate_latitude_value(val):
        if GpsValidator._is_decimal_degree(val):
            return GpsValidator._check_decimal_degree(val, 'lat')
        return GpsValidator._check_dms_format(val, 'lat')

    @staticmethod
    def _validate_longitude_value(val):
        if GpsValidator._is_decimal_degree(val):
            return GpsValidator._check_decimal_degree(val, 'long')
        return GpsValidator._check_dms_format(val, 'long')

    @staticmethod
    def _is_decimal_degree(val):
        try:
            float_val = float(val)
            
            if float_val.is_integer() or len(set(str(float_val).replace('.', ''))) == 1:
                return False
            
            return True
        except ValueError:
            return False

    @staticmethod
    def _check_decimal_degree(val, direction):
        try:
            dds = float(val)
            
            # number of decimals
            if '.' in str(val):
                precision = len(str(val).split('.')[1])
                if precision < 4 or precision > 8:
                    return False
            
            # Latitude range check
            if direction == 'lat':
                return -90 <= dds <= 90
            
            # Longitude range check
            if direction == 'long':
                return -180 <= dds <= 180
            
        except ValueError:
            return False

    @staticmethod
    def _check_dms_format(val, direction):
        # Ensure the value is a string before stripping
        if not isinstance(val, str):
            return False

        pattern = GpsValidator.LAT_PATTERN if direction == 'lat' else GpsValidator.LONG_PATTERN
        mch = re.match(pattern, val.strip())

        if not mch:
            return False

        deg = float(mch.group("deg"))
        mins = float(mch.group("min")) if mch.group("min") else 0
        secs = float(mch.group("sec")) if mch.group("sec") else 0
        dir_front = mch.group("dir_front")
        dir_back = mch.group("dir_back")

        if not 0 <= mins < 60 or not 0 <= secs < 60:
            return False

        dds = deg + mins / 60 + secs / 3600

        # hemisphere
        if direction == 'lat' and (dir_front == 'S' or dir_back == 'S'):
            dds = -dds
        elif direction == 'long' and (dir_front == 'W' or dir_back == 'W'):
            dds = -dds

        # range check
        bound = 90 if direction == 'lat' else 180
        return -bound <= dds <= bound

    @staticmethod
    def clean_latitude(x):
        if isinstance(x, pd.Series):
            return x.apply(GpsValidator._clean_latitude_value)
        return GpsValidator._clean_latitude_value(x)

    @staticmethod
    def clean_longitude(x):
        if isinstance(x, pd.Series):
            return x.apply(GpsValidator._clean_longitude_value)
        return GpsValidator._clean_longitude_value(x)

    @staticmethod
    def _clean_latitude_value(val):
        if GpsValidator._is_decimal_degree(val):
            return GpsValidator._format_decimal_degree(val, 'lat')
        return GpsValidator._format_dms_to_dd(val, 'lat')

    @staticmethod
    def _clean_longitude_value(val):
        if GpsValidator._is_decimal_degree(val):
            return GpsValidator._format_decimal_degree(val, 'long')
        return GpsValidator._format_dms_to_dd(val, 'long')

    @staticmethod
    def _format_decimal_degree(val, direction):
        dds = float(val)
        # within bounds
        if direction == 'lat' and -90 <= dds <= 90:
            return round(dds, 6)
        elif direction == 'long' and -180 <= dds <= 180:
            return round(dds, 6)
        return np.nan

    @staticmethod
    def _format_dms_to_dd(val, direction):
        pattern = GpsValidator.LAT_PATTERN if direction == 'lat' else GpsValidator.LONG_PATTERN
        mch = re.match(pattern, val.strip())

        if not mch:
            return np.nan

        deg = float(mch.group("deg"))
        mins = float(mch.group("min")) if mch.group("min") else 0
        secs = float(mch.group("sec")) if mch.group("sec") else 0
        dir_front = mch.group("dir_front")
        dir_back = mch.group("dir_back")

        dds = deg + mins / 60 + secs / 3600

        # hemisphere adjustments
        if direction == 'lat' and (dir_front == 'S' or dir_back == 'S'):
            dds = -dds
        elif direction == 'long' and (dir_front == 'W' or dir_back == 'W'):
            dds = -dds

        # range check and rounding
        bound = 90 if direction == 'lat' else 180
        if -bound <= dds <= bound:
            return round(dds, 6)

        return np.nan
