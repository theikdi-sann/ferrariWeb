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
        config: { scale: 140.0, y: 0 }
    },
    {
        id: 'portofino',
        name: 'Portofino',
        price: 320000,
        image: './images/portofino.png',
        modelFile: 'portofino.glb',
        config: { scale: 0.8, y: 0}
    },
    {
        id: 'laferrari',
        name: 'LaFerrari',
        price: 4000000,
        image: './images/laferrari.png',
        modelFile: 'laferrari.glb',
        config: { scale: 1.5, y: 0.5}
    },

    {
        id: 'sf90-spider',
        name: 'SF90 Spider',
        price: 850000,
        image: 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?q=80&w=2940',
        modelFile: 'sf90_spider.glb',
        config: { scale: 140, y: 0}
    },
  {
    id: '488-pista',
    name: "488 Pista",
    price: 900000,
    image: 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?q=80&w=2940',
    modelFile: '488_pista.glb',
    config: { scale: 140, y: 0}

  },
    {
        id: 'monza-sp1',
        name: 'Monza SP1',
        price: 850000,
        image: './images/monza-sp1.png',
        modelFile: 'monza-sp1.glb',
        config: { scale: 140, y: 0 }
    },
];

// Helper to find car by ID (or name for backward compatibility)
function getCarById(id) {
    return CAR_DATABASE.find(c => c.id === id) || 
           CAR_DATABASE.find(c => c.name === id) || 
           CAR_DATABASE[0]; // Default to first car
}
