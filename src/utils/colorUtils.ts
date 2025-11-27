// Color utility functions for the Color Match Challenge game

/**
 * Convert RGB values to hex color string
 */
export function rgbToHex(r: number, g: number, b: number): string {
    const toHex = (n: number) => {
        const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Parse hex color string to RGB values
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        }
        : null;
}

/**
 * Convert RGB to LAB color space (needed for Delta E calculation)
 */
function rgbToLab(r: number, g: number, b: number): { l: number; a: number; b: number } {
    // Convert RGB to XYZ
    let rNorm = r / 255;
    let gNorm = g / 255;
    let bNorm = b / 255;

    // Apply gamma correction
    rNorm = rNorm > 0.04045 ? Math.pow((rNorm + 0.055) / 1.055, 2.4) : rNorm / 12.92;
    gNorm = gNorm > 0.04045 ? Math.pow((gNorm + 0.055) / 1.055, 2.4) : gNorm / 12.92;
    bNorm = bNorm > 0.04045 ? Math.pow((bNorm + 0.055) / 1.055, 2.4) : bNorm / 12.92;

    // Convert to XYZ using D65 illuminant
    const x = rNorm * 0.4124564 + gNorm * 0.3575761 + bNorm * 0.1804375;
    const y = rNorm * 0.2126729 + gNorm * 0.7151522 + bNorm * 0.072175;
    const z = rNorm * 0.0193339 + gNorm * 0.119192 + bNorm * 0.9503041;

    // Convert XYZ to LAB
    const xn = 0.95047; // D65 white point
    const yn = 1.0;
    const zn = 1.08883;

    const fx = x / xn > 0.008856 ? Math.pow(x / xn, 1 / 3) : 7.787 * (x / xn) + 16 / 116;
    const fy = y / yn > 0.008856 ? Math.pow(y / yn, 1 / 3) : 7.787 * (y / yn) + 16 / 116;
    const fz = z / zn > 0.008856 ? Math.pow(z / zn, 1 / 3) : 7.787 * (z / zn) + 16 / 116;

    const l = 116 * fy - 16;
    const a = 500 * (fx - fy);
    const bVal = 200 * (fy - fz);

    return { l, a, b: bVal };
}

/**
 * Calculate Delta E (CIE76) - perceptual color difference
 * Returns a value where 0 = identical colors, higher = more different
 * Typical values: 0-1 (not perceptible), 1-2 (perceptible through close observation),
 * 2-10 (perceptible at a glance), 11-49 (colors are more similar than opposite), 100 (exact opposite)
 */
export function calculateDeltaE(
    rgb1: { r: number; g: number; b: number },
    rgb2: { r: number; g: number; b: number }
): number {
    const lab1 = rgbToLab(rgb1.r, rgb1.g, rgb1.b);
    const lab2 = rgbToLab(rgb2.r, rgb2.g, rgb2.b);

    const deltaL = lab1.l - lab2.l;
    const deltaA = lab1.a - lab2.a;
    const deltaB = lab1.b - lab2.b;

    return Math.sqrt(deltaL * deltaL + deltaA * deltaA + deltaB * deltaB);
}

/**
 * Calculate score based on Delta E distance
 * Perfect match (deltaE = 0) = 1000 points
 * Score decreases as distance increases
 */
export function calculateScore(deltaE: number): number {
    // Maximum reasonable deltaE for scoring (anything beyond this gets 0 points)
    const maxDeltaE = 100;

    // Clamp deltaE to max
    const clampedDelta = Math.min(deltaE, maxDeltaE);

    // Calculate score using exponential decay for better feel
    // This gives more points for being close, less for being far
    const normalizedDelta = clampedDelta / maxDeltaE;
    const score = Math.round(1000 * Math.pow(1 - normalizedDelta, 2));

    return Math.max(0, score);
}

/**
 * Generate a random hex color
 */
export function generateRandomColor(): string {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return rgbToHex(r, g, b);
}

/**
 * Get a human-readable description of color accuracy
 */
export function getAccuracyDescription(deltaE: number): string {
    if (deltaE < 1) return 'Perfect!';
    if (deltaE < 2) return 'Excellent!';
    if (deltaE < 5) return 'Very Good';
    if (deltaE < 10) return 'Good';
    if (deltaE < 20) return 'Fair';
    if (deltaE < 40) return 'Poor';
    return 'Very Poor';
}

/**
 * Interpolate between two colors
 */
export function interpolateColor(
    color1: { r: number; g: number; b: number },
    color2: { r: number; g: number; b: number },
    factor: number
): { r: number; g: number; b: number } {
    const r = Math.round(color1.r + (color2.r - color1.r) * factor);
    const g = Math.round(color1.g + (color2.g - color1.g) * factor);
    const b = Math.round(color1.b + (color2.b - color1.b) * factor);
    return { r, g, b };
}

/**
 * Generate a random color that is significantly different from the previous color
 * Ensures minimum Delta E distance for better gameplay
 */
export function generateDistinctColor(previousColor?: string, minDeltaE: number = 50): string {
    const maxAttempts = 20;
    let attempts = 0;

    while (attempts < maxAttempts) {
        const newColor = generateRandomColor();

        // If no previous color, return the new color
        if (!previousColor) {
            return newColor;
        }

        // Check if the new color is different enough
        const prevRgb = hexToRgb(previousColor);
        const newRgb = hexToRgb(newColor);

        if (prevRgb && newRgb) {
            const deltaE = calculateDeltaE(prevRgb, newRgb);

            // If colors are different enough, return the new color
            if (deltaE >= minDeltaE) {
                return newColor;
            }
        }

        attempts++;
    }

    // Fallback: return a random color even if not different enough
    return generateRandomColor();
}
