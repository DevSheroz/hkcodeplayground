import React from 'react';

const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.1)', 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000, 
    },
    container: {
        display: 'flex',
        flexFlow: 'row nowrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '2em',
    },
    bar: {
        width: '0.3em',
        height: '1em',
        backgroundColor: '#3182CE',
        animation: 'grow 1s ease-in-out infinite',
    },
    bar1: {
        animationDelay: '-0.45s',
    },
    bar2: {
        animationDelay: '-0.3s',
    },
    bar3: {
        animationDelay: '-0.15s',
    },
};

const keyframes = `
@keyframes grow {
    0%, 100% {
        transform: scaleY(1);
    }
    50% {
        transform: scaleY(2);
    }
}
`;

const AnimatedBars = () => {
    return (
        <>
            <style>
                {keyframes}
            </style>
            <div style={styles.overlay}>
                <div style={styles.container}>
                    <span style={{ ...styles.bar, ...styles.bar1 }}></span>
                    <span style={{ ...styles.bar, ...styles.bar2 }}></span>
                    <span style={{ ...styles.bar, ...styles.bar3 }}></span>
                    <span style={styles.bar}></span>
                </div>
            </div>
        </>
    );
};

export default AnimatedBars;
