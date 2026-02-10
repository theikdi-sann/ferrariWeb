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
        config: { scale: 140.0, y: 0 },
        options: {
            paint: true,
            rims: true,
            calipers: true,
            interior: true,
            stripes: false,
            carbon: true,
            tint: true,
            details: true,
            engine: true
        }
    },
    {
        id: 'portofino',
        name: 'Portofino',
        price: 320000,
        image: './images/portofino.png',
        modelFile: 'portofino.glb',
        config: { scale: 0.8, y: 0},
        options: {
            paint: true,
            rims: true,
            calipers: true,
            interior: true,
            stripes: false,
            carbon: false,
            tint: true,
            details: false,
            engine: false
        }
    },
    {
        id: 'roma',
        name: 'Roma',
        price: 4000000,
        image: './images/laferrari.png',
        modelFile: 'roma.glb',
        config: { scale: 150, y: 0.5},
        options: {
            paint: true,
            rims: true,
            calipers: true,
            interior: true,
            stripes: false,
            carbon: true,
            tint: true,
            details: true,
            engine: true
        }
    },


    {
        id: 'f40',
        name: 'F40',
        price: 4000000,
        image: './images/f40.png',
        modelFile: 'f40.glb',
        config: { scale: 150, y: 0},
        options: {
            paint: true,
            rims: true,
            calipers: true,
            interior: true,
            stripes: false,
            carbon: true,
            tint: true,
            details: true,
            engine: true
        }
    },


    {
        id: 'laferrari',
        name: 'LaFerrari',
        price: 4000000,
        image: './images/laferrari.png',
        modelFile: 'laferrari.glb',
        config: { scale: 1.5, y: 0.5},
        options: {
            paint: true,
            rims: true,
            calipers: true,
            interior: true,
            stripes: false,
            carbon: true,
            tint: true,
            details: true,
            engine: true
        }
    },

    {
        id: 'sf90-spider',
        name: 'SF90 Spider',
        price: 850000,
        image: './images/sf90.png',
        modelFile: 'sf90_spider.glb',
        config: { scale: 140, y: 0},
        options: {
            paint: true,
            rims: true,
            calipers: true,
            interior: true,
            stripes: true,
            carbon: true,
            tint: true,
            details: true,
            engine: true
        }
    },
  {
    id: '488-pista',
    name: "488 Pista",
    price: 900000,
    image: './images/488_pista.png',
    modelFile: '488_pista.glb',
    config: { scale: 140, y: 0},
    options: {
        paint: true,
        rims: true,
        calipers: true,
        interior: true,
        stripes: true,
        carbon: true,
        tint: true,
        details: true,
        engine: true
    }

  },
    {
        id: 'monza-sp1',
        name: 'Monza SP1',
        price: 850000,
        image: './images/monza-sp1.png',
        modelFile: 'monza-sp1.glb',
        config: { scale: 140, y: 0 },
        options: {
            paint: true,
            rims: true,
            calipers: false,
            interior: true,
            stripes: true,
            carbon: true,
            tint: false,
            details: false,
            engine: false
        }
    },
];

// Helper to find car by ID (or name for backward compatibility)
function getCarById(id) {
    return CAR_DATABASE.find(c => c.id === id) || 
           CAR_DATABASE.find(c => c.name === id) || 
           CAR_DATABASE[0]; // Default to first car
}
