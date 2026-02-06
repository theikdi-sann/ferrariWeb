/**
 * ------------------------------------------------------------------
 * FERRARI OFFICIAL - MASTER SCRIPT
 * ------------------------------------------------------------------
 * Handles:
 * 1. Global UI (Navbar, Loader, Scroll Animations)
 * 2. Data Persistence (URL Parameters)
 * 3. Configurator Logic (Canvas Manipulation, Pricing)
 * 4. Checkout Logic (Form Handling)
 * ------------------------------------------------------------------
 */

// --- 1. GLOBAL HELPERS & STATE ---

// Get URL Parameters (Used to pass data between pages)
const urlParams = new URLSearchParams(window.location.search);
const currentModel = urlParams.get('model') || 'Ferrari Model';
const currentPriceBase = parseInt(urlParams.get('price')) || 550000;
const currentImgUrl = urlParams.get('img');

// Global Config State
let currentOptions = {
    rims: 0,
    calipers: 0,
    color: 'Red'
};

/**
 * ------------------------------------------------------------------
 * 2. GLOBAL UI INTERACTIONS
 * ------------------------------------------------------------------
 */

// Navbar Scroll Effect
const navbar = document.getElementById('navbar');
if (navbar) {
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('bg-black', 'shadow-lg', 'py-4');
            navbar.classList.remove('py-6');
        } else {
            navbar.classList.remove('bg-black', 'shadow-lg', 'py-4');
            navbar.classList.add('py-6');
        }
    });
}

// Loading Screen Fade Out
window.addEventListener('load', function() {
    const loader = document.getElementById('loader');
    if (loader) {
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
            }, 500);
        }, 800);
    }
});

// Scroll Animations (Fade In Up)
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
            entry.target.style.opacity = '1';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.animate-fade-in-up').forEach(el => {
    el.style.opacity = '0'; // Ensure hidden initially
    observer.observe(el);
});


/**
 * ------------------------------------------------------------------
 * 3. CONFIGURATOR PAGE LOGIC
 * Only runs if 'car-canvas' exists on the page
 * ------------------------------------------------------------------
 */
