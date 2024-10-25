import { ensureModulesLoaded, loadUIMethods } from './loadmodules';
import { getAuth, onAuthStateChanged } from "firebase/auth";

// Pages
import morePage1 from '../pages/more.f7.html';
import morePage2 from '../pages/more_2.f7.html';
import movieDetailsPage1 from '../pages/moviepage_1.f7.html';
import movieDetailsPage2 from '../pages/moviepage_2.f7.html';
import tvDetailsPage1 from '../pages/tvshows_1.f7.html';
import tvDetailsPage2 from '../pages/tvshows_2.f7.html';

import searchPage from '../pages/searchpage.f7.html';
import wishListPage from '../pages/wishlist.f7.html';
import trailerPage from '../pages/play_trailer.f7.html';

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
                    setTimeout(() => {
                        // this.app.loginScreen.close('.login-screen', true);
                    }, 1000)
                    resolve();
                } else {
                    reject();
                    window.setTimeout(() => {
                        if (window.cordova) {
                            navigator.splashscreen.hide();
                        }
                    }, 1500);
                    this.app.loginScreen.open('.signup-page', true);
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
        component: morePage1,
    },
    {
        path: '/more_2/',
        component: morePage2,
    },
    {
        path: '/movie_page_1/',
        component: movieDetailsPage1,
    },
    {
        path: '/movie_page_2/',
        component: movieDetailsPage2,
    },
    {
        path: '/tvshows_page_1/',
        component: tvDetailsPage1,
    },
    {
        path: '/tvshows_page_2/',
        component: tvDetailsPage2,
    },
    {
        path: '/search/',
        component: searchPage,
    },
    {
        path: '/wishlist/',
        component: wishListPage,
    },
    {
        path: '/about/',
        asyncComponent: () => import('../pages/about.f7.html'),
    },
    {
        path: '/play_trailer/',
        component: trailerPage,
    },
    {
        path: '/update/',
        asyncComponent: () => import('../pages/update.f7.html'),
    },
]