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
        const studioColor = 0xe0e0e0; // Premium Studio Gray
        scene.background = new THREE.Color(studioColor);
        scene.fog = new THREE.Fog(studioColor, 10, 50); // Seamless floor blending

        // Camera
        camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        camera.position.set(0, 2, 5); // Adjusted camera position

        // Renderer
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); // Alpha for transparent bg if needed
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.shadowMap.enabled = true; // Enable shadows
        renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Soft shadows
        renderer.toneMapping = THREE.ACESFilmicToneMapping; // Better color handling
        renderer.toneMappingExposure = 1.2; // Increase overall brightness
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Soft shadows
        container.appendChild(renderer.domElement);

        // --- NATURAL STUDIO LIGHTING ---
        
        // 1. Soft Ambient (Fill)
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambientLight);

        // 2. Hemisphere (Sky/Ground reflection simulation) - Cool Sky, Warm Ground
        const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xe0e0e0, 0.5);
        scene.add(hemisphereLight);

        // 3. Main Key Light (Soft SpotLight simulating a large softbox)
        const mainLight = new THREE.SpotLight(0xffffff, 1.5);
        mainLight.position.set(5, 12, 5);
        mainLight.angle = Math.PI / 4;
        mainLight.penumbra = 0.5; // Soft edges
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 2048; // High res shadows
        mainLight.shadow.mapSize.height = 2048;
        mainLight.shadow.bias = -0.0001;
        scene.add(mainLight);

        // 4. Rim Light (Cooler, sharp back light for edge definition)
        const rimLight = new THREE.DirectionalLight(0xddeeff, 1.0);
        rimLight.position.set(-5, 5, -8);
        scene.add(rimLight);

        // 5. Front Fill (Subtle warm front light)
        const fillLight = new THREE.DirectionalLight(0xffeedd, 0.5);
        fillLight.position.set(-5, 2, 5);
        scene.add(fillLight);

        // --- SHOWROOM FLOOR ---
        const floorGeometry = new THREE.PlaneGeometry(100, 100);
        const floorMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xe0e0e0, // Match fog/bg
            roughness: 0.1,  // Glossy reflection
            metalness: 0.0
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -0.8;
        floor.receiveShadow = true;
        scene.add(floor);

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
            
            // Enable shadows for the car
            model.traverse((node) => {
                if (node.isMesh) {
                    node.castShadow = true;
                    node.receiveShadow = true;
                }
            });

            scene.add(model);
            
            // Apply default color (Red)
            changeColor('red');
            
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
        const swatches = document.querySelectorAll('.color-swatch');
        swatches.forEach(s => s.classList.remove('active'));
        
        if(window.event && window.event.currentTarget && window.event.currentTarget.classList.contains('color-swatch')) {
            window.event.currentTarget.classList.add('active');
        } else {
            // Fallback for programmatic calls: find button by onclick attribute
            const targetBtn = Array.from(swatches).find(btn => 
                btn.getAttribute('onclick').includes(`'${colorName}'`)
            );
            if (targetBtn) targetBtn.classList.add('active');
        }

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
