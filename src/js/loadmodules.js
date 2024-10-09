let modulesLoaded = false;
let modulesLoadedPromise;

export function ensureModulesLoaded(app) {
    if (modulesLoaded) {
        return Promise.resolve();
    }
    if (!modulesLoadedPromise) {
        modulesLoadedPromise = (async () => {
            const { loadF7PageModules } = await import('./load');
            await loadF7PageModules(app);
            modulesLoaded = true;
        })();
    }
    return modulesLoadedPromise;
}

let uILoaded = false;
let uILoadedPromise;

export function loadUIMethods(app) {
    if (uILoaded) {
        return Promise.resolve();
    }
    if (!uILoadedPromise) {
        // Defer loading UI methods and libraries using async chunks
        uILoadedPromise = (async () => {
            // Load UI components and libraries in small chunks
            const [LazyLoad, Dom7] = await Promise.all([
                import('vanilla-lazyload').then(module => module.default),
                import('dom7').then(module => module.default),
            ]);

            // Lazy load images efficiently with minimal blocking
            const lazyLoadOptions = {
                class_loaded: 'lazyloadedFade',
                callback_error: (img) => {
                    // Error handling with minimal logic
                    const placeholderMap = {
                        'backdrop': '../pages/back_placeholder.jpeg',
                        'movie_poster': '../pages/placeholder.webp',
                        'list_poster_img': '../pages/placeholder.webp',
                        'backdrop-img': '../pages/back_placeholder.jpeg',
                        'poster': '../pages/placeholder.webp',
                        'start_image': '../pages/back_placeholder.jpeg',
                    };
                    const classList = img.classList;
                    for (const className in placeholderMap) {
                        if (classList.contains(className)) {
                            img.setAttribute("src", placeholderMap[className]);
                            break;
                        }
                    }
                }
            };

            // Initialize UI and lazy load
            app.$$ = Dom7;
            app.lazyLoad = new LazyLoad(lazyLoadOptions);
            uILoaded = true;
        })();
    }
    return uILoadedPromise;
}
