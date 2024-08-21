import numpy as np
import pandas as pd
from scipy.stats import kstest

from .gps_detector import GpsValidator

# DType Definitions
class DType:
    """Root of Type Tree"""

class Continuous(DType):
    """Type Continuous, Subtype of Numerical"""

class Nominal(DType):
    """Type Nominal, Subtype of Categorical"""

class Ordinal(DType):
    """Type Ordinal, Subtype of Categorical"""

class DateTime(DType):
    """Type DateTime, Subtype of Numerical"""

class SmallCardNum(Continuous):
    """Numerical column with small cardinality (distinct values)"""

class Latitude(DType):
    """Type Latitude, Subtype of GPS Coordinate"""

class Longitude(DType):
    """Type Longitude, Subtype of GPS Coordinate"""



def detect_dtype(col: pd.Series) -> DType:
    """Detects the dtype of a column."""

    if datetime_validate(col):
        return DateTime()

    # Check if the column is numerical
    if np.issubdtype(col.dtype, np.number):
        # Use GpsValidator to check if it's latitude or longitude
        if GpsValidator.validate_latitude(col).mean() > 0.9:
            return Latitude()
        if GpsValidator.validate_longitude(col).mean() > 0.9:
            return Longitude()

        # If not GPS data, continue with numerical detection
        if col.nunique() < 10:
            return SmallCardNum()
        
        
        return Continuous()

    # Handle string-based GPS detection
    if col.dtype == object or isinstance(col.dtype, pd.StringDtype):
        col_as_str = col.astype(str)

        # Check if the column contains latitude data
        if GpsValidator.validate_latitude(col_as_str).mean() > 0.9:
            return Latitude()
        
        # Check if the column contains longitude data
        if GpsValidator.validate_longitude(col_as_str).mean() > 0.9:
            return Longitude()

    # Categorical data type detection
    if isinstance(col.dtype, pd.CategoricalDtype) or col.dtype == object:
        if col.nunique() < 20:
            return Nominal()
        return Ordinal()

    # Default to Nominal for strings that don't match other types
    return Nominal()


def datetime_validate(col: pd.Series) -> bool:
    """Detects if a column is a datetime column."""

    datetime_patterns = {
        r'^\d{8}$': '%Y%m%d',  # YYYYMMDD
        r'^\d{14}$': '%Y%m%d%H%M%S',  # YYYYMMDDHHMMSS
        r'^\d{17}$': '%Y%m%d%H%M%S%f',  # YYYYMMDDHHMMSSsss (with milliseconds)
        r'^\d{4}[-/]\d{2}[-/]\d{2}$': '%Y-%m-%d',  # YYYY-MM-DD or YYYY/MM/DD
        r'^\d{4}[-/]\d{2}[-/]\d{2} \d{2}:\d{2}:\d{2}$': '%Y-%m-%d %H:%M:%S',  # YYYY-MM-DD HH:MM:SS
        r'^\d{4}/\d{2}/\d{2} \d{2}:\d{2}:\d{2}$': '%Y/%m/%d %H:%M:%S',  # YYYY/MM/DD HH:MM:SS
        r'^\d{4}[-/]\d{2}[-/]\d{2} \d{2}:\d{2}$': '%Y-%m-%d %H:%M',  # YYYY-MM-DD HH:MM (without seconds)
        r'^\d{2}[-/]\d{2}[-/]\d{4}$': '%d-%m-%Y',  # DD-MM-YYYY or DD/MM/YYYY
        r'^\d{2}[-/]\d{2}[-/]\d{4} \d{2}:\d{2}$': '%d-%m-%Y %H:%M',  # DD-MM-YYYY HH:MM (without seconds)
        r'^\d{2}[-/]\d{2}[-/]\d{4} \d{2}:\d{2}:\d{2}$': '%d-%m-%Y %H:%M:%S',  # DD-MM-YYYY HH:MM:SS
        r'^\d{4}[-/]\d{2}[-/]\d{2}T\d{2}:\d{2}:\d{2}$': '%Y-%m-%dT%H:%M:%S',  # ISO format: YYYY-MM-DDTHH:MM:SS
        r'^\d{4}[-/]\d{2}[-/]\d{2}T\d{2}:\d{2}:\d{2}\.\d+$': '%Y-%m-%dT%H:%M:%S.%f',  # ISO format with milliseconds
        r'^\d{4}[-/]\d{2}[-/]\d{2} \d{2}:\d{2}:\d{2}\.\d+$': '%Y-%m-%d %H:%M:%S.%f',  # YYYY-MM-DD HH:MM:SS.SSS (with milliseconds)
        r'^\d{4}[-/]\d{2}[-/]\d{2} \d{2}:\d{2}:\d{2}$': '%Y-%m-%d %H:%M:%S',  # YYYY-MM-DD HH:MM:SS with colons
    }

    def check_pattern(pattern):

        if col.astype(str).str.match(pattern).mean() > 0.9:
            try:
                pd.to_datetime(col.astype(str), format=datetime_patterns[pattern], errors='raise')
                return True
            except (ValueError, TypeError):
                return False
        return False

    if np.issubdtype(col.dtype, np.number):
        # Convert numerical data to string for pattern matching
        if any(map(check_pattern, datetime_patterns.keys())):
            return True

        # Check for Unix timestamps (2000/01/01 and onwards)
        if col.min() > 9.466524e8 and col.max() < 1e10 and len(col) == col.nunique():
            try:
                pd.to_datetime(col, unit='s', errors='raise')
                return True
            except (ValueError, TypeError):
                try:
                    pd.to_datetime(col, unit='ms', errors='raise')
                    return True
                except (ValueError, TypeError):
                    pass

    elif col.dtype == object or isinstance(col.dtype, pd.StringDtype):
        # Check if string data matches datetime patterns
        if any(map(check_pattern, datetime_patterns.keys())):
            return True

    return False
    

