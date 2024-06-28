import pandas as pd
import numpy as np
from scipy.ndimage import gaussian_filter1d

class DataFilter:
    def __init__(self, data, selected_filter, input_value, checkboxes, column):
        self.df = pd.DataFrame(data)
        self.selected_filter = selected_filter
        self.input_value = input_value
        self.checkboxes = checkboxes
        self.column = column

    def apply_filter(self):
        filtered_df = self.df

        # Apply numeric filter first if an input value is provided
        if self.input_value:
            filtered_df = self.apply_numeric_filter(filtered_df, self.selected_filter, self.column, self.input_value)

        # Define the filters available
        filters = {
            'iqr': self.iqr_filter,
            'movingAvg': self.moving_average_filter,
            'gaussian': self.gaussian_smoothing
        }

        # Apply each selected filter from checkboxes
        for key, apply in self.checkboxes.items():
            if apply and key in filters:
                filtered_df = filters[key](filtered_df, self.column)

        return filtered_df

    def apply_numeric_filter(self, df, selected_filter, column, input_value):
        try:
            input_value = float(input_value)
        except ValueError:
            return df

        operations = {
            "=": lambda df, column, value: df[df[column] == value],
            "!=": lambda df, column, value: df[df[column] != value],
            ">": lambda df, column, value: df[df[column] > value],
            ">=": lambda df, column, value: df[df[column] >= value],
            "<": lambda df, column, value: df[df[column] < value],
            "<=": lambda df, column, value: df[df[column] <= value],
        }

        if selected_filter in operations:
            return operations[selected_filter](df, column, input_value)
        else:
            return df

    def iqr_filter(self, df: pd.DataFrame, column: str) -> pd.DataFrame:
        Q1 = df[column].quantile(0.25)
        Q3 = df[column].quantile(0.75)
        IQR = Q3 - Q1
        
        lower_bound = Q1 - 1.5 * IQR
        upper_bound = Q3 + 1.5 * IQR
        
        filtered_df = df[(df[column] >= lower_bound) & (df[column] <= upper_bound)]
        
        return filtered_df

    def moving_average_filter(self, df: pd.DataFrame, column: str, window_size: int = 5, threshold: float = 1.5) -> pd.DataFrame:
        moving_avg = df[column].rolling(window=window_size, center=True).mean()
        deviation = np.abs(df[column] - moving_avg)
        median_deviation = deviation.rolling(window=window_size, center=True).median()
        
        filtered_df = df[deviation <= (threshold * median_deviation)]
        
        return filtered_df

    def gaussian_smoothing(self, df: pd.DataFrame, column: str, sigma: float = 1.0) -> pd.DataFrame:
        smoothed_values = gaussian_filter1d(df[column].values, sigma=sigma)
        
        smoothed_df = df.copy()
        smoothed_df[column] = smoothed_values
        
        return smoothed_df
    



    
