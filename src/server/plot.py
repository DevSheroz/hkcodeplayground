import pandas as pd
from bokeh.plotting import figure
from bokeh.io import curdoc
from bokeh.embed import json_item
from bokeh.layouts import column

class BokehPlotter:
    def __init__(self, data, plot_type, column):
        self.data = pd.DataFrame(data)
        self.plot_type = plot_type
        self.column = column

    def create_plot(self):
        if self.plot_type == 'scatter':
            self.plot = self._create_scatter_plot()
        elif self.plot_type == 'line':
            self.plot = self._create_line_plot()
        elif self.plot_type == 'bar':
            self.plot = self._create_bar_plot()
        else:
            raise ValueError(f"Unsupported plot type: {self.plot_type}")
        return self.plot

    def _create_scatter_plot(self):
        plot = figure(title=f"{self.column} Scatter")
        plot.scatter(self.data['x'], self.data['y'])
        return plot

    def _create_line_plot(self):
        plot = figure(title=f"{self.column} Line Plot")
        plot.line(self.data['x'], self.data['y'])
        return plot

    def _create_bar_plot(self):
        plot = figure(title="Bar Plot", x_range=self.data['x'].astype(str))
        plot.vbar(x=self.data['x'].astype(str), top=self.data['y'], width=0.9)
        return plot

    def get_plot_json(self):
        if not self.plot:
            self.create_plot()
        return json_item(self.plot)