if (document.getElementById('car-canvas')) {
    
    // --- SETUP ---
    const canvas = document.getElementById('car-canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const sourceImg = document.getElementById('source-image');
    let originalImageData = null;
    let fallbackMode = false;

    // Set UI Initial State
    document.getElementById('configurator-title').innerText = currentModel;
    document.getElementById('total-price').innerText = '$' + currentPriceBase.toLocaleString();

    // Check if Overlays are supported (Only for the demo 296 GTB image)
    const areOverlaysSupported = (currentModel === '296 GTB');
    if (!areOverlaysSupported) {
        // Hide overlay divs if not supported
        document.querySelectorAll('.wheel-overlay').forEach(el => el.style.display = 'none');
    }

    // Load Image
    if (currentImgUrl) {
        sourceImg.src = currentImgUrl;
    } else {
        // Default fallback image
        sourceImg.src = "https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=2940&auto=format&fit=crop";
    }

    // Initialize Canvas on Image Load
    sourceImg.onload = function() {
        canvas.width = sourceImg.naturalWidth;
        canvas.height = sourceImg.naturalHeight;
        
        ctx.drawImage(sourceImg, 0, 0);
        
        try {
            // Save original pixels for restoration
            originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        } catch (e) {
            console.warn("CORS Protected Image: Switching to CSS Filter Mode");
            fallbackMode = true; 
        }
    };

    // --- INTERACTION FUNCTIONS ---

    // 1. Color Change Logic
    window.changeColor = function(color) {
        // UI Update (Swatches)
        document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
        event.currentTarget.classList.add('active');
        
        // Update State
        const colorMap = { 
            'red': 'Rosso Corsa', 
            'yellow': 'Giallo Modena', 
            'black': 'Nero', 
            'silver': 'Argento Nurburgring', 
            'blue': 'Blu Tour de France' 
        };
        currentOptions.color = colorMap[color];

        // Reset Zoom on color change
        resetZoom();

        // Mode A: Fallback (CSS Filters)
        if (fallbackMode || !originalImageData) {
            canvas.className = 'absolute inset-0 z-10'; // Reset classes
            if (color !== 'red') {
                canvas.classList.add(`filter-fallback-${color}`);
            }
            return;
        }

        // Mode B: Pixel Manipulation (Canvas)
        // Restore original red car first
        ctx.putImageData(originalImageData, 0, 0); 
        
        if (color === 'red') return; // Default is red, we are done

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Loop through every pixel
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // ALGORITHM: Is this pixel Ferrari Red?
            // Red must be dominant and saturated
            if ((r > g + 40) && (r > b + 40) && (r > 60)) {
                
                // Convert to HSL to preserve shading/lighting
                const [h, s, l] = rgbToHsl(r, g, b);
                let newR, newG, newB;

                if (color === 'yellow') {
                    // Hue ~55deg, Boost lightness slightly
                    const [nR, nG, nB] = hslToRgb(55/360, s, Math.min(l * 1.5, 0.9));
                    newR = nR; newG = nG; newB = nB;
                } 
                else if (color === 'black') {
                    // Desaturate completely, Darken heavily
                    const [nR, nG, nB] = hslToRgb(h, 0, l * 0.2);
                    newR = nR; newG = nG; newB = nB;
                }
                else if (color === 'silver') {
                    // Desaturate, Brighten
                    const [nR, nG, nB] = hslToRgb(h, 0, Math.min(l * 2.5, 0.9));
                    newR = nR; newG = nG; newB = nB;
                }
                else if (color === 'blue') {
                    // Hue ~220deg
                    const [nR, nG, nB] = hslToRgb(220/360, s, l * 0.8);
                    newR = nR; newG = nG; newB = nB;
                }

                data[i] = newR;
                data[i + 1] = newG;
                data[i + 2] = newB;
            }
        }
        ctx.putImageData(imageData, 0, 0);
    };

    // 2. Option Selection Logic (Rims/Calipers)
    window.selectOption = function(btn, category, price, variant) {
        // UI Reset (Siblings)
        const parent = btn.parentNode;
        parent.querySelectorAll('.option-btn').forEach(b => {
            b.classList.remove('active', 'border-white');
            b.classList.add('border-gray-800');
            b.querySelector('span:first-child').classList.remove('text-white');
            b.querySelector('span:first-child').classList.add('text-gray-300');
        });
        
        // Activate Clicked Button
        btn.classList.add('active', 'border-white');
        btn.classList.remove('border-gray-800');
        btn.querySelector('span:first-child').classList.add('text-white');

        // Update Price State
        currentOptions[category] = price;
        updatePriceDisplay();

        // Zoom Effect
        if (areOverlaysSupported) {
            document.getElementById('car-preview-container').classList.add('zoom-wheel');
        }

        // Handle Overlays (Visual Changes)
        if (areOverlaysSupported) {
            if (category === 'rims') {
                 const opacity = (variant === 'carbon') ? '0.6' : '0';
                 document.getElementById('rim-overlay-rear').style.opacity = opacity;
                 document.getElementById('rim-overlay-front').style.opacity = opacity;
            }
            if (category === 'calipers') {
                const opacity = (variant === 'silver') ? '0' : '0.9'; // Silver is default/transparent
                const color = (variant === 'yellow') ? '#facc15' : '#dc2626'; 
                
                const rearCal = document.getElementById('caliper-overlay-rear');
                const frontCal = document.getElementById('caliper-overlay-front');
                
                rearCal.style.opacity = opacity;
                rearCal.style.backgroundColor = color;
                frontCal.style.opacity = opacity;
                frontCal.style.backgroundColor = color;
            }
        }
    };

    // 3. Helper Functions
    function updatePriceDisplay() {
        const total = currentPriceBase + currentOptions.rims + currentOptions.calipers;
        document.getElementById('total-price').innerText = '$' + total.toLocaleString();
    }

    window.resetZoom = function() {
        document.getElementById('car-preview-container').classList.remove('zoom-wheel');
    }

    window.proceedToCheckout = function() {
        const total = currentPriceBase + currentOptions.rims + currentOptions.calipers;
        // Build URL parameters for the next page
        const params = new URLSearchParams({
            model: currentModel,
            color: currentOptions.color,
            total: total
        });
        window.location.href = `checkout.html?${params.toString()}`;
    }
}

/**
 * ------------------------------------------------------------------
 * 4. CHECKOUT PAGE LOGIC
 * Only runs if 'checkout-form' exists
 * ------------------------------------------------------------------
 */
if (document.getElementById('checkout-form')) {
    // Get Data from URL
    const total = urlParams.get('total') || '0';
    const color = urlParams.get('color') || 'Standard';
    const model = urlParams.get('model') || 'Ferrari';

    // Display Summary
    document.getElementById('checkout-summary').innerText = 
        `${model} • ${color} • $${parseInt(total).toLocaleString()}`;

    // Handle Submit
    window.handleCheckout = function(e) {
        e.preventDefault();
        
        // Fake Loading
        const btn = document.querySelector('button[type="submit"]');
        const originalText = btn.innerText;
        btn.innerText = "Processing...";
        btn.disabled = true;

        setTimeout(() => {
            document.getElementById('checkout-form').style.display = 'none';
            document.getElementById('success-message').classList.remove('hidden');
        }, 1500);
    }
}


/**
 * ------------------------------------------------------------------
 * 5. COLOR CONVERSION UTILITIES (Math Helpers)
 * ------------------------------------------------------------------
 */

function rgbToHsl(r, g, b) {
    r /= 255, g /= 255, b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max == min) {
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return [h, s, l];
}

function hslToRgb(h, s, l) {
    let r, g, b;
    if (s == 0) {
        r = g = b = l; // achromatic
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}
