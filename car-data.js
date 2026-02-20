/**
 * Central Configuration for all Ferrari Models
 * Edit this file to add cars, change prices, or update images.
 */
const CAR_DATABASE = [
    {
        id: 'enzo',
        name: 'Enzo Ferrari',
        price: 3500000,
        image: './images/enzo.png',
        modelFile: 'enzo.glb',
        config: { scale: 135.0, y: -0.8, metalness: 0.9},
        options: {
            paint: true,
            rims: true,
            calipers: false,
            interior: true,
            stripes: false,
            carbon: true,
            tint: true,
            details: false,
            engine: true 
        }
    },
    {
        id: 'portofino',
        name: 'Portofino',
        price: 320000,
        image: './images/portofino.png',
        modelFile: 'portofino.glb',
        config: { scale: 0.8, y: -0.5, metalness: 0.7},
        options: {
            paint: true,
            rims: true,
            calipers: false,
            interior: true,
            stripes: false,
            carbon: false,
            tint: true,
            details: false,
            engine:true 
        }
    },
    {
        id: 'roma',
        name: 'Roma',
        price: 4000000,
        image: './images/roma.png',
        modelFile: 'roma.glb',
        config: { scale: 137, y: -0.5, metalness: 0.7},
        options: {
            paint: true,
            rims: true,
            calipers: false,
            interior: true,
            stripes: false,
            carbon: true,
            tint: false,
            details: false,
            engine:true 
        }
    },


    {
        id: 'f40',
        name: 'F40',
        price: 4000000,
        image: './images/f40.png',
        modelFile: 'f40.glb',
        config: { scale: 140, y: -0.8, metalness: 0.7},
        options: {
            paint: true,
            rims: true,
            calipers: false,
            interior: true,
            stripes: false,
            carbon: true,
            tint: true,
            details: false,
            engine:true 
        }
    },


    {
        id: 'laferrari',
        name: 'LaFerrari',
        price: 4000000,
        image: './images/laferrari.png',
        modelFile: 'laferrari.glb',
        config: { scale: 1.4, y: -0.8, metalness: 0.7},
        options: {
            paint: true,
            rims: true,
            calipers: false,
            interior: true,
            stripes: false,
            carbon: true,
            tint: true,
            details: false,
            engine: true 
        }
    },

    {
        id: 'sf90-spider',
        name: 'SF90 Spider',
        price: 850000,
        image: './images/sf90.png',
        modelFile: 'sf90_spider.glb',
        config: { scale: 140, y: -0.8, metalness: 0.7},
        options: {
            paint: true,
            rims: true,
            calipers: false,
            interior: true,
            stripes: false,
            carbon: true,
            tint: false,
            details: false,
            engine:true 
        }
    },
  {
    id: '488-pista',
    name: "488 Pista",
    price: 900000,
    image: './images/488_pista.png',
    modelFile: '488_pista.glb',
    config: { scale: 90, y: -0.5, metalness: 0.7},
    options: {
        paint: true,
        rims: true,
        calipers: true,
        interior: true,
        stripes: true,
        carbon: true,
        tint: true,
        details: true,
        engine:true 
    }

  },
    {
        id: 'monza-sp1',
        name: 'Monza SP1',
        price: 850000,
        image: './images/monza-sp1.png',
        modelFile: 'monza-sp1.glb',
        config: { scale: 140, y: -0.6,metalness: 0.7},
        options: {
            paint: true,
            rims: true,
            calipers: false,
            interior: true,
            stripes: false,
            carbon: true,
            tint: false,
            details: false,
            engine:true 
        }
    },

  // Racing
    {
        id: 'f1',
        name: 'Ferrari F1',
        category: 'racing',
        price: 15000000, 
        image: './images/f1.png', 
        modelFile: 'f1.glb',
        config: { scale: 1.0, y: -0.7, metalness: 0.7 },
        facts: [
            { label: 'Engine', value: '1.6L V6 Turbo Hybrid' },
            { label: 'Power', value: '1000+ CV' },
            { label: 'Weight', value: '798 kg' },
            { label: 'Top Speed', value: '340+ km/h' }
        ],
        options: {
            paint: false,
            rims: false,
            calipers: false,
            interior: false,
            stripes: false,
            carbon: true,
            tint: false,
            details: true,
            engine:true 
        }
    },
    {
        id: '296-gt3',
        name: 'Ferrari 296 GT3',
        category: 'racing',
        price: 650000,
        image: './images/269gt3.png',
        modelFile: '296_gt3.glb',
        config: { scale: 140.0, y: 0 ,metalness: 0.7},
        facts: [
            { label: 'Engine', value: '3.9L Twin-Turbo V6' },
            { label: 'Power', value: '600 CV (BoP)' },
            { label: 'Chassis', value: 'Aluminum Monocoque' },
            { label: 'Success', value: '24h Nürburgring Winner' }
        ],
        options: {
            paint: true, // Teams customize liveries
            rims: true,
            calipers: true,
            interior: false,
            stripes: true,
            carbon: true,
            tint: false,
            details: true,
            engine:true 
        }
    },
];

// Helper to find car by ID (or name for backward compatibility)
function getCarById(id) {
    return CAR_DATABASE.find(c => c.id === id) || 
           CAR_DATABASE.find(c => c.name === id) || 
           CAR_DATABASE[0]; // Default to first car
}

/**
 * Reusable function to render car grids
 * @param {string} containerId - The DOM ID of the container
 * @param {function} filterFn - Function to filter CAR_DATABASE (e.g., car => car.category === 'racing')
 * @param {function} templateFn - Function returning HTML string for a car object
 */
function renderCarGrid(containerId, filterFn, templateFn) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const filteredCars = CAR_DATABASE.filter(filterFn);
    
    filteredCars.forEach(car => {
        const cardWrapper = document.createElement('div');
        // If template returns a single element string, we can set innerHTML
        // But for flexibility, let's assume templateFn returns the inner HTML content 
        // and we wrap it, or templateFn returns a DOM node.
        // Let's stick to the previous pattern: create a wrapper (a or div) and set innerHTML.
        
        // However, models.html uses <a> as wrapper, racing.html uses <div>.
        // So templateFn should probably return the whole element or we handle it.
        
        const element = templateFn(car);
        if (element instanceof HTMLElement) {
            container.appendChild(element);
        } else {
            // Fallback if string is returned
            container.innerHTML += element;
        }
    });
}
