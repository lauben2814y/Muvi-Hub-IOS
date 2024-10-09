export async function movieSlider(app) {
    return new Promise((resolve, reject) => {
        try {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        var movieSlider = app.swiper.create('.movie-swipper', {
                            effect: "coverflow",
                            passiveListeners: true,
                            touchEventsTarget: 'wrapper',
                            speed: 200,
                            grabCursor: true,
                            centeredSlides: true,
                            loop: true,
                            slidesPerView: "auto",
                            coverflowEffect: {
                                rotate: 0,
                                stretch: 0,
                                depth: 250,
                                modifier: 1,
                                slideShadows: true,
                            },
                            lazy: {
                                enabled: true,
                            },
                        });
                        observer.disconnect();
                        app.movieSlider = movieSlider;
                        resolve();
                    }
                });
            });
            observer.observe(document.querySelector('.movie-swipper'));
        } catch (error) {
            reject(error);
        }
    })
}
export async function showSlider(app) {
    return new Promise(async (resolve, reject) => {
        try {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        var tvSlider = app.swiper.create('.tv-swipper', {
                            effect: "coverflow",
                            speed: 200,
                            grabCursor: true,
                            centeredSlides: true,
                            loop: true,
                            slidesPerView: "auto",
                            coverflowEffect: {
                                rotate: 0,
                                stretch: 0,
                                depth: 250,
                                modifier: 1,
                                slideShadows: true,
                            },
                        });
                        observer.disconnect();
                        app.tvSlider = tvSlider;
                        resolve();
                    }
                });
            });
            observer.observe(document.querySelector('.tv-swipper'));
        } catch (error) {
            reject(error);
        }
    });
}
