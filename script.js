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

// Update Exit Link based on Category
const exitLink = document.getElementById('exit-link');
if (exitLink && activeCar) {
    if (activeCar.category === 'racing') {
        exitLink.href = 'racing.html';
    } else {
        exitLink.href = 'models.html';
    }
}

const currentModel = activeCar.name;
const currentPriceBase = activeCar.price;

// --- PRICING CONSTANTS ---
const PRICING = {
    paint: {
        'red': 0, // Rosso Corsa (Standard)
        'black': 0, // Nero Daytona
        'yellow': 12500, // Giallo Modena (Historical)
        'silver': 15000, // Argento Nurburgring
        'blue': 15000, // Blu Tour de France
        'pink': 30000, // Rosa Metallizzato (Special)
        'carbon': 250000 // Full Carbon Body
    },
    rims: {
        'silver': 0, // Standard
        'black': 4500, // Matte Black
        'gold': 7500, // Oro
        'carbon': 25000 // Carbon Fibre Wheels
    },
    calipers: {
        'silver': 0, // Standard
        'black': 1200, 
        'red': 1500, 
        'yellow': 1500
    },
    interior: {
        'black': 0,
        'tan': 4500,
        'red': 5500
    },
    stripes: {
        'none': 0, // Implicit
        'white': 12000,
        'black': 12000,
        'blue': 15000,
        'yellow': 15000
    },
    carbon: {
        'gloss': 0,
        'matte': 15000
    },
    tint: {
        'light': 0,
        'dark': 2500
    },
    details: {
        'original': 0,
        'dark': 3500, // Dark badges
        'red': 0,
        'smoked': 1500, // Smoked tails
        'black': 2000, // Black Grille
        'titanium': 4000
    },
    engine: {
        'black': 0,
        'red': 8000,
        'gold': 12000
    }
};

let currentOptions = {
    paint: 0,
    rims: 0,
    calipers: 0,
    interior: 0,
    stripes: 0,
    carbon: 0,
    tint: 0,
    details_badges: 0,
    details_lights: 0,
    details_grille: 0,
    engine: 0,
    
    // Config State
    colorName: 'Rosso Corsa'
};

