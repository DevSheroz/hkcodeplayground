import json
from bokeh.plotting import figure, show
from bokeh.embed import json_item
from bokeh.palettes import Category10
from bokeh.models import DatetimeTickFormatter
from datetime import datetime
import pandas as pd
import numpy as np
import logging
import traceback

class BokehPlotter:
    def __init__(self, data, plot_type, columns, typeof_data):
        try:
            self.data = data
            self.plot_type = plot_type
            self.columns = columns.split(",")
            self.df = pd.DataFrame(data)
            self.df['timestamp'] = pd.to_datetime(self.df['timestamp'])
            self.typeof_data = typeof_data
            logging.info(f"BokehPlotter initialized with columns: {self.columns}")
        except Exception as e:
            logging.error(f"Error in BokehPlotter initialization: {e}")
            raise

    def get_plot_json(self):
        try:
            if self.plot_type == 'line':
                return self.line_plot()
            elif self.plot_type == 'bar':
                return self.bar_plot()
            else:
                raise ValueError("Unsupported plot type")
        except Exception as e:
            logging.error(f"Error in get_plot_json: {e}")
            raise

    def _get_colors(self):
        num_columns = len(self.columns)
        if num_columns == 1:
            return ["#3182CE"]
        elif num_columns == 2:
            return ["#3182CE", "#F56565"]
        elif num_columns <= 10:
            return Category10[num_columns]
        else:
            raise ValueError(f"Too many columns to plot, max supported is 10")

    def line_plot(self):
        try:
            p = figure(x_axis_type="datetime", title=f"Line Plot {self.typeof_data}", height=400, width=600)
            p.xaxis.formatter = DatetimeTickFormatter(
                hours="%m-%d %H:%M",
                days="%m-%d %H:%M",
                months="%m-%d %H:%M",
                years="%m-%d %H:%M",
            )
            
            colors = self._get_colors()
            logging.info(f"Colors used for plotting: {colors}")
            for idx, col in enumerate(self.columns):
                p.line(self.df['timestamp'], self.df[col], legend_label=col, color=colors[idx])
                # p.circle(self.df['timestamp'], self.df[col], legend_label=col, color=colors[idx], size=5)

            p.legend.title = 'Data'
            p.xaxis.axis_label = 'Timestamp'
            p.yaxis.axis_label = 'Values'

            return json_item(p)
        except Exception as e:
            logging.error(f"Error in line_plot: {e}")
            logging.error(traceback.format_exc())
            raise


    def bar_plot(self):
        try:
            p = figure(title=f"Histogram of {self.typeof_data}", height=400, width=600)
            colors = self._get_colors()
            for idx, col in enumerate(self.columns):
                hist, edges = np.histogram(self.df[col], bins=30)
                p.quad(top=hist, bottom=0, left=edges[:-1], right=edges[1:], fill_color=colors[idx], line_color="white", alpha=0.7, legend_label=col)

            p.legend.title = 'Data'
            p.xaxis.axis_label = 'Values'
            p.yaxis.axis_label = 'Frequency'

            return json_item(p)
        except Exception as e:
            logging.error(f"Error in bar_plot: {e}")
            logging.error(traceback.format_exc())
            raise