# EDAFrame Class
class EDAFrame:
    def __init__(self, df: pd.DataFrame):
        self.df = df
        self._eda_dtypes = self._detect_dtypes()

    def _detect_dtypes(self):
        """Detect the dtype of each column in the DataFrame."""
        return {col: detect_dtype(self.df[col]) for col in self.df.columns}

    def get_eda_dtype(self, col: str):
        """Return the inferred dtype for a given column."""
        return self._eda_dtypes.get(col)

    @property
    def columns(self):
        return self.df.columns


class DatasetInsights:
    def __init__(self, df: pd.DataFrame):
        self.edaframe = EDAFrame(df)
        self.df = self.edaframe.df
        self.nrows = self.df.shape[0]
        self.ncols = self.df.shape[1]
        self.overview = {}
        self.insights = []
        self.cat_uniq_count = {}
        self.data_type = {
            'numerical': 0,
            'nominal': 0,
            'ordinal': 0,
            'datetime': 0,
        }
        self.column_type = []

    def calculate_correlations(self, threshold: float = 0.8):
        """Calculate insights on highly correlated columns."""
        numerical_cols = [col for col, dtype in self.edaframe._eda_dtypes.items()
                        if isinstance(dtype, (Continuous, SmallCardNum))]
        if not numerical_cols:
            return

        # correlation matrix
        corr_matrix = self.df[numerical_cols].corr()

        # find highly correlated matrix
        for i in range(len(corr_matrix.columns)):
            for j in range(i):
                if abs(corr_matrix.iloc[i, j]) > threshold:
                    col1 = corr_matrix.columns[i]
                    col2 = corr_matrix.columns[j]
                    self.insights.append({
                        f'{col1}, {col2}': f'{col1} and {col2} have a high correlation of {corr_matrix.iloc[i, j]:.2f}',
                        "label": "HighCorrelation"
                    })

    def calculate_overview(self):
        miss_cells = self.df.isnull().sum().sum()
        miss_cells_percent = (self.df.isnull().sum().sum() / self.nrows) * 100
        duplic_cells =  self.nrows - self.df.drop_duplicates().shape[0]
        duplic_cells_percent = (duplic_cells / self.nrows) * 100
        self.overview = {
            'nrows': self.nrows,
            'ncols': self.ncols,
            'missing_cells': f'{miss_cells} ({round(miss_cells_percent)}%)',
            'duplicate_rows': f'{duplic_cells} ({round(duplic_cells_percent)}%)',
        }
        return self.overview

    def is_uniformly_distributed(self, col_data: pd.Series) -> bool:
        """Check if a numerical column is uniformly distributed."""
        normed_data = (col_data - col_data.min()) / (col_data.max() - col_data.min())
        # Kolmogorov-Smirnov uniform distribution
        _, p_value = kstest(normed_data, 'uniform')
        return p_value > 0.05  

    def generate_insights(self):
        for col in self.edaframe.columns:
            dtype = self.edaframe.get_eda_dtype(col)
            col_data = self.df[col]
            missing_percent = col_data.isnull().mean() * 100
            if missing_percent > 10:
                self.insights.append({col: f"{col} has {missing_percent:.2f}% missing values", "label": "Missing"})
            
            unique_values = col_data.nunique()
            if unique_values == 1:
                self.insights.append({col: f"{col} has a constant value", "label": "Constant"})
            elif unique_values > 0.5 * self.nrows:
                self.insights.append({col: f"{col} has high cardinality: {unique_values} unique values", "label": "HighCardinality"})

            if isinstance(dtype, (Continuous, SmallCardNum)):
                self.data_type['numerical'] += 1
                self.column_type.append({col: 'numerical'})
                if col_data.skew() > 1:
                    self.insights.append({col: f"{col} is skewed", "label": "Skewed"})
                if self.is_uniformly_distributed(col_data):
                    self.insights.append({col: f"{col} is uniformly distributed", "label": "Uniform"})
            # categorical 
            elif isinstance(dtype, Nominal):
                self.data_type['nominal'] += 1
                self.column_type.append({col: 'categorical', 'unique': col_data.nunique()})
            elif isinstance(dtype, Ordinal):
                self.data_type['ordinal'] += 1
                self.column_type.append({col: 'categorical', 'unique': col_data.nunique()})
            # datetime
            elif isinstance(dtype, DateTime):
                self.data_type['datetime'] += 1
                self.insights.append({col: f"{col} is a DateTime column"})
                self.column_type.append({col: 'datetime'})
            # GPS coords
            elif isinstance(dtype, Latitude):
                self.column_type.append({col: 'latitude'})
            elif isinstance(dtype, Longitude):
                self.column_type.append({col: 'longitude'})
        
        self.calculate_correlations(threshold=0.8)
        # self.column_type = {k: v for d in self.column_type for k, v in d.items()}
        return self.insights

    def get_report(self):
        return {
            'overview': self.calculate_overview(),
            'insights': self.generate_insights(),
            'types': self.data_type,
            'columnt_types': self.column_type
        }

