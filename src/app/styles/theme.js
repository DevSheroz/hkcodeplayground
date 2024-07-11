import { extendTheme } from '@chakra-ui/react';
import '@fontsource/nunito/400.css';
import '@fontsource/nunito/700.css';

const theme = extendTheme({
    fonts: {
        heading: `'Nunito', sans-serif`,
        body: `'Nunito', sans-serif`,
    },
});

export default theme;