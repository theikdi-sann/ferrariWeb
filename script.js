/**
 * ------------------------------------------------------------------
 * FERRARI OFFICIAL - MASTER SCRIPT
 * ------------------------------------------------------------------
 */

// --- 1. GLOBAL HELPERS & STATE ---
const urlParams = new URLSearchParams(window.location.search);

// --- DATA INITIALIZATION ---
// Determine current car from 'id' param (new) or 'model' param (legacy)
let activeCar = null;

if (typeof getCarById === 'function') {
    // If car-data.js is loaded
    const carId = urlParams.get('id') || urlParams.get('model');
    activeCar = getCarById(carId);
} else {
    // Fallback for pages without car-data.js (like checkout, if not added there)
    // or if car-data.js failed to load.
    activeCar = {
        name: urlParams.get('model') || 'Ferrari',
        price: parseInt(urlParams.get('price')) || 0,
        modelFile: 'scene.gltf',
        config: { scale: 1.5, y: -0.8 }
    };
}

const currentModel = activeCar.name;
const currentPriceBase = activeCar.price;

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
    let scene, camera, renderer, model, controls;

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
        renderer.toneMappingExposure = 1.0; // Adjusted for HDRI
        renderer.outputEncoding = THREE.sRGBEncoding;
        container.appendChild(renderer.domElement);

        // --- ENVIRONMENT MAP (HDRI) ---
        // This is the key to realistic reflections
        new THREE.RGBELoader()
            .setPath('https://raw.githubusercontent.com/mrdoob/three.js/r142/examples/textures/equirectangular/')
            .load('royal_esplanade_1k.hdr', function (texture) {
                texture.mapping = THREE.EquirectangularReflectionMapping;
                scene.environment = texture; // Applies reflections to all objects
                
                // Optional: Reduce intensity if too bright
                // scene.environment.intensity = 0.5; // (Requires newer Three.js, handled via exposure here)
            });

        // --- SUPPLEMENTARY LIGHTING ---
        // We keep some lights for specific shadows and control, but reduce intensity
        // as the HDRI provides global illumination.
        
        // 1. Soft Ambient (Fill) - Reduced
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
        scene.add(ambientLight);

        // 2. Main Key Light (Shadow caster)
        const mainLight = new THREE.SpotLight(0xffffff, 1.2);
        mainLight.position.set(5, 12, 5);
        mainLight.angle = Math.PI / 4;
        mainLight.penumbra = 0.5;
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        mainLight.shadow.bias = -0.0001;
        scene.add(mainLight);

        // 3. Rim Light (Cooler)
        const rimLight = new THREE.DirectionalLight(0xddeeff, 0.8);
        rimLight.position.set(-5, 5, -8);
        scene.add(rimLight);

        // --- SHOWROOM FLOOR ---
        const floorGeometry = new THREE.PlaneGeometry(100, 100);
        const floorMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xe0e0e0, 
            roughness: 0.1, 
            metalness: 0.0,
            envMapIntensity: 0.5 // Prevent floor from being a perfect mirror
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -0.8;
        floor.receiveShadow = true;
        scene.add(floor);

        // Controls
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.screenSpacePanning = false;
        controls.minDistance = 3;
        controls.maxDistance = 10;
        // Limit vertical angle to prevent going under the floor
        controls.maxPolarAngle = Math.PI / 2 - 0.05; 

        // Model Loader
        const loader = new THREE.GLTFLoader();

        // Target File comes from the centralized Active Car object
        const targetFile = activeCar.modelFile || 'scene.gltf';
        const targetConfig = activeCar.config || { scale: 1.5, y: -0.8 };

        console.log(`[Configurator] Selected Model: "${currentModel}"`);
        console.log(`[Configurator] Target File: "${targetFile}"`);

        // Force resource path to ensure textures are found relative to the models directory
        loader.setResourcePath('models/');

        function loadCarModel(filename) {
            console.log(`[Configurator] Attempting to load: models/${filename}`);
            loader.load(`models/${filename}`, function (gltf) {
                console.log(`[Configurator] Success! Loaded: models/${filename}`);
                model = gltf.scene;
                
                // Apply Configuration from DB
                model.scale.set(targetConfig.scale, targetConfig.scale, targetConfig.scale);
                model.position.y = targetConfig.y;

                // Optional: Camera Adjustment per car (if defined in config)
                if (targetConfig.cameraZ) {
                     camera.position.z = targetConfig.cameraZ;
                }
                
                // Enable shadows and Fix Materials
                model.traverse((node) => {
                    if (node.isMesh) {
                        node.castShadow = true;
                        node.receiveShadow = true;
                        
                        // Boost environment map intensity for the car paint
                        if (node.material) {
                             node.material.envMapIntensity = 1.0;

                             // FIX: Make Glass Transparent to see Engine
                             if (node.material.name.toLowerCase().includes('glass')) {
                                 node.material.transparent = true;
                                 node.material.opacity = 0.25; // Clear glass
                                 node.material.roughness = 0.05;
                                 node.material.metalness = 0.9;
                                 node.material.side = THREE.DoubleSide; 
                                 node.material.depthWrite = false; // Fix rendering artifacts
                                 node.material.needsUpdate = true;
                             }
                        }
                    }
                });

                scene.add(model);
                
                // Apply default color (Red)
                changeColor('red');
                
                // Only start animation loop if not already running (though init calls this once)
                animate();

            }, undefined, function (error) {
                console.warn(`Failed to load models/${filename}. Falling back to default.`);
                if (filename !== 'scene.gltf') {
                    loadCarModel('scene.gltf');
                } else {
                    console.error('Critical: Default model failed to load.', error);
                    document.getElementById('configurator-title').innerText = "Model Not Found";
                }
            });
        }

        loadCarModel(targetFile);

        window.addEventListener('resize', onWindowResize, false);
    }

    function onWindowResize() {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    }

    function animate() {
        requestAnimationFrame(animate);
        if(controls) controls.update(); // Important for damping
        renderer.render(scene, camera);
    }

    // --- CAMERA CONTROLS ---

    window.viewEngine = function() {
        if (!model || !camera || !controls) return;
        
        // Move to Rear-Top View
        gsap.to(camera.position, {
            duration: 1.5,
            x: 0,
            y: 2.5,
            z: -4.0, // Behind the car
            ease: "power2.inOut"
        });

        gsap.to(controls.target, {
            duration: 1.5,
            x: 0,
            y: 0,
            z: 0,
            ease: "power2.inOut"
        });
    };

    window.resetZoom = function() {
        if (!model || !camera || !controls) return;
        
        // Reset to Front View
        gsap.to(camera.position, {
            duration: 1.5,
            x: 0,
            y: 2,
            z: 5,
            ease: "power2.inOut"
        });

        gsap.to(controls.target, {
            duration: 1.5,
            x: 0,
            y: 0,
            z: 0,
            ease: "power2.inOut"
        });
    };

    init();

    // --- INTERACTION LOGIC ---

    window.changeColor = function(colorName) {
        if (!model) return;

        // Photorealistic PBR Palette
        const colorMap = {
            'red': { hex: 0x900000, metalness: 0.9, roughness: 0.05, name: 'Rosso Corsa' },
            'yellow': { hex: 0xD4AF37, metalness: 0.8, roughness: 0.1, name: 'Giallo Modena' },
            'black': { hex: 0x010101, metalness: 0.95, roughness: 0.01, name: 'Nero Daytona' }, 
            'silver': { hex: 0x888888, metalness: 1.0, roughness: 0.1, name: 'Argento Nurburgring' },
            'blue': { hex: 0x00032b, metalness: 0.9, roughness: 0.05, name: 'Blu Tour de France' }
        };

        const target = colorMap[colorName] || colorMap['red'];
        currentOptions.color = target.name;

        // UI Update handled by button click directly or here if needed
        
        const targetColor = new THREE.Color(target.hex);
        
        model.traverse((child) => {
            if (child.isMesh) {
                const name = child.material.name.toLowerCase();

                // Exclusions
                if (name.includes('caliper') || name.includes('rim') || name.includes('wheel') || 
                    name.includes('carbon') || name.includes('glass') || name.includes('light') || 
                    name.includes('badge') || name.includes('grille') || name.includes('interior') ||
                    name.includes('engine') || name.includes('exhaust') || name.includes('paint3') || name.includes('paint5')) {
                    return;
                }

                if (name.includes('paint') || name.includes('body') || name.includes('metal_car') || name.includes('chassis')) {
                    child.material.color.set(targetColor);
                    if (child.material.isMeshStandardMaterial) {
                        child.material.metalness = target.metalness;
                        child.material.roughness = target.roughness;
                        child.material.envMapIntensity = 2.5; 
                    }
                }
            }
        });
    };

    window.changeRimColor = function(variant) {
        if (!model) return;
        
        const variants = {
            'silver': { hex: 0xdddddd, metalness: 0.9, roughness: 0.2 },
            'carbon': { hex: 0x1a1a1a, metalness: 0.5, roughness: 0.5 }, // Dark semi-matte
            'gold': { hex: 0xeebb00, metalness: 1.0, roughness: 0.1 },
            'black': { hex: 0x050505, metalness: 0.1, roughness: 0.6 } // Matte Black
        };
        const style = variants[variant] || variants['silver'];
        const color = new THREE.Color(style.hex);

        model.traverse((child) => {
            if (child.isMesh) {
                const name = child.material.name.toLowerCase();
                if (name.includes('rim') || name.includes('wheel')) {
                    // Exclude tires usually named 'tire' or 'rubber' if they share 'wheel' keyword, 
                    // but usually they are separate. Assuming safe for now.
                    if (!name.includes('tire') && !name.includes('rubber')) {
                        child.material.color.set(color);
                        if(child.material.isMeshStandardMaterial) {
                            child.material.metalness = style.metalness;
                            child.material.roughness = style.roughness;
                        }
                    }
                }
            }
        });
    };

    window.changeCaliperColor = function(colorName) {
        if (!model) return;
        
        const colors = {
            'red': 0xcc0000,
            'yellow': 0xffcc00,
            'black': 0x111111,
            'silver': 0xaaaaaa
        };
        const hex = colors[colorName] || colors['red'];
        const color = new THREE.Color(hex);

        model.traverse((child) => {
            if (child.isMesh) {
                const name = child.material.name.toLowerCase();
                if (name.includes('caliper')) {
                    child.material.color.set(color);
                }
            }
        });
    };

    window.changeInteriorColor = function(colorName) {
        if (!model) return;
        
        const colors = {
            'black': 0x111111,
            'tan': 0x8b5a2b, // Cuoio
            'red': 0x700000
        };
        const hex = colors[colorName] || colors['black'];
        const color = new THREE.Color(hex);

        model.traverse((child) => {
            if (child.isMesh) {
                const name = child.material.name.toLowerCase();
                if (name.includes('interior')) {
                    child.material.color.set(color);
                }
            }
        });
    };

    window.changeStripeColor = function(colorName) {
        if (!model) return;

        const colors = {
            'white': 0xffffff,
            'black': 0x111111,
            'blue': 0x001144, // NART Blue
            'yellow': 0xffcc00
        };
        const hex = colors[colorName] || colors['white'];
        const color = new THREE.Color(hex);

        model.traverse((child) => {
            if (child.isMesh) {
                const name = child.material.name.toLowerCase();
                // 488 Pista Livery is usually Paint3 (Central) and Paint5 (Edge)
                if (name.includes('paint3') || name.includes('paint5')) {
                    child.material.color.set(color);
                    child.material.metalness = 0.5;
                    child.material.roughness = 0.3; // Stickers are less glossy than body
                }
            }
        });
    };

    window.changeCarbonFinish = function(finish) {
        if (!model) return;

        model.traverse((child) => {
            if (child.isMesh) {
                const name = child.material.name.toLowerCase();
                if (name.includes('carbon')) {
                    if (finish === 'gloss') {
                        child.material.roughness = 0.2;
                        child.material.metalness = 0.8;
                        if(child.material.clearcoat !== undefined) child.material.clearcoat = 1.0;
                    } else { // Matte
                        child.material.roughness = 0.8;
                        child.material.metalness = 0.3;
                        if(child.material.clearcoat !== undefined) child.material.clearcoat = 0.0;
                    }
                    child.material.needsUpdate = true;
                }
            }
        });
    };

    window.changeWindowTint = function(level) {
        if (!model) return;

        model.traverse((child) => {
            if (child.isMesh) {
                const name = child.material.name.toLowerCase();
                if (name.includes('glass') || name.includes('window')) {
                    // Skip red/amber tail lights
                    if(name.includes('red') || name.includes('amber')) return; 

                    if (level === 'dark') {
                        child.material.color.set(0x000000);
                        child.material.opacity = 0.85;
                        child.material.roughness = 0.0;
                        child.material.metalness = 0.9;
                    } else { // Light
                        child.material.color.set(0xffffff);
                        child.material.opacity = 0.2;
                        child.material.roughness = 0.0;
                        child.material.metalness = 0.1;
                    }
                    child.material.transparent = true;
                    child.material.needsUpdate = true;
                }
            }
        });
    };

    window.changeBadgeColor = function(type) {
        if (!model) return;

        const color = (type === 'dark') ? new THREE.Color(0x555555) : new THREE.Color(0xffffff);

        model.traverse((child) => {
            if (child.isMesh) {
                const name = child.material.name.toLowerCase();
                if (name.includes('badge')) {
                    child.material.color.set(color);
                }
            }
        });
    };

    window.changeTailLights = function(type) {
        if (!model) return;

        model.traverse((child) => {
            if (child.isMesh) {
                const name = child.material.name.toLowerCase();
                
                // Target Tail Lights and Side Markers
                if (name.includes('glassred') || name.includes('glassamber')) {
                    if (type === 'smoked') {
                        // Smoked Look
                        child.material.color.set(0x440000); // Dark Red
                        child.material.opacity = 0.5; // More opaque
                        child.material.roughness = 0.1;
                    } else {
                        // Original
                        const originalColor = name.includes('red') ? 0xcc0000 : 0xffaa00;
                        child.material.color.set(originalColor);
                        child.material.opacity = 0.25; // Transparent
                        child.material.roughness = 0.0;
                    }
                }
            }
        });
    };

    window.changeGrilleColor = function(type) {
        if (!model) return;

        model.traverse((child) => {
            if (child.isMesh) {
                const name = child.material.name.toLowerCase();
                if (name.includes('grille')) {
                    if (type === 'titanium') {
                        child.material.color.set(0xaaaaaa);
                        child.material.metalness = 0.9;
                        child.material.roughness = 0.4;
                    } else { // Black
                        child.material.color.set(0x111111);
                        child.material.metalness = 0.1; // Matte
                        child.material.roughness = 0.9;
                    }
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
