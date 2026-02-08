/**
 * ------------------------------------------------------------------
 * FERRARI OFFICIAL - MASTER SCRIPT
 * ------------------------------------------------------------------
 */

// --- 1. GLOBAL HELPERS & STATE ---
const urlParams = new URLSearchParams(window.location.search);
const currentModel = urlParams.get('model') || 'Ferrari F40';
const currentPriceBase = parseInt(urlParams.get('price')) || 550000;

let currentOptions = {
    rims: 0,
    calipers: 0,
    color: 'Red'
};

// --- 2. GLOBAL UI INTERACTIONS ---
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

const observerOptions = { root: null, rootMargin: '0px', threshold: 0.1 };
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
    el.style.opacity = '0'; 
    observer.observe(el);
});


// --- 3. CONFIGURATOR PAGE LOGIC ---
if (document.getElementById('3d-container')) {
    const container = document.getElementById('3d-container');
    let scene, camera, renderer, model;

    function init() {
        // Scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x111111); // Dark gray background

        // Camera
        camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        camera.position.set(0, 2, 5); // Adjusted camera position

        // Renderer
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); // Alpha for transparent bg if needed
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.toneMapping = THREE.ACESFilmicToneMapping; // Better color handling
        renderer.toneMappingExposure = 1.2; // Increase overall brightness
        renderer.outputEncoding = THREE.sRGBEncoding;
        container.appendChild(renderer.domElement);

        // --- LIGHTING SETUP (IMPROVED) ---
        
        // 1. Ambient Light (Base illumination)
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // Increased intensity
        scene.add(ambientLight);

        // 2. Hemisphere Light (Sky/Ground simulation)
        const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5); // Increased intensity
        hemisphereLight.position.set(0, 20, 0);
        scene.add(hemisphereLight);

        // 3. Directional Light (Key Light - Sun)
        const dirLight = new THREE.DirectionalLight(0xffffff, 3.0); // Strong key light
        dirLight.position.set(5, 10, 7.5);
        dirLight.castShadow = true;
        scene.add(dirLight);

        // 4. Fill Light (Opposite side)
        const fillLight = new THREE.DirectionalLight(0xffffff, 1.5);
        fillLight.position.set(-5, 5, -5);
        scene.add(fillLight);

        // 5. Back Light (Rim lighting)
        const backLight = new THREE.DirectionalLight(0xffffff, 1.0);
        backLight.position.set(0, 5, -10);
        scene.add(backLight);

        // Controls
        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.screenSpacePanning = false;
        controls.minDistance = 3;
        controls.maxDistance = 10;
        // Limit vertical angle to prevent going under the floor
        controls.maxPolarAngle = Math.PI / 2 - 0.05; 

        // Model Loader
        const loader = new THREE.GLTFLoader();
        loader.load('models/scene.gltf', function (gltf) {
            model = gltf.scene;
            model.scale.set(1.5, 1.5, 1.5);
            model.position.y = -0.8; // Lowered slightly
            scene.add(model);
            animate();
        }, undefined, function (error) {
            console.error('An error happened loading the model:', error);
        });

        window.addEventListener('resize', onWindowResize, false);
    }

    function onWindowResize() {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    }

    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }

    init();

    // --- INTERACTION LOGIC ---

    window.changeColor = function(colorName) {
        if (!model) return;

        // Map button names to Hex colors
        const colorMap = {
            'red': 0xd40000,
            'yellow': 0xfff200,
            'black': 0x111111,
            'silver': 0xc0c0c0,
            'blue': 0x0000ff
        };

        // Update Global State
        currentOptions.color = colorName.charAt(0).toUpperCase() + colorName.slice(1);

        // Update UI (Swatches)
        document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
        if(event && event.currentTarget) event.currentTarget.classList.add('active');

        // Apply to 3D Model
        const targetColor = new THREE.Color(colorMap[colorName]);
        
        model.traverse((child) => {
            if (child.isMesh) {
                // Heuristic: Look for materials likely to be the car body
                // Often named 'paint', 'body', 'chassis', 'car_paint', etc.
                const matName = child.material.name.toLowerCase();
                if (matName.includes('paint') || matName.includes('body') || matName.includes('metal')) {
                    child.material.color.set(targetColor);
                }
            }
        });
    };

    window.selectOption = function(btn, category, price, variant) {
        // UI Update
        const parent = btn.parentNode;
        parent.querySelectorAll('.option-btn').forEach(b => {
            b.classList.remove('active', 'border-white');
            b.classList.add('border-gray-800');
            b.querySelector('span:first-child').classList.remove('text-white');
            b.querySelector('span:first-child').classList.add('text-gray-300');
        });
        
        btn.classList.add('active', 'border-white');
        btn.classList.remove('border-gray-800');
        btn.querySelector('span:first-child').classList.add('text-white');

        // State Update
        currentOptions[category] = price;
        updatePriceDisplay();
        
        if (!model) return;

        // Logic to swap materials/meshes based on category
        // Note: This relies on specific mesh naming in the GLTF file
        model.traverse((child) => {
            if (child.isMesh) {
                if (category === 'rims' && child.material.name.includes('rim')) {
                    if (variant === 'carbon') {
                        child.material.color.set(0x111111); // Darken
                        child.material.roughness = 0.2;
                    } else {
                        child.material.color.set(0xaaaaaa); // Standard Silver
                        child.material.roughness = 0.4;
                    }
                }
                if (category === 'calipers' && child.material.name.includes('caliper')) {
                    if (variant === 'yellow') child.material.color.set(0xffd700);
                    else if (variant === 'red') child.material.color.set(0xd40000);
                    else child.material.color.set(0x888888); // Standard Grey
                }
            }
        });
    };

    function updatePriceDisplay() {
        const total = currentPriceBase + currentOptions.rims + currentOptions.calipers;
        document.getElementById('total-price').innerText = '$' + total.toLocaleString();
    }

    window.proceedToCheckout = function() {
        const total = currentPriceBase + currentOptions.rims + currentOptions.calipers;
        const params = new URLSearchParams({
            model: currentModel,
            color: currentOptions.color,
            total: total
        });
        window.location.href = `checkout.html?${params.toString()}`;
    }

    // Set Initial Text
    document.getElementById('configurator-title').innerText = currentModel;
    document.getElementById('total-price').innerText = '$' + currentPriceBase.toLocaleString();
}


// --- 4. CHECKOUT PAGE LOGIC ---
if (document.getElementById('checkout-form')) {
    const total = urlParams.get('total') || '0';
    const color = urlParams.get('color') || 'Standard';
    const model = urlParams.get('model') || 'Ferrari';

    // Set initial header summary
    document.getElementById('checkout-summary').innerText = 
        `${model} • ${color} • $${parseInt(total).toLocaleString()}`;

    window.handleCheckout = function(e) {
        e.preventDefault();
        
        const btn = document.querySelector('button[type="submit"]');
        btn.innerText = "Processing Payment...";
        btn.disabled = true;

        setTimeout(() => {
            document.getElementById('checkout-header').style.display = 'none';
            document.getElementById('checkout-form').style.display = 'none';
            document.getElementById('success-message').classList.remove('hidden');

            // Populate Receipt
            document.getElementById('receipt-model').innerText = model;
            document.getElementById('receipt-color').innerText = color;
            document.getElementById('receipt-total').innerText = '$' + parseInt(total).toLocaleString();
        }, 1500);
    }
}