// --- 2. GLOBAL UI INTERACTIONS ---
const navbar = document.getElementById('navbar');
if (navbar) {
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('bg-black/80', 'backdrop-blur-md', 'shadow-lg', 'py-4', 'border-transparent');
            navbar.classList.remove('py-6', 'border-white/10');
        } else {
            navbar.classList.remove('bg-black/80', 'backdrop-blur-md', 'shadow-lg', 'py-4', 'border-transparent');
            navbar.classList.add('py-6', 'border-white/10');
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

    // Force video play
    const video = document.getElementById('hero-video');
    if (video) {
        video.muted = true;
        video.play().catch(e => console.log("Auto-play prevented:", e));
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

    // --- HELPER: HANDLE SELECTION & PRICING ---
    function handleSelection(btn, category, subCategoryKey, priceKey) {
        if (!btn) return;

        // 1. UI: Toggle Active State
        const parent = btn.parentNode;
        Array.from(parent.children).forEach(child => {
            if (child.tagName === 'BUTTON') {
                child.classList.remove('active');
            }
        });

        // Add active class to clicked button
        btn.classList.add('active');

        // 2. Pricing Update
        let price = 0;
        if (PRICING[category] && PRICING[category][priceKey] !== undefined) {
            price = PRICING[category][priceKey];
        }
        
        // Store price. If subCategoryKey provided (e.g. 'details_badges'), use that, else use category.
        const storageKey = subCategoryKey || category;
        currentOptions[storageKey] = price;

        updatePriceDisplay();
    }

    function updatePriceDisplay() {
        let optionTotal = 0;
        for (const key in currentOptions) {
            if (typeof currentOptions[key] === 'number') {
                optionTotal += currentOptions[key];
            }
        }
        const total = currentPriceBase + optionTotal;
        
        // Animate the number change
        const el = document.getElementById('total-price');
        if(el) el.innerText = '$' + total.toLocaleString();
    }

    function updateConfiguratorUI() {
        if (!activeCar) return; 

        // RACING MODE: Show Facts, Hide Config
        if (activeCar.category === 'racing') {
            // Hide all standard options
            const optionIds = ['opt-paint', 'opt-rims-color', 'opt-calipers-color', 'opt-interior', 'opt-stripes', 'opt-carbon', 'opt-tint', 'opt-details', 'opt-engine'];
            optionIds.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.style.display = 'none';
            });

            // Hide Price/Checkout Footer
            const footer = document.querySelector('.bg-black.p-8.border-t');
            if (footer) footer.style.display = 'none';

            // Inject Facts if not present
            const sidebar = document.getElementById('config-sidebar');
            if (sidebar && !document.getElementById('racing-facts')) {
                const factsContainer = document.createElement('div');
                factsContainer.id = 'racing-facts';
                factsContainer.className = 'mb-10 animate-fade-in-up';
                
                let factsHTML = `<h4 class="font-display text-lg text-ferrari-red uppercase tracking-widest mb-6">Technical Specifications</h4>`;
                
                if (activeCar.facts) {
                    factsHTML += `<div class="space-y-4">`;
                    activeCar.facts.forEach(fact => {
                        factsHTML += `
                            <div class="flex justify-between border-b border-gray-800 pb-2">
                                <span class="text-gray-400 text-xs font-bold uppercase tracking-widest">${fact.label}</span>
                                <span class="text-white text-sm font-display uppercase">${fact.value}</span>
                            </div>
                        `;
                    });
                    factsHTML += `</div>`;
                } else {
                    factsHTML += `<p class="text-gray-500 text-sm">Race-spec configuration. No modifications allowed.</p>`;
                }

                // Add "Explore Only" message
                factsHTML += `
                    <div class="mt-8 p-4 bg-gray-900 border border-gray-800">
                        <i class="fas fa-info-circle text-ferrari-red mb-2"></i>
                        <p class="text-gray-400 text-xs leading-relaxed">
                            This is a competition vehicle. Configuration is locked to official team livery and specifications.
                        </p>
                    </div>
                `;

                factsContainer.innerHTML = factsHTML;
                sidebar.insertBefore(factsContainer, sidebar.firstChild);
            }
            return; // Stop standard UI updates
        }

        // STANDARD ROAD CAR MODE
        const options = activeCar.options || {};
        const mapping = {
            'paint': ['opt-paint'],
            'rims': ['opt-rims-color'],
            'calipers': ['opt-calipers-color'],
            'interior': ['opt-interior'],
            'stripes': ['opt-stripes'],
            'carbon': ['opt-carbon'],
            'tint': ['opt-tint'],
            'details': ['opt-details'],
            'engine': ['opt-engine']
        };

        for (const [key, ids] of Object.entries(mapping)) {
            const isAvailable = options[key];
            ids.forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    if (isAvailable) {
                         el.classList.remove('hidden');
                         el.style.display = ''; // Reset inline display if set
                    } else {
                         el.classList.add('hidden'); // Tailwind hidden
                         el.style.display = 'none'; // Force hide
                    }
                }
            });
        }
        
        // Special Handling for "View Engine" buttons if engine option is false
        if (options.engine === false) {
            const viewEngineBtn = document.querySelector('button[onclick="viewEngine()"]');
            if (viewEngineBtn) viewEngineBtn.style.display = 'none';
        }
    }

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
                        
                        // Debug Material Names
                        if (node.material) {
                            console.log(`[Material Debug] Mesh: "${node.name}", Material: "${node.material.name}"`);
                        }

                        // Boost environment map intensity for the car paint
                        if (node.material) {
                             node.material.envMapIntensity = 1.0;
                             
                             // Apply Metalness from Config
                             if (targetConfig.metalness !== undefined) {
                                 const name = node.material.name.toLowerCase();
                                 if (name.includes('paint') || 
                                     name.includes('body') || 
                                     name.includes('metal_car') ||
                                     name.includes('shell') ||
                                     name.includes('chassis') ||
                                     name.includes('exterior') ||
                                     name.includes('livery')) {
                                     
                                     node.material.metalness = targetConfig.metalness;
                                     // Also update roughness to match a typical car paint if it's too rough
                                     // node.material.roughness = 0.1; 
                                     node.material.needsUpdate = true;
                                     console.log(`[Configurator] Applied metalness ${targetConfig.metalness} to material: ${name}`);
                                 }
                             }

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
                // We pass null for btn here since it's initial load, but we could find the default red button
                const redBtn = document.querySelector('button[title="Rosso Corsa"]');
                if (redBtn) changeColor(redBtn, 'red');
                else changeColor(null, 'red');
                
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
        updateConfiguratorUI(); // Initialize UI based on options

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

    window.changeColor = function(btn, colorName) {
        handleSelection(btn, 'paint', null, colorName);
        if (!model) return;

        // Photorealistic PBR Palette
        const colorMap = {
            'red': { hex: 0x900000, metalness: 0.9, roughness: 0.05, name: 'Rosso Corsa' },
            'yellow': { hex: 0xD4AF37, metalness: 0.8, roughness: 0.1, name: 'Giallo Modena' },
            'black': { hex: 0x010101, metalness: 0.95, roughness: 0.01, name: 'Nero Daytona' }, 
            'silver': { hex: 0x888888, metalness: 1.0, roughness: 0.1, name: 'Argento Nurburgring' },
            'blue': { hex: 0x00032b, metalness: 0.9, roughness: 0.05, name: 'Blu Tour de France' },
            'pink': { hex: 0xFF007F, metalness: 0.85, roughness: 0.15, name: 'Rosa Metallizzato' },
            'carbon': { hex: 0x111111, metalness: 0.1, roughness: 0.8, name: 'Visible Carbon Fibre' }
        };

        const target = colorMap[colorName] || colorMap['red'];
        currentOptions.colorName = target.name;

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
                        
                        if (colorName === 'carbon') {
                            child.material.envMapIntensity = 0.5; // Less reflective for raw carbon
                        } else {
                            child.material.envMapIntensity = 2.5; 
                        }
                    }
                }
            }
        });
    };

    window.changeRimColor = function(btn, variant) {
        handleSelection(btn, 'rims', null, variant);
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

    window.changeCaliperColor = function(btn, colorName) {
        handleSelection(btn, 'calipers', null, colorName);
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

    window.changeInteriorColor = function(btn, colorName) {
        handleSelection(btn, 'interior', null, colorName);
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

    window.changeStripeColor = function(btn, colorName) {
        handleSelection(btn, 'stripes', null, colorName);
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

    window.changeCarbonFinish = function(btn, finish) {
        handleSelection(btn, 'carbon', null, finish);
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

    window.changeWindowTint = function(btn, level) {
        handleSelection(btn, 'tint', null, level);
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

    window.changeBadgeColor = function(btn, type) {
        handleSelection(btn, 'details', 'details_badges', type);
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

    window.changeTailLights = function(btn, type) {
        handleSelection(btn, 'details', 'details_lights', type);
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

    window.changeGrilleColor = function(btn, type) {
        handleSelection(btn, 'details', 'details_grille', type);
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

    window.changeEngineColor = function(btn, colorName) {
         handleSelection(btn, 'engine', null, colorName);
         // Logic to change engine color if applicable in your model...
         console.log('Engine color changed to', colorName);
    };

    window.proceedToCheckout = function() {
        const total = document.getElementById('total-price').innerText.replace('$','').replace(/,/g,'');
        const params = new URLSearchParams({
            model: currentModel,
            color: currentOptions.colorName,
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
