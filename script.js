// --- DOM Elements ---
const searchInput = document.querySelector('#searchInput');
const searchBtn = document.querySelector('#searchBtn');
const loadingIndicator = document.querySelector('#loadingIndicator');
const errorContainer = document.querySelector('#errorContainer');
const errorMessage = document.querySelector('#errorMessage');
const pokemonDisplay = document.querySelector('#pokemonDisplay');
const darkModeToggle = document.querySelector('#darkModeToggle');
const themeIcon = document.querySelector('#themeIcon');
const htmlElement = document.querySelector('html');

// --- Dark Mode Toggle Logic ---
darkModeToggle.addEventListener('click', () => {
    htmlElement.classList.toggle('dark');
    const isDark = htmlElement.classList.contains('dark');
    themeIcon.textContent = isDark ? '☀️' : '🌙';
});

// --- Core Search Function ---
async function fetchPokemonData() {
    const query = searchInput.value.trim().toLowerCase();
    
    // Prevent empty searches
    if (!query) return;

    // 1. UI Setup: Disable button, show loading, hide previous results/errors
    searchBtn.disabled = true;
    loadingIndicator.classList.remove('hidden');
    errorContainer.classList.add('hidden');
    pokemonDisplay.classList.add('hidden');
    pokemonDisplay.innerHTML = ''; // Clear previous data

    try {
        // 2. Fetch API Interaction
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${query}`);
        
        // 3. Error Handling
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error("Pokémon not found! Please check the name or ID.");
            } else {
                throw new Error("Network error! Unable to reach the PokéAPI.");
            }
        }

        // 4. JSON Parsing
        const data = await response.json();
        
        // 5. Render Data
        renderPokemonCard(data);

    } catch (error) {
        // Display error message
        errorMessage.textContent = error.message;
        errorContainer.classList.remove('hidden');
    } finally {
        // 6. Cleanup: Re-enable button, hide loading spinner
        searchBtn.disabled = false;
        loadingIndicator.classList.add('hidden');
    }
}

// --- Dynamic DOM Rendering ---
function renderPokemonCard(data) {
    // Data Formatting
    const name = data.name.charAt(0).toUpperCase() + data.name.slice(1);
    const id = `#${data.id.toString().padStart(3, '0')}`;
    const heightMeters = (data.height / 10).toFixed(1); // Convert decimeters to meters
    const weightKg = (data.weight / 10).toFixed(1); // Convert hectograms to kg

    // Extract sprites
    const frontSprite = data.sprites.front_default;
    const backSprite = data.sprites.back_default;
    const shinySprite = data.sprites.front_shiny;

    // Create main container dynamically to satisfy createElement requirement
    const cardContainer = document.createElement('div');
    cardContainer.classList.add('flex', 'flex-col', 'items-center', 'animate-pop-in');

    // Build the inner HTML for the layout
    cardContainer.innerHTML = `
        <div class="relative group mt-2">
            <img src="${frontSprite}" alt="${name}" class="w-48 h-48 drop-shadow-xl group-hover:scale-110 transition-transform duration-300">
            <div class="flex justify-center gap-4 mt-2 bg-slate-100 dark:bg-slate-700 p-2 rounded-2xl shadow-inner">
                ${backSprite ? `<img src="${backSprite}" alt="Back view" class="w-12 h-12 hover:scale-125 transition-transform cursor-pointer" title="Back View">` : ''}
                ${shinySprite ? `<img src="${shinySprite}" alt="Shiny version" class="w-12 h-12 hover:scale-125 transition-transform cursor-pointer" title="Shiny Version">` : ''}
            </div>
        </div>
        
        <div class="text-center mt-6 w-full">
            <span class="text-sm font-bold text-slate-400 dark:text-slate-500 tracking-widest">${id}</span>
            <h2 class="text-3xl font-black text-slate-800 dark:text-white mb-3">${name}</h2>
            
            <div id="typesContainer" class="flex flex-wrap gap-2 justify-center mb-6"></div>
        </div>

        <div class="grid grid-cols-3 gap-4 w-full border-t border-slate-100 dark:border-slate-700 pt-6">
            <div class="text-center flex flex-col items-center p-2 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <span class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Height</span>
                <span class="font-bold text-slate-700 dark:text-slate-200">${heightMeters} m</span>
            </div>
            <div class="text-center flex flex-col items-center p-2 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <span class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Weight</span>
                <span class="font-bold text-slate-700 dark:text-slate-200">${weightKg} kg</span>
            </div>
            <div class="text-center flex flex-col items-center p-2 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <span class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Base Exp</span>
                <span class="font-bold text-slate-700 dark:text-slate-200">${data.base_experience}</span>
            </div>
        </div>
    `;

    // Append the card container to the DOM
    pokemonDisplay.appendChild(cardContainer);

    // Required requirement: dynamically render the list of Pokémon types using .map(), createElement, and appendChild
    const typesContainer = cardContainer.querySelector('#typesContainer');
    
    const typeElements = data.types.map(typeInfo => {
        const typeSpan = document.createElement('span');
        // Add Tailwind utility classes to the generated element
        typeSpan.classList.add('px-4', 'py-1', 'bg-red-100', 'text-red-700', 'dark:bg-red-900/40', 'dark:text-red-300', 'rounded-full', 'text-xs', 'font-bold', 'uppercase', 'tracking-wider', 'shadow-sm');
        typeSpan.textContent = typeInfo.type.name;
        return typeSpan;
    });

    // Append each dynamically created type span to the container
    typeElements.forEach(element => {
        typesContainer.appendChild(element);
    });

    // Finally, reveal the container
    pokemonDisplay.classList.remove('hidden');
}

// --- Event Listeners ---
searchBtn.addEventListener('click', fetchPokemonData);

// Allow searching by pressing the "Enter" key in the input field
searchInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        fetchPokemonData();
    }
});