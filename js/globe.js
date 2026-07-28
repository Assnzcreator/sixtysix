import createGlobe from 'https://cdn.jsdelivr.net/npm/cobe@0.6.3/+esm';

export function initGlobe() {
    const canvas = document.getElementById('cobeCanvas');
    if (!canvas) return;

    const markers = [
        { location: [51.51, -0.13], size: 0.05 }, // London
        { location: [40.71, -74.01], size: 0.05 }, // New York
        { location: [-23.55, -46.63], size: 0.05 }, // São Paulo
        { location: [35.68, 139.65], size: 0.05 }, // Tokyo
        { location: [37.77, -122.41], size: 0.05 } // San Francisco
    ];

    let pointerInteracting = null;
    let pointerInteractionMovement = { phi: 0, theta: 0 };
    let phiOffset = 0;
    let thetaOffset = 0;
    let isPaused = false;
    let phi = 0;
    const speed = 0.003;

    canvas.addEventListener('pointerdown', (e) => {
        pointerInteracting = { x: e.clientX, y: e.clientY };
        canvas.style.cursor = 'grabbing';
        isPaused = true;
    });

    window.addEventListener('pointerup', () => {
        if (pointerInteracting !== null) {
            phiOffset += pointerInteractionMovement.phi;
            thetaOffset += pointerInteractionMovement.theta;
            pointerInteractionMovement = { phi: 0, theta: 0 };
        }
        pointerInteracting = null;
        canvas.style.cursor = 'grab';
        isPaused = false;
    });

    window.addEventListener('pointermove', (e) => {
        if (pointerInteracting !== null) {
            pointerInteractionMovement = {
                phi: (e.clientX - pointerInteracting.x) / 300,
                theta: (e.clientY - pointerInteracting.y) / 1000,
            };
        }
    });

    let globe = null;

    function init() {
        const width = canvas.offsetWidth;
        if (width === 0 || globe) return;

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        globe = createGlobe(canvas, {
            devicePixelRatio: dpr,
            width: width * dpr,
            height: width * dpr,
            phi: 0,
            theta: 0.2,
            dark: 1,
            diffuse: 1.5,
            mapSamples: 16000,
            mapBrightness: 10,
            baseColor: [0.1, 0.1, 0.1],
            markerColor: [0.2, 0.8, 0.9],
            glowColor: [0.05, 0.05, 0.05],
            markerElevation: 0,
            markers: markers,
            arcs: [],
            arcColor: [0.3, 0.85, 0.95],
            arcWidth: 0.5,
            arcHeight: 0.25,
            opacity: 0.7,
            onRender: (state) => {
                if (!isPaused) {
                    phi += speed;
                }
                state.phi = phi + phiOffset + pointerInteractionMovement.phi;
                state.theta = 0.2 + thetaOffset + pointerInteractionMovement.theta;
            }
        });

        setTimeout(() => {
            canvas.style.opacity = '1';
        }, 100);
    }

    if (canvas.offsetWidth > 0) {
        init();
    } else {
        const ro = new ResizeObserver((entries) => {
            if (entries[0]?.contentRect.width > 0) {
                ro.disconnect();
                init();
            }
        });
        ro.observe(canvas);
    }
}
