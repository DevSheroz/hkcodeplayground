import folium
from folium.plugins import HeatMap
import pandas as pd
import logging
import traceback

class FoliumPlotter:
    def __init__(self, data, lat, lon):
        try:
            self.data = data
            self.lat = lat
            self.lon = lon
            self.df = pd.DataFrame(data)
            logging.info(f"FoliumPlotter initialized with latitude column: {self.lat}, longitude column: {self.lon}")
        except Exception as e:
            logging.error(f"Error in FoliumPlotter initialization: {e}")
            raise

    def heatmap_plot(self):
        try:
            if self.lat not in self.df.columns or self.lon not in self.df.columns:
                raise ValueError(f"Dataframe does not contain specified columns: {self.lat}, {self.lon}")

            m = folium.Map(location=[self.df[self.lat].mean(), self.df[self.lon].mean()], zoom_start=10)

            # Create a heatmap
            heat_data = [[row[self.lat], row[self.lon]] for index, row in self.df.iterrows()]
            HeatMap(heat_data, radius=5, blur=3).add_to(m)

            return m._repr_html_()
        except Exception as e:
            logging.error(f"Error in heatmap_plot: {e}")
            logging.error(traceback.format_exc())
            raise
