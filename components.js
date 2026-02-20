function renderNavbar(activePage) {
    const container = document.getElementById('navbar-container');
    if (!container) return;

    // determine base classes based on page (some pages might want transparent start)
    // For now, we'll use the robust fixed glassmorphism style for consistency across subpages
    // index.html might need special handling if we want the transparent-to-black scroll effect.
    
    // We can preserve the scroll logic in script.js by targeting the nav element we create here.
    
    container.innerHTML = `
    <nav id="navbar" class="fixed w-full z-50 transition-all duration-500 py-6 border-b border-white/10 bg-black/80 backdrop-blur-md">
        <div class="container mx-auto px-6 flex justify-between items-center">
            
            <div class="hidden lg:flex space-x-8 text-xs font-bold tracking-widest uppercase items-center">
                
                <div class="relative group">
                    <button class="nav-link hover:text-gray-300 transition focus:outline-none flex items-center ${activePage === 'models' ? 'text-ferrari-red' : ''}">
                        Models <i class="fas fa-chevron-down ml-1 text-[10px] text-ferrari-red"></i>
                    </button>
                    <div class="absolute left-0 mt-2 w-48 bg-ferrari-dark border border-gray-800 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2">
                        <a href="configurator.html?id=sf90-spider" class="block px-6 py-3 hover:bg-ferrari-red hover:text-white transition border-b border-gray-800">SF90 Spider</a>
                        <a href="configurator.html?id=296-gt3" class="block px-6 py-3 hover:bg-ferrari-red hover:text-white transition border-b border-gray-800">296 GT3</a>
                        <a href="configurator.html?id=laferrari" class="block px-6 py-3 hover:bg-ferrari-red hover:text-white transition border-b border-gray-800">LaFerrari</a>
                        <a href="models.html" class="block px-6 py-3 text-gray-400 hover:text-white text-[10px] uppercase tracking-wider">View All Models</a>
                    </div>
                </div>

                <a href="racing.html" class="nav-link hover:text-gray-300 transition ${activePage === 'racing' ? 'text-ferrari-red' : ''}">Racing</a>
                <a href="collections.html" class="nav-link hover:text-gray-300 transition ${activePage === 'collections' ? 'text-ferrari-red' : ''}">Collections</a>
            </div>

            <div class="flex-shrink-0 mx-auto lg:mx-0">
                <a href="index.html" class="flex flex-col items-center group">
                    <div class="w-8 h-10 bg-ferrari-yellow rounded-t-sm flex items-center justify-center relative shadow-lg group-hover:scale-110 transition duration-300">
                         <i class="fa-solid fa-horse text-black text-xl mb-1"></i>
                         <div class="absolute top-0 w-full h-[2px] bg-green-600"></div>
                         <div class="absolute top-[2px] w-full h-[2px] bg-white"></div>
                         <div class="absolute top-[4px] w-full h-[2px] bg-red-600"></div>
                    </div>
                    <span class="mt-1 font-display font-bold tracking-widest text-lg text-white">FERRARI</span>
                </a>
            </div>

            <div class="hidden lg:flex space-x-8 text-xs font-bold tracking-widest uppercase">
                <a href="experiences.html" class="nav-link hover:text-gray-300 transition ${activePage === 'experiences' ? 'text-ferrari-red' : ''}">Experiences</a>
            </div>
        </div>
    </nav>
    `;
}
