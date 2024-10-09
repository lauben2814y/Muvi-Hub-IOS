export async function loadF7PageModules(app) {
    try {
        const modules = await Promise.all([
            import('framework7/components/preloader'),
            import('framework7/components/infinite-scroll'),
            import('framework7/components/swiper'),
            import('framework7/components/photo-browser')
        ]);
        const modulesToLoad = modules.map(module => module.default);
        await app.loadModules(modulesToLoad);
    } catch (error) {
        console.error('Error loading Framework7 modules:', error);
        throw error;
    }
}
