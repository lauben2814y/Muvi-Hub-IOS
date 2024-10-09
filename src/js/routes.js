import { ensureModulesLoaded, loadUIMethods } from './loadmodules';
import { getAuth, onAuthStateChanged } from "firebase/auth";

export var routes = [
    {
        path: '/movies/',
        keepAlive: true,
        beforeEnter: function ({ resolve, reject }) {
            const router = this;
            const auth = getAuth();
            onAuthStateChanged(auth, (user) => {
                if (user) {
                    document.querySelector('.google-email').innerText = user.email;
                    document.querySelector('.google-username').innerText = user.displayName;
                    // userName.innerText = user.displayName;
                    // userEmail.innerText = user.email;
                    resolve();
                } else {
                    reject();
                    router.navigate('/signup/');
                    return;
                }
            });
        },
        async: async function ({ resolve }) {
            await ensureModulesLoaded(this.app);
            await loadUIMethods(this.app);
            resolve({ url: './pages/movies.html' });
        },
        on: {
            pageInit: async function (e, page) {
                var ui = this.app.ui;
                ui.moviesView(this.app);
            },
        }
    },
    {
        path: '/tvshows/',
        keepAlive: true,
        async: async function ({ resolve }) {
            await ensureModulesLoaded(this.app);
            await loadUIMethods(this.app);
            resolve({ url: './pages/tvshows.html' });
        },
        on: {
            pageInit: async function (e, page) {
                var ui = this.app.ui;
                ui.showsView(this.app);
            },
        }
    },
    {
        path: '/more/',
        asyncComponent: () => import('../pages/more.f7.html'),
    },
    {
        path: '/more_2/',
        asyncComponent: () => import('../pages/more_2.f7.html'),
    },
    {
        path: '/movie_page_1/',
        asyncComponent: () => import('../pages/moviepage_1.f7.html'),
    },
    {
        path: '/movie_page_2/',
        asyncComponent: () => import('../pages/moviepage_2.f7.html'),
    },
    {
        path: '/tvshows_page_1/',
        asyncComponent: () => import('../pages/tvshows_1.f7.html'),
    },
    {
        path: '/tvshows_page_2/',
        asyncComponent: () => import('../pages/tvshows_2.f7.html'),
    },
    {
        path: '/search/',
        asyncComponent: () => import('../pages/searchpage.f7.html'),
    },
    {
        path: '/signup/',
        asyncComponent: () => import('../pages/signup.f7.html'),
    },
    {
        path: '/login/',
        asyncComponent: () => import('../pages/login.f7.html'),
    },
    {
        path: '/wishlist/',
        asyncComponent: () => import('../pages/wishlist.f7.html'),
    },
    {
        path: '/about/',
        asyncComponent: () => import('../pages/about.f7.html'),
    },
    {
        path: '/play_trailer/',
        asyncComponent: () => import('../pages/play_trailer.f7.html'),
    },
    {
        path: '/update/',
        asyncComponent: () => import('../pages/update.f7.html'),
    },
]