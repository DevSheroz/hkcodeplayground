import dynamic from 'next/dynamic';


const PlotViewer = dynamic(() => import('./PlotViewer'), { ssr: false });

export default PlotViewer;
