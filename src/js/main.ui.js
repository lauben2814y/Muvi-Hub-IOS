// import necessary modules
import { initializeFirebaseApp } from './firebase.auth';
import { movieSlider } from './slider';
import { showSlider } from './slider';
import { movieGenres, showGenres } from './data';
// select UI
var downloadedDOM = document.querySelector('.downloaded_dom');
var amountDownloaded = document.querySelector('.download_amount');
var downloadDOM = document.querySelector('.download_dom');
// Supabase
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Storage
import Storage from './storage';
// Variables..
var app;
let observer;
const sliderCache = {};
var lazyLoad;
var isInReview;
const options = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzMDZjMzQ1MjY2MzBjNGQ5Y2I3ZjhhNjBiMjgzMzljMSIsInN1YiI6IjY1NWY3ZDg1MmIxMTNkMDEyZDAxYmViMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.8nGJfNpyVKghpYZMcw8U7GT2c64_4t5wDLBU9GreKIY'
    }
}
const options2 = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwMTRjMDcwNTQ4MTEwNTc1MGY2NTYwNWVmNzhiMTEzOCIsInN1YiI6IjY2NGE0NmI2Y2NkMWIyYmUyODkyZmY2MSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.N65dSOgnFiBMsCeNfZdA3WoLHMxZQJ4oMFNeIzn0S9o'
    }
};
const methods = {
    root: null, // Relative to the viewport
    rootMargin: '0px 0px -200px 0px', // Trigger 50px before the last item fully enters the viewport
    threshold: 0.01 // Trigger when 10% of the item is visible
};
// Timers
var adTimer = 1;
var rewardedTimer = 1;
var rewardedInterstitialTimer = 1;
// Ads
var interstitial;
var rewarded;
var rewardedInterstitial;
var rewardedInterstitialLoaded = false;
var rewardedLoaded = false;
// Cache
const dataCache = {};
var dataBaseCache = [];
const pageDataCache = [];
// Download storage vars
var downloads = {};
var totalFileSizes = {};
var downloadTasks = [];
var downloadOperating = null;

// Scroll container page states
let loading = false;
let apiLoading = false;

class UI {
    // Fetch TMDB data
    async getMediaDetails(mediaId, mediaType) {
        const response = await fetch(`https://api.themoviedb.org/3/${mediaType}/${mediaId}?append_to_response=images%2Ccredits%2Cvideos`, options2);
        const data = await response.json();
        return data;
    }
    async getTrendingMedia(type, mediaCat, mediaPage) {
        const response = await fetch(`https://api.themoviedb.org/3/${mediaCat}/${type}/week?language=en-US&page=${mediaPage}`, options);
        var data = await response.json();
        return data.results;
    }
    async getPopularMedia(type, mediaCat, mediaPage) {
        const response = await fetch(`https://api.themoviedb.org/3/${type}/${mediaCat}?language=en-US&page=${mediaPage}`, options);
        const data = await response.json();
        return data.results;
    }
    // Fetch movies and tv shows from supabase
    async getSupabaseMovies(query, from, to) {
        if (query == 'latest') {
            const { data, error, count } = await supabase
                .from('movies')
                .select('title, id, translated, non_translated, vj, created_at, poster_path, release_date', { count: 'exact' })
                .range(from, to)
                .order('release_date', { ascending: false });

            if (error) {
                console.error('Error fetching data:', error)
                return null
            } else {
                dataBaseCache = [...dataBaseCache, ...data];
                return { data, count };
            }
        } else if (query == 'new') {
            const { data, error, count } = await supabase
                .from('movies')
                .select('title, id, translated, non_translated, vj, created_at, poster_path, release_date', { count: 'exact' })
                .range(from, to)
                .order('created_at', { ascending: false });
            if (error) {
                console.error('Error fetching TV shows:', error);
            } else {
                dataBaseCache = [...dataBaseCache, ...data];
                return { data, count };
            }
        }
    }
    async getSupabaseShows(query, from, to) {
        if (query == 'latest') {
            const { data, error, count } = await supabase
                .from('tv_shows')
                .select('name, poster_path, first_air_date, id, seasons, created_at, vj', { count: 'exact' })
                .range(from, to)
                .order('first_air_date', { ascending: false });

            if (error) {
                console.error('Error fetching data:', error)
                return null
            }
            dataBaseCache = [...dataBaseCache, ...data];
            return { data, count };
        } else if (query == 'new') {
            const { data, error, count } = await supabase
                .from('tv_shows')
                .select('name, poster_path, first_air_date, id, seasons, created_at, vj', { count: 'exact' })
                .range(from, to)
                .order('created_at', { ascending: false });
            if (error) {
                console.error('Error fetching TV shows:', error);
                return null;
            }
            dataBaseCache = [...dataBaseCache, ...data];
            return { data, count };

        }
    }
    // Fetch genre based movies and tv shows
    async getGenreMovies(query, from, to, genres) {
        let orderField = 'release_date';
        let ascending = false;
        console.log('Getting Movies');

        // Adjust ordering based on the query type
        if (query === 'new') {
            orderField = 'created_at';
        }

        // Execute the query
        const { data, error, count } = await supabase
            .from('movies')
            .select('id, title, poster_path, release_date', { count: 'exact' })
            .contains('genres', genres)
            .order(orderField, { ascending })
            .range(from, to);

        // Handle error or return data
        if (error) {
            console.error('Error fetching movies:', error);
            return { data: [], count: 0, error };  // Return an empty dataset in case of an error
        }

        return { data, count };
    }
    async getGenreShows(query, from, to, genres) {
        let response = null;

        if (query == 'latest') {
            response = await supabase
                .from('tv_shows')
                .select(`id, name, poster_path, first_air_date, category`, { count: 'exact' })
                .contains('genres', genres)
                .range(from, to)
                .order('first_air_date', { ascending: false });
        } else if (query == 'new') {
            response = await supabase
                .from('tv_shows')
                .select(`id, name, poster_path, first_air_date, category`, { count: 'exact' })
                .contains('genres', genres)
                .range(from, to)
                .order('created_at', { ascending: false });
        }

        if (response.error) {
            console.error('Error fetching TV shows:', response.error);
            return { data: [], count: 0 };
        }

        const { data, count } = response;
        return { data, count };
    }
    // Search single Data
    async getSingleSupabaseData(type, id) {
        var table = type == 'movie' ? 'movies' : 'tv_shows';
        var column = type == 'movie' ? 'title, id, translated, non_translated, vj, created_at, poster_path, release_date' : 'name, poster_path, first_air_date, id, seasons, created_at, vj';
        const { data, error } = await supabase
            .from(`${table}`)
            .select(column)
            .eq('id', id)
            .single()

        if (error) {
            return null;
        }
        return data;
    }
    saveContainerData(id, format, title, data, type) {
        // Utilities
        const upDatePage = (data) => {
            if (format == 'api') {
                return Math.round(data.length / 20);
            } else {
                return data.length - 1;
            }
        }

        if (!dataCache[id]) {
            var page = upDatePage(data);
            dataCache[id] = { data, format, id, title, page, type };
        } else {
            var oldData = dataCache[id].data;
            data.forEach(item => oldData.push(item));  // Correctly push each item

            // Update the cache
            dataCache[id].data = oldData;

            // Recalculate page count based on merged data
            var page = upDatePage(oldData);
            dataCache[id].page = page;
        }
    }
    // Native Functionality
    async accessNativeFunctionality() {
        initializeFirebaseApp();
        if (window.cordova) {
            cordova.plugins.StatusBarHeight.getStatusBarHeight(
                function (value) {
                    document.documentElement.style.setProperty('--f7-safe-area-top', `${value}px`);
                },
                function (error) {
                    console.log(error);
                }
            );
            this.readInitialDownloads();
            // Handle App links and FCM notification click
            this.subscribeNotification();
            // Local Notification
            cordova.plugins.notification.local.setDefaults({
                vibrate: false,
                onlyAlertOnce: true
            });
            cordova.plugins.notification.local.on('canceldownload', (notification, eopts) => {
                const id = notification.id;
                this.cancelDownload(id);
            });
            document.addEventListener('backbutton', () => {
                app.views.current.router.back();
            }, false);
            // Background mode
            cordova.plugins.backgroundMode.enable();
            cordova.plugins.backgroundMode.setDefaults({
                title: 'Muvi hub',
                text: 'Your downloads are ongoing.',
                icon: 'icon', // this will look for icon.png in platforms/android/res/drawable|mipmap
                color: '00FFFF', // hex format like 'F14F4D'
                resume: true,
                hidden: true,
                bigText: true
            });
            cordova.plugins.backgroundMode.on('activate', function () {
                cordova.plugins.backgroundMode.disableWebViewOptimizations();
            });
            // Firebase notification
            FirebasePlugin.hasPermission(function (hasPermission) {
                console.log("Permission is " + (hasPermission ? "granted" : "denied"));
                FirebasePlugin.getToken(function (fcmToken) {
                    Storage.saveToken(fcmToken);
                }, function (error) {
                    console.error(error);
                });
            });
            FirebasePlugin.subscribe("allUsers", function () {
                console.log("Subscribed to topic");
            }, function (error) {
                console.error("Error subscribing to topic: " + error);
            }
            );
            // handle ads
            this.loadInterstitial();
        }
    }
    // ads
    loadInterstitial() {
        interstitial = new admob.InterstitialAd({
            adUnitId: process.env.INTERSTITIAL_AD_ID,
        })
        interstitial.on('load', (evt) => {
        })
        interstitial.load();
    }
    loadRewarded() {
        rewarded = new admob.RewardedAd({
            adUnitId: process.env.REWARDED_AD_ID,
        });
        rewarded.on('load', (evt) => {
            console.log('Rewarded loaded');
        })
        rewarded.load();
    }
    loadRewardedInterstitial() {
        rewardedInterstitial = new admob.RewardedInterstitialAd({
            adUnitId: process.env.REWARDED_INTERSTITIAL_AD_ID,
        });
        rewardedInterstitial.load();
    }
    compareVersions(clientVersion, serverVersion) {
        const clientParts = clientVersion.split('.').map(Number);
        const serverParts = serverVersion.split('.').map(Number);

        for (let i = 0; i < Math.max(clientParts.length, serverParts.length); i++) {
            const clientPart = clientParts[i] || 0;
            const serverPart = serverParts[i] || 0;

            if (clientPart < serverPart) {
                return -1; // Server version is greater
            }
            if (clientPart > serverPart) {
                return 1; // Client version is greater
            }
        }
        return 0; // Versions are equal
    }
    async checkForUpdates() {
        var clientVersion;
        cordova.getAppVersion.getVersionNumber(function (version) {
            clientVersion = version;
        });
        if (clientVersion) {
            const response = await fetch('https://admin-server-theta.vercel.app/version');
            const data = await response.json();
            const serverVersion = data.version;
            // Compare the client and server versions
            const comparison = this.compareVersions(clientVersion, serverVersion);
            // Perform actions
            if (comparison === -1) {
                // Do something when the server version is newer update app 
                setTimeout(() => {
                    app.views.current.router.navigate('/update/');
                }, 3000);
            } else if (comparison === 1) {
                // Do something when the client version is newer 
            } else {
                // Do something when versions are equal okay
            }
        }
    }
    checkReview() {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await fetch('https://admin-server-theta.vercel.app/isReview');
                const result = await response.json();
                isInReview = result;
                if (result == true) {
                    resolve();
                } else {
                    const { dummyMovies, renderDummyFilms } = await import('./dummy');
                    var moviesDOM = document.querySelector('.movies_dom');
                    var listContainer = document.createElement('div');
                    listContainer.className = 'list media-list list-outline-ios list-strong-ios list-dividers-ios';
                    var listUl = document.createElement('ul');
                    listContainer.appendChild(listUl);
                    var mediaArr = dummyMovies.slice(0, 10);
                    renderDummyFilms(mediaArr, listUl, 'main');
                    moviesDOM.appendChild(listContainer);
                    if (document.querySelector('#movie_scroll_preloader')) {
                        document.querySelector('#movie_scroll_preloader').remove();
                    }
                    var showsDOM = document.querySelector('.shows_dom');
                    var listContainer1 = document.createElement('div');
                    listContainer1.className = 'list media-list list-outline-ios list-strong-ios list-dividers-ios';
                    var listUl = document.createElement('ul');
                    listContainer1.appendChild(listUl);
                    var mediaArr1 = dummyMovies.slice(10, 20);
                    renderDummyFilms(mediaArr1, listUl, 'main');
                    showsDOM.appendChild(listContainer1);
                    if (document.querySelector('#show_scroll_preloader')) {
                        document.querySelector('#show_scroll_preloader').remove();
                    }
                }
            } catch (error) {
                reject(error);
            }
        });
    }
    async handleAppLinks(url) {
        if (url != undefined) {
            app.preloader.show();
            var parts = url.split("/");
            var id = parts[parts.length - 1];
            var type = parts[parts.length - 2];
            var yearProp = type == 'movie' ? 'release_date' : 'first_air_date';
            var currTab = type === 'movie' ? 'movies' : 'tvshows';
            let media;
            let data = await this.getMediaDetails(id, type);
            let dbData = await this.getSingleSupabaseData(type, id);
            if (dbData) {
                Object.assign(dbData, {
                    cast: data.credits.cast.filter(cast => cast.profile_path != null),
                    images: data.images,
                    overview: data.overview,
                    backdrop_path: data.backdrop_path,
                    belongs_to_collection: data.belongs_to_collection,
                    media_available: true,
                    logo_path: this.getLogo(data.images.logos, data.original_language),
                    trailers: this.getTrailers(data.videos.results),
                    genres: data.genres.map(genre => genre.name),
                    genres_text: data.genres.map(genre => genre.name).join(', '),
                    media_type: type,
                    vote_average: data.vote_average,
                    runtime: data.runtime
                });
                media = dbData;
                this.cacheAllData(dataBaseCache, dbData);
            } else {
                data.cast = data.credits.cast.filter(cast => cast.profile_path != null);
                delete data.credits;
                data.logo_path = this.getLogo(data.images.logos, data.original_language);
                data.trailers = this.getTrailers(data.videos.results);
                delete data.videos;
                data.media_type = type;
                data.genres = data.genres.map(genre => genre.name);
                data.genres_text = data.genres.join(', ');
                delete data.genres;
                media = data;
                this.cacheAllData(dataBaseCache, data);
            }
            setTimeout(() => {
                app.tab.show(`#${currTab}`);
                var path = app.views.current.router.currentRoute.path;
                var routePath = this.getRoutePath(path);
                media.year = media[yearProp].split('-')[0];
                app.preloader.hide();
                app.views.current.router.navigate(routePath, { props: { media } });
            }, 1500);
        }
    }
    subscribeAppLink() {
        universalLinks.subscribe(null, (eventData) => {
            this.handleAppLinks(eventData.url);
        });
    }
    async accessAppAndNativeFunctionality() {
        // Check for updates
        if (window.cordova) {
            // Hide splashscreen
            window.setTimeout(() => {
                navigator.splashscreen.hide();
            }, 1000);
            // Check for review
            await this.checkReview();
            // Check for updates
            await this.checkForUpdates();
            // Subscribe App links
            this.subscribeAppLink();
            // Subscribe Rewarded Interstitial Add
            app.$$(document).on('page:beforein', async (e) => {
                if (e.target.id == 'main') {
                    if (rewardedInterstitialTimer == 3) {
                        await rewardedInterstitial.show();
                        console.log('Showing rewarded interstitial ...');
                        rewardedInterstitialTimer = 1;
                    } else if (rewardedInterstitialTimer == 1) {
                        if (rewardedInterstitialLoaded == false) {
                            console.log('Loading rewarded interstitial for the first time ...');
                            rewardedInterstitialLoaded = true;
                            this.loadRewardedInterstitial();
                        }
                        rewardedInterstitialTimer += 1;
                    } else {
                        rewardedInterstitialTimer += 1;
                    }
                }

            });
        }
    }
    // Download Methods
    updateDownloading() {
        if (downloadTasks.length > 0) {
            var downloading = downloadTasks.length;
            amountDownloaded.innerText = downloading;
        } else {
            amountDownloaded.innerText = 0;
        }
    }
    startDownload(downloadId) {
        const fileData = downloadTasks.find(downloadTask => downloadTask.id == downloadId);
        var uriString = fileData.uriString;
        var fileName = fileData.fileName;
        window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, (fileSystem) => {
            fileSystem.getFile(fileName, { create: true }, (targetFile) => {
                var downloader = new BackgroundTransfer.BackgroundDownloader();
                var download = downloader.createDownload(uriString, targetFile);
                downloads[downloadId] = download.startAsync().then(
                    this.onSuccess.bind(this, downloadId),
                    this.onError.bind(this, downloadId),
                    this.onProgress.bind(this, downloadId)
                );
                document.querySelector(`.download_now${downloadId}`).remove();
                downloadOperating = downloads[downloadId];
            }, function (err) {
                console.error("Error accessing target file: ", err);
                alert("Error accessing target file: " + JSON.stringify(err));
            });
        }, function (err) {
            console.error("Error accessing file system: ", err);
            alert("Error accessing file system: " + JSON.stringify(err));
        });
    }
    formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
    onProgress(downloadId, progress) {
        var bytesReceived = progress.bytesReceived;
        var totalBytes = progress.totalBytesToReceive;
        var percent = Math.floor((bytesReceived / totalBytes) * 100);
        // !bytes || bytes === 0
        if (totalBytes && totalBytes != 0 && bytesReceived && bytesReceived != 0) {
            totalFileSizes[downloadId] = this.formatBytes(totalBytes);
            this.updateProgressNotification(this.formatBytes(bytesReceived), downloadId, percent, this.formatBytes(totalBytes));
            app.progressbar.set(`.progress${downloadId}`, percent);
            document.querySelector(`.amount_downloaded${downloadId}`).innerText = this.formatBytes(bytesReceived);
            document.querySelector(`.total_downloaded${downloadId}`).innerText = this.formatBytes(totalBytes);
        } else {
            this.waitingNotification(downloadId);
        }
    }
    onError(downloadId, error) {

    }
    onSuccess(downloadId, result) {
        this.updateProgressNotification(totalFileSizes[downloadId], downloadId, 100, totalFileSizes[downloadId]);
        app.progressbar.set(`.progress${downloadId}`, 100);
        document.querySelector(`.amount_downloaded${downloadId}`).innerText = totalFileSizes[downloadId];
        document.querySelector(`.total_downloaded${downloadId}`).innerText = totalFileSizes[downloadId];
        var list = document.getElementById(`${downloadId}_download_id`);
        downloadDOM.removeChild(list);
        setTimeout(() => {
            this.downloadCompletedNotification(downloadId);
            this.readAndDisplayFiles(downloadId);
            delete downloads[downloadId]; // Remove completed download from the list
            downloadOperating = null; // Reset the downloadOperating state
            downloadTasks = downloadTasks.filter(downloadTask => downloadTask.id != downloadId);
            const nextFileData = downloadTasks[0];
            if (nextFileData) {
                const nextDownloadId = nextFileData.id;
                this.startDownload(nextDownloadId);
            } else {
                amountDownloaded.innerText = 0;
            }
        }, 1000);
    }
    cancelDownload(downloadId) {
        if (downloads[downloadId]) {
            downloads[downloadId].cancel();
            var list = document.getElementById(`${downloadId}_download_id`);
            downloadDOM.removeChild(list);
            this.downloadCancelledNotification(downloadId);
            delete downloads[downloadId]; // Remove the canceled download from the list
            downloadOperating = null; // Reset the downloadOperating state
            downloadTasks = downloadTasks.filter(downloadTask => downloadTask.id != downloadId);
        } else {
            var list = document.getElementById(`${downloadId}_download_id`);
            downloadDOM.removeChild(list);
            downloadTasks = downloadTasks.filter(downloadTask => downloadTask.id != downloadId);
        }
    }
    createProgressUI(downloadId) {
        var list = document.createElement('li');
        list.className = "animate__animated animate__fadeIn";
        list.setAttribute('id', `${downloadId}_download_id`);
        var backdropObj = downloadTasks.find(downloadTask => downloadTask.id == downloadId);
        list.innerHTML = `
        <a class="item-link no-ripple">
            <div class="item-content">
                <div class="item-media">
                    <div class="overlay">
                        <div class="actions hide">
                            <a href="#">
                                <span class="material-icons-outlined cancel_download_btn" data-id="${downloadId}">
                                    cancel
                                </span>
                            </a>
                        </div>
                        <img
                            src="${backdropObj.backdrop}" />
                    </div>
                </div>
                <div class="item-inner">
                    <i class="icon material-icons ripple now_btn download_now${downloadId}"
                        data-id="${downloadId}">download</i>
                    <div class="item-title-row">
                        <div class="item-title">${backdropObj.fileName}</div>
                    </div>
                    <div class="item-subtitle">
                        <span style="display: block;">Movie</span>
                        <span>
                            <span class="amount_downloaded${downloadId}">0.0MB</span> of
                            <span class="total_downloaded${downloadId}">0.0MB</span>
                        </span>
                    </div>
                    <div class="item-text">
                        <p style="margin-top: 2px;">
                            <span class="progressbar progress${downloadId}" id="download-progressbar"></span>
                        </p>
                    </div>
                </div>
            </div>
        </a>
        `;
        downloadDOM.appendChild(list);
        app.progressbar.show(`.progress${downloadId}`, 0);
    }
    createCompleteUI(nativeURL, fileName, thumbnail, file) {
        var list = document.createElement('li');
        list.className = "";
        list.innerHTML = `
            <a class="item-link no-ripple">
                <div class="item-content">
                    <div class="item-media">
                        <div class="overlay">
                        <div class="actions hide">
                            <a href="#">
                                <span class="material-icons-outlined play_downloaded_video" data-url="${nativeURL}">
                                    play_circle
                                </span>
                            </a>
                        </div>
                        <img src="${thumbnail}" />
                        </div>
                    </div>
                    <div class="item-inner">
                        <div class="item-title-row">
                        <div class="item-title">${fileName}</div>
                        </div>
                        <div class="item-subtitle">
                        <span style="display: block;">Movie</span>
                        </div>
                        <div class="item-text">
                        <p style="margin-top: 2px; margin-bottom: 2px; color: var(--f7-theme-color);">${this.formatBytes(file.size)}</p>
                        <p style="margin-top: 2px; margin-bottom: 2px; color: var(--f7-theme-color);">Downloaded</p>
                        </div>
                    </div>
                </div>
            </a>
        `
        downloadedDOM.appendChild(list);
    }
    readAndDisplayFiles(downloadId) {
        var backdropObj = downloadTasks.find(downloadTask => downloadTask.id == downloadId);
        downloadedDOM.innerHTML = '';
        window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, (fileSystem) => {
            var reader = fileSystem.createReader();
            downloadedDOM.innerHTML = '';
            reader.readEntries((entries) => {
                entries.forEach(entry => {
                    if (entry.isFile) {
                        entry.file((file) => {
                            Storage.saveVideoThumbNail(entry.nativeURL, backdropObj.backdrop);
                            this.createCompleteUI(entry.nativeURL, entry.name, Storage.getVideoThumbnail(entry.nativeURL), file);
                        }, (err) => {
                            console.error("Error getting file: ", err);
                            alert("Error getting file: " + JSON.stringify(err));
                        });
                    }
                });
            }, function (err) {
                console.error("Error reading directory: ", err);
                alert("Error reading directory: " + JSON.stringify(err));
            });
        }, function (err) {
            console.error("Error accessing file system: ", err);
            alert("Error accessing file system: " + JSON.stringify(err));
        });
    }
    readInitialDownloads() {
        downloadedDOM.innerHTML = '';
        window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, (fileSystem) => {
            var reader = fileSystem.createReader();
            downloadedDOM.innerHTML = '';
            reader.readEntries((entries) => {
                entries.forEach(entry => {
                    if (entry.isFile) {
                        entry.file((file) => {
                            this.createCompleteUI(entry.nativeURL, entry.name, Storage.getVideoThumbnail(entry.nativeURL), file);
                        }, (err) => {
                            console.error("Error getting file: ", err);
                            alert("Error getting file: " + JSON.stringify(err));
                        });
                    }
                });
            }, function (err) {
                console.error("Error reading directory: ", err);
                alert("Error reading directory: " + JSON.stringify(err));
            });
        }, function (err) {
            console.error("Error accessing file system: ", err);
            alert("Error accessing file system: " + JSON.stringify(err));
        });
    }
    // Notifications and App links and Check Review
    updateProgressNotification(downloadedBytes, downloadId, percentage, totalBytes) {
        var obj = downloadTasks.find(downloadTask => downloadTask.id == downloadId);
        const notification = {
            id: downloadId,
            title: obj.title,
            text: `${downloadedBytes} of ${totalBytes}`,
            progressBar: { value: percentage },
            smallIcon: 'res://ic_launcher',
            actions: 'cancel-action'
        };
        cordova.plugins.notification.local.schedule(notification);
    }
    waitingNotification(downloadId) {
        var obj = downloadTasks.find(downloadTask => downloadTask.id == downloadId);
        const notification = {
            id: downloadId,
            title: obj.title,
            text: 'Waiting for network !',
            smallIcon: 'res://ic_launcher'  // Optional: Path to small icon for Android
        };
        cordova.plugins.notification.local.schedule(notification);
    }
    downloadCompletedNotification(downloadId) {
        var obj = downloadTasks.find(downloadTask => downloadTask.id == downloadId);
        cordova.plugins.notification.local.cancel(downloadId);
        const completeNotification = {
            id: downloadId,
            title: 'Download Complete!',
            text: `${obj.title} finished successfully.`,
            smallIcon: 'res://ic_launcher'  // Optional: Path to small icon for Android
        };
        cordova.plugins.notification.local.schedule(completeNotification);
    }
    downloadCancelledNotification(downloadId) {
        var obj = downloadTasks.find(downloadTask => downloadTask.id == downloadId);
        cordova.plugins.notification.local.cancel(downloadId);
        const cancelledNotification = {
            id: downloadId,
            title: 'Download Cancelled!',
            text: `${obj.title} cancelled.`,
            smallIcon: 'res://ic_launcher'  // Optional: Path to small icon for Android
        };
        cordova.plugins.notification.local.schedule(cancelledNotification);
    }
    getRoutePath(path) {
        if (path == '/movies/') {
            return '/movie_page_1/';
        } else if (path == '/movie_page_1/') {
            return '/movie_page_2/';
        } else if (path == '/movie_page_2/') {
            return '/movie_page_1/';
        } else if (path == '/tvshows/') {
            return '/tvshows_page_1/';
        } else if (path == '/tvshows_page_1/') {
            return '/tvshows_page_2/';
        } else if (path == '/tvshows_page_2/') {
            return '/tvshows_page_1/';
        }
    }
    async handleNotificationsClick(id, type, category) {
        if (category == 'new') {
            var currTab = type === 'movie' ? 'movies' : 'tvshows';
            app.preloader.show();
            let tmdbData = await this.getMediaDetails(id, type);
            app.tab.show(`#${currTab}`);
            var path = app.views.current.router.currentRoute.path;
            var routePath = this.getRoutePath(path);
            var cache = dataBaseCache.find(dataBaseCache => dataBaseCache.id == id);
            cache.images = tmdbData.images;
            setTimeout(() => {
                app.preloader.hide();
                var media = cache;
                app.views.current.router.navigate(routePath, { props: { media } });
            }, 1500)
        } else if (category == 'community') {
            var url = "https://chat.whatsapp.com/GhIpKt00bNbFHkcixBGK3A";
            cordova.InAppBrowser.open(url, '_system');
        } else if (category == 'update') {
            var url = "https://play.google.com/store/apps/details?id=muvi.anime.hub";
            cordova.InAppBrowser.open(url, '_system');
        }
    }
    subscribeNotification() {
        FirebasePlugin.onMessageReceived(async (message) => {
            if (message.tap === 'background') {
                console.log('App brought to foreground by notification tap');
                this.handleNotificationsClick(message.notification_id, message.notification_type, message.notification_category);
            } else if (message.tap === 'foreground') {
                this.handleNotificationsClick(message.notification_id, message.notification_type, message.notification_category);
            } else {
                console.log('Notification received in foreground');
            }
        }, function (error) {
            console.error(error);
        });
    }
    renderViewMedia(mediaDom, mediaArr, type, title) {
        // Properties
        const containerID = `${title} ${type}`;
        const titleProperty = type == 'movie' ? 'title' : 'name';
        const releaseDateProperty = type == 'movie' ? 'release_date' : 'first_air_date';
        const dataFormat = ['Popular', 'Trending'].includes(title) ? 'api' : 'not-api';

        // Save container data
        this.saveContainerData(containerID, dataFormat, title, mediaArr, type);

        // Create container
        const container = document.createElement('div');
        container.className = 'container';

        // Create header
        const header = document.createElement('div');
        header.className = 'header';
        header.innerHTML = `
            <h3>${title}</h3>
            <a href="#" data-title="${title}" data-name="${type}" data-api="${dataFormat}" class="more_links" id="${containerID}">
                view more
            </a>
        `;
        container.appendChild(header);

        // Create content section
        const content = document.createElement('div');
        content.className = `content ${dataFormat} ${title}`;
        content.id = containerID;
        content.dataset.type = type === "movie" ? "movie" : "tv";
        content.dataset.title = title;

        // Use DocumentFragment for better performance
        const fragment = document.createDocumentFragment();

        // Generate HTML string for media items
        const mediaItemsHTML = mediaArr.map(mediaItem => {
            const title = mediaItem[titleProperty];
            const date = mediaItem[releaseDateProperty];
            const poster = mediaItem.poster_path;
            const id = mediaItem.id;

            return `
                <div class="media_card">
                    <div class="media">
                        <img class="movie_poster lazy" 
                             data-id="${id}" 
                             data-name="${type}" 
                             data-page="main" 
                             data-format=${dataFormat}
                             src="./pages/placeholder.webp"
                             data-src="https://image.tmdb.org/t/p/w500${poster}">
                    </div>
                    <div class="details">
                        <h4>${title}</h4>
                        <p>${date}</p>
                    </div>
                </div>
            `;
        }).join('');

        // Add the media items HTML string to the content container
        content.innerHTML = mediaItemsHTML;

        // Append content to container
        container.appendChild(content);

        // Append container to mediaDom
        mediaDom.appendChild(container);

        // update ui
    }
    renderScrollMedia(mediaArr, mediaDOM) {
        // unobserve last item
        this.unobserveLastItemInContainer(mediaDOM);
        const fragment = document.createDocumentFragment(); // Use a fragment for batch DOM updates
        const baseImageUrl = 'https://image.tmdb.org/t/p/w500';
        const placeholderImage = '../pages/placeholder.webp';
        const dataFormat = mediaDOM.classList.contains('api') ? 'api' : 'not-api';

        mediaArr.forEach(mediaItem => {
            const isMovie = !!mediaItem.title; // Check if it's a movie based on the existence of title
            const titleProperty = isMovie ? 'title' : 'name';
            const dateProperty = isMovie ? 'release_date' : 'first_air_date';
            const mediaType = isMovie ? 'movie' : 'tv';
            const shortenName = mediaItem[titleProperty];
            const date = mediaItem[dateProperty];
            const poster = mediaItem.poster_path;
            const id = mediaItem.id;

            // Create media card
            const mediaCard = document.createElement('div');
            mediaCard.className = 'media_card';

            // Create media container and details in a single step
            mediaCard.innerHTML = `
                <div class="media">
                    <img class="movie_poster lazy"
                         data-id="${id}"
                         data-name="${mediaType}"
                         data-page="main"
                         data-format=${dataFormat}
                         data-src="${baseImageUrl}${poster}"
                         src="${placeholderImage}" />
                </div>
                <div class="details">
                    <h4>${shortenName}</h4>
                    <p>${date || 'N/A'}</p>
                </div>
            `;

            fragment.appendChild(mediaCard); // Append to fragment instead of directly to the DOM
        });
        mediaDOM.appendChild(fragment); // Append the fragment to the DOM in one go
        this.observeLastItemInContainer(mediaDOM); // Start observing the new last item
    }
    renderSlider(elements, data, swiper) {
        // utilities
        var titleProp = data[0].release_date ? 'title' : 'name';
        var typeProp = data[0].release_date ? 'movie' : 'tv';
        var genreType = data[0].release_date ? movieGenres : showGenres;
        const debounce = (func, delay) => {
            let timer;
            return function (...args) {
                clearTimeout(timer);
                timer = setTimeout(() => func.apply(this, args), delay);
            };
        };
        const getGenres = (genreIds) => {
            var genreNames = genreIds.map(id => {
                var genre = genreType.find(genre => genre.id === id);
                return genre ? genre.name : null;
            }).filter(name => name !== null);
            return genreNames.join(", ");
        }
        function sliderWishlist(doesExist, sliderBtnDOM) {
            if (doesExist) {
                sliderBtnDOM.firstElementChild.innerText = 'bookmark_fill';
                sliderBtnDOM.lastElementChild.innerText = 'Added';
                sliderBtnDOM.style.pointerEvents = 'none';
            } else {
                sliderBtnDOM.firstElementChild.innerText = 'bookmark';
                sliderBtnDOM.lastElementChild.innerText = 'Wishlist';
                sliderBtnDOM.style.pointerEvents = 'all';
            }
        }
        function checkkWishList(id) {
            var wishlist = Storage.getWishlist();
            var exists = wishlist.find(item => item.id == id);
            return exists;
        }
        const updateSliderUI = () => {
            const activeSlide = swiper.slides[swiper.activeIndex].firstElementChild;
            const { title, id, genres } = activeSlide.dataset;

            elements.sliderTitle.textContent = title;
            elements.movieSliderGenres.textContent = genres;
            elements.previewBtn.dataset.id = id;
            elements.movieSliderWishBtn.dataset.id = id;

            elements.previewBtn.classList.add('movie_poster');
            elements.previewBtn.dataset.id = id;

            const exists = checkkWishList(id);
            sliderWishlist(exists, elements.movieSliderWishBtn);
        };

        elements.sliderImages.forEach((swiperImage, index) => {
            const media = data[index];
            const { id, genre_ids, poster_path } = media;
            sliderCache[id] = media;

            swiperImage.src = `https://image.tmdb.org/t/p/w500${poster_path}`;
            swiperImage.dataset.id = id;
            swiperImage.dataset.title = media[titleProp];
            swiperImage.dataset.page = 'main';
            swiperImage.dataset.name = typeProp;
            swiperImage.dataset.genres = getGenres(genre_ids);
        });
        updateSliderUI();
        const activeSlide = swiper.slides[swiper.activeIndex].firstElementChild;
        const { title, id, genres } = activeSlide.dataset;
        elements.movieSliderWishBtn.classList.add('action_icon');
        elements.movieSliderWishBtn.setAttribute('data-id', id);
        swiper.on('transitionStart', debounce(updateSliderUI, 200), { passive: true });
    }
    sayHello() {
        console.log("Hello God, Pliz always be at my side");
    }
    getLogo(logos, original_language) {
        var englishLogos = logos.filter(logo => logo.iso_639_1 == "en");
        if (englishLogos.length > 0) {
            return englishLogos[0].file_path;
        } else {
            var originalLogos = logos.filter(logo => logo.iso_639_1 == `${original_language}`);
            if (originalLogos.length > 0) {
                return originalLogos[0].file_path;
            } else {
                if (logos.length > 0) {
                    const randomLogo = logos[0].file_path;
                    return randomLogo;
                } else {
                    return null;
                }
            }
        }
    }
    getTrailers(videos) {
        var trailers = videos.filter(video => {
            return video.type == "Trailer";
        });
        if (trailers.length > 0) {
            return trailers;
        } else {
            return null;
        }
    }
    cacheAllData(array, newObject, key = 'id') {
        // Find the index of the object in the array that matches the key value
        const index = array.findIndex(obj => obj[key] === newObject[key]);

        // If the object is found, replace it, otherwise push the new object
        if (index !== -1) {
            array[index] = newObject;
        } else {
            array.push(newObject);
        }

        return array;
    }
    async clickHandler(event) {
        // Utilities
        function assignRoutePath(page, type) {
            if (page === "main") {
                var routePath = type == 'movie' ? '/movie_page_1/' : '/tvshows_page_1/';
                return routePath;
            } else {
                var routePath = type == 'movie' ? '/movie_page_2/' : '/tvshows_page_2/';
                return routePath;
            }
        }
        const target = event.target;
        if (target.classList.contains('more_links')) {
            var id = target.id;
            var isApi = target.dataset.api;
            var routePath = isApi === "api" ? "/more/" : "/more_2/";
            var cache = dataCache[id];
            app.views.current.router.navigate(routePath, { props: cache });
        } else if (target.classList.contains('movie_poster')) {
            if (isInReview == false) {
                return;
            }
            // detail pages logic
            var id = event.target.dataset.id;
            var type = event.target.dataset.name;
            var page = event.target.dataset.page;
            var routePath = assignRoutePath(page, type);
            var yearProp = type == 'movie' ? 'release_date' : 'first_air_date';
            var media;
            var cache = dataBaseCache.find(dataBaseCache => dataBaseCache.id == id);

            if (cache) {
                if (cache.created_at) {
                    if (cache.cast) {
                        media = cache;
                    } else {
                        let data = await this.getMediaDetails(id, type);
                        Object.assign(cache, {
                            cast: data.credits.cast.filter(cast => cast.profile_path != null),
                            images: data.images,
                            overview: data.overview,
                            backdrop_path: data.backdrop_path,
                            belongs_to_collection: data.belongs_to_collection,
                            media_available: true,
                            logo_path: this.getLogo(data.images.logos, data.original_language),
                            trailers: this.getTrailers(data.videos.results),
                            genres: data.genres.map(genre => genre.name),
                            genres_text: data.genres.map(genre => genre.name).join(', '),
                            media_type: type,
                            vote_average: data.vote_average,
                            runtime: data.runtime
                        });
                        media = cache;
                        this.cacheAllData(dataBaseCache, cache);
                    }
                } else {
                    media = cache;
                }
            } else {
                app.preloader.show();
                let data = await this.getMediaDetails(id, type);
                let dbData = await this.getSingleSupabaseData(type, id);
                if (dbData) {
                    Object.assign(dbData, {
                        cast: data.credits.cast.filter(cast => cast.profile_path != null),
                        overview: data.overview,
                        images: data.images,
                        backdrop_path: data.backdrop_path,
                        media_available: true,
                        logo_path: this.getLogo(data.images.logos, data.original_language),
                        belongs_to_collection: data.belongs_to_collection,
                        trailers: this.getTrailers(data.videos.results),
                        genres: data.genres.map(genre => genre.name),
                        genres_text: data.genres.map(genre => genre.name).join(', '),
                        media_type: type,
                        vote_average: data.vote_average,
                        runtime: data.runtime
                    });
                    media = dbData;
                    this.cacheAllData(dataBaseCache, dbData);
                } else {
                    data.cast = data.credits.cast.filter(cast => cast.profile_path != null);
                    delete data.credits;
                    data.logo_path = this.getLogo(data.images.logos, data.original_language);
                    data.trailers = this.getTrailers(data.videos.results);
                    delete data.videos;
                    data.media_type = type;
                    data.genres = data.genres.map(genre => genre.name);
                    data.genres_text = data.genres.join(', ');
                    delete data.genres;
                    media = data;
                    this.cacheAllData(dataBaseCache, data);
                }
            }
            media.year = media[yearProp].split('-')[0];
            app.preloader.hide();

            if (adTimer == 2) {
                // await interstitial.show();
                app.views.current.router.navigate(routePath, { props: { media } });
                adTimer = 1;
            } else {
                adTimer += 1;
                app.views.current.router.navigate(routePath, { props: { media } });
            }
        } else if (event.target.classList.contains('watch_media_btn')) {
            let watchpreferencesDOM = document.querySelector('.watch_preferences_dom');
            let id = event.target.dataset.id;
            let obj = dataBaseCache.find(data => data.id == id);
            if (obj.non_translated && obj.translated) {
                watchpreferencesDOM.innerHTML = `
                <button class="button button-fill margin-bottom actions-close watch_btn_link" data-url="${obj.non_translated}">
                    Watch Non translated
                </button>
                <button class="button button-fill delete_btn actions-close watch_btn_link" data-url="${obj.translated}">
                    Watch Translated ${obj.vj}
                </button>
                `;
            } else {
                if (obj.non_translated) {
                    watchpreferencesDOM.innerHTML = `
                    <button class="button button-fill margin-bottom actions-close watch_btn_link" data-url="${obj.non_translated}">
                        Watch Non translated
                    </button>
                    `;
                } else if (obj.translated) {
                    watchpreferencesDOM.innerHTML = `
                    <button class="button button-fill delete_btn actions-close watch_btn_link" data-url="${obj.translated}">
                        Watch Translated ${obj.vj}
                    </button>
                    `;
                }
            }
            app.actions.open('.watch-preference-actions', true);
        } else if (event.target.classList.contains('watch_btn_link')) {
            let url = event.target.dataset.url;
            console.log(url);
            // 1. streaming media player plugin
            var options = {
                successCallback: function () {
                    console.log("Video was closed without error.");
                },
                errorCallback: function (errMsg) {
                    console.log("Error! " + errMsg);
                },
                orientation: 'landscape',
                shouldAutoClose: true,
                controls: true
            };
            window.plugins.streamingMedia.playVideo(url, options);
        } else if (event.target.classList.contains('play_trailer')) {
            var trailerKey = event.target.dataset.key;
            app.views.current.router.navigate('/play_trailer/', { props: { trailerKey } });
        } else if (event.target.classList.contains('download_btn')) {
            let preferencesDOM = document.querySelector('.download_preferences_dom');
            let id = event.target.dataset.id;
            let obj = dataBaseCache.find(data => data.id == id);
            let backdrop = `https://image.tmdb.org/t/p/w1280${obj.backdrop_path}`;
            if (obj.non_translated && obj.translated) {
                preferencesDOM.innerHTML = `
                <button class="button button-fill margin-bottom actions-close download_btn_link" data-url="${obj.non_translated}" data-title="${obj.title}"  data-backdrop="${backdrop}">
                    Non translated
                </button>
                <button class="button button-fill delete_btn actions-close download_btn_link" data-url="${obj.translated}" data-title="${obj.title}" data-backdrop="${backdrop}">
                    Translated Vj juniour
                </button>
                `;
            } else {
                if (obj.non_translated) {
                    preferencesDOM.innerHTML = `
                    <button class="button button-fill margin-bottom actions-close download_btn_link" data-url="${obj.non_translated}" data-title="${obj.title}" data-backdrop="${backdrop}">
                        Non translated
                    </button>
                    `;
                } else if (obj.translated) {
                    preferencesDOM.innerHTML = `
                    <button class="button button-fill delete_btn actions-close download_btn_link" data-url="${obj.translated}" data-title="${obj.title}" data-backdrop="${backdrop}"">
                        Translated ${obj.vj}
                    </button>
                    `;
                }
            }
            app.actions.open('.download-preference-actions', true);
        } else if (event.target.classList.contains('download_btn_link')) {
            let url = event.target.dataset.url;
            let backdropURL = event.target.dataset.backdrop;
            let title = event.target.dataset.title;
            let parts = url.split('.');
            var ext = parts[parts.length - 1];
            var fileName = `${title.replace(/[:,\-_\s?!'\"@()]/g, '')}.${ext}`;
            console.log(url, backdropURL, title, fileName);

            var id = Date.now();
            var file = {
                id: id,
                uriString: url,
                fileName: fileName,
                title: title,
                backdrop: backdropURL
            };
            if (rewardedLoaded == false) {
                this.loadRewarded();
                rewardedLoaded = true;
            }
            if (!downloadTasks.some(downloadTask => downloadTask.fileName == file.fileName)) {
                downloadTasks.push(file);
                if (downloadOperating != null) {
                    if (rewardedTimer == 2) {
                        await rewarded.show();
                        this.createProgressUI(file.id);
                        rewardedTimer = 1;
                    } else {
                        this.createProgressUI(file.id);
                        rewardedTimer += 1;
                    }
                } else {
                    if (rewardedTimer == 2) {
                        await rewarded.show();
                        this.createProgressUI(file.id);
                        this.startDownload(file.id);
                        rewardedTimer = 1;
                    } else {
                        this.createProgressUI(file.id);
                        this.startDownload(file.id);
                        rewardedTimer += 1;
                    }
                }
            } else {
                console.log('Download task already exists');
            }
        } else if (target.classList.contains('play_episode_btn')) {
            var episodeWatchPreferenceDOM = document.querySelector('.episode_watch_preferences_dom');
            var showId = event.target.dataset.showId;
            var seasonNumber = event.target.dataset.seasonNumber;
            var episodeName = event.target.dataset.episodeName;
            var show = dataBaseCache.find(media => media.id == showId);
            var season = show.seasons.find(season => season.season_number == seasonNumber);
            var episode = season.episodes.find(episode => episode.name == episodeName);
            if (episode.non_translated_url && episode.translated_url) {
                episodeWatchPreferenceDOM.innerHTML = `
                <button class="button button-fill margin-bottom actions-close watch_episode_link" data-url="${episode.non_translated_url}">
                    Watch Non translated
                </button>
                <button class="button button-fill delete_btn actions-close watch_episode_link" data-url="${episode.translated_url}">
                    Watch translated 
                </button>
                `;
            } else {
                if (episode.non_translated_url) {
                    episodeWatchPreferenceDOM.innerHTML = `
                    <button class="button button-fill margin-bottom actions-close watch_episode_link" data-url="${episode.non_translated_url}">
                        Watch Non translated
                    </button>
                    `;
                } else if (episode.translated_url) {
                    episodeWatchPreferenceDOM.innerHTML = `
                    <button class="button button-fill delete_btn actions-close watch_episode_link" data-url="${episode.translated_url}">
                        Watch Translated
                    </button>
                    `;
                }
            }
            app.actions.open('.episode-watch-preference-actions', true);
        } else if (target.classList.contains('watch_episode_link')) {
            let url = event.target.dataset.url;
            console.log(url);

            // 1. streaming media player plugin
            var options = {
                successCallback: function () {
                    console.log("Video was closed without error.");
                },
                errorCallback: function (errMsg) {
                    console.log("Error! " + errMsg);
                },
                orientation: 'landscape',
                shouldAutoClose: true,
                controls: true
            };
            window.plugins.streamingMedia.playVideo(url, options);
        } else if (event.target.classList.contains('download_episode_btn')) {
            var episodePreferenceDOM = document.querySelector('.episode_preferences_dom');
            var showId = event.target.dataset.showId;
            var seasonNumber = event.target.dataset.seasonNumber;
            var episodeName = event.target.dataset.episodeName;
            var show = dataBaseCache.find(media => media.id == showId);
            var season = show.seasons.find(season => season.season_number == seasonNumber);
            var episode = season.episodes.find(episode => episode.name == episodeName);
            var episodeThumbnail = `https://image.tmdb.org/t/p/w300${episode.still_path}`;
            if (episode.non_translated_url && episode.translated_url) {
                episodePreferenceDOM.innerHTML = `
                <button class="button button-fill margin-bottom actions-close download_episode_link" data-url="${episode.non_translated_url}" data-title="${show.name}" data-episode-number="${episode.episode_number}" data-season-number="S${episode.season_number}" data-backdrop="${episodeThumbnail}">
                    Non translated
                </button>
                <button class="button button-fill delete_btn actions-close download_episode_link" data-url="${episode.translated_url}" data-title="${show.name}" data-episode-number="${episode.episode_number}" data-season-number="S${episode.season_number}" data-backdrop="${episodeThumbnail}">
                    Translated 
                </button>
                `;
            } else {
                if (episode.non_translated_url) {
                    episodePreferenceDOM.innerHTML = `
                    <button class="button button-fill margin-bottom actions-close download_episode_link" data-url="${episode.non_translated_url}" data-title="${show.name}" data-episode-number="${episode.episode_number}" data-season-number="S${episode.season_number}" data-backdrop="${episodeThumbnail}">
                        Non translated
                    </button>
                    `;
                } else if (episode.translated_url) {
                    episodePreferenceDOM.innerHTML = `
                    <button class="button button-fill delete_btn actions-close download_episode_link" data-url="${episode.translated_url}" data-title="${show.name}" data-episode-number="${episode.episode_number}" data-season-number="S${episode.season_number}" data-backdrop="${episodeThumbnail}">
                        Translated
                    </button>
                    `;
                }
            }
            app.actions.open('.episode-preference-actions', true);
        } else if (event.target.classList.contains('download_episode_link')) {
            let title = event.target.dataset.title;
            let url = event.target.dataset.url;
            let parts = url.split('.');
            var ext = parts[parts.length - 1];
            let name = `${title}${event.target.dataset.seasonNumber}E${event.target.dataset.episodeNumber}.${ext}`;
            var backdrop = event.target.dataset.backdrop;
            var fileName = name.replace(/[:,\-_\s?!'\"@()]/g, '');

            var id = Date.now();
            var file = {
                id: id,
                uriString: url,
                fileName: fileName,
                title: title,
                backdrop: backdrop
            };
            if (rewardedLoaded == false) {
                this.loadRewarded();
                rewardedLoaded = true;
            }
            if (!downloadTasks.some(downloadTask => downloadTask.fileName == file.fileName)) {
                downloadTasks.push(file);
                if (downloadOperating != null) {
                    if (rewardedTimer == 2) {
                        await rewarded.show();
                        this.createProgressUI(file.id);
                        rewardedTimer = 1;
                    } else {
                        this.createProgressUI(file.id);
                        rewardedTimer += 1;
                    }
                } else {
                    if (rewardedTimer == 2) {
                        await rewarded.show();
                        this.createProgressUI(file.id);
                        this.startDownload(file.id);
                        rewardedTimer = 1;
                    } else {
                        this.createProgressUI(file.id);
                        this.startDownload(file.id);
                        rewardedTimer += 1;
                    }
                }
            } else {
                console.log('Download task already exists');
            }
        } else if (event.target.classList.contains('action_icon')) {
            let id = parseInt(event.target.dataset.id);
            let action = event.target.dataset.action;
            let icon = event.target.firstElementChild;
            let text = event.target.lastElementChild;
            if (action == "wishlistSlider") {
                let object = sliderCache[id];
                var wishlist = Storage.getWishlist();
                wishlist.push(object);
                text.innerHTML = 'Added';
                icon.className = 'material-icons';
                event.target.style.pointerEvents = "none";
                Storage.saveWishList(wishlist);
            } else if (action == "wishlistPage") {
                let data = dataBaseCache.find(pageDataCache => pageDataCache.id == id);
                var wishlist = Storage.getWishlist();
                wishlist.push(data);
                text.innerHTML = 'Added';
                icon.className = 'material-icons';
                event.target.style.pointerEvents = "none";
                Storage.saveWishList(wishlist);
            } else if (action == "request") {
                let id = event.target.dataset.id;
                let name = event.target.dataset.name;
                let type = event.target.dataset.type;
                var toast = app.toast.create({
                    text: "You will be notified when your movie is uploaded thank you 🥰🥰",
                    position: 'top',
                    closeTimeout: 2500,
                });
                var token = Storage.getToken();
                event.target.style.pointerEvents = "none";
                text.innerHTML = 'Sent';
                icon.className = 'material-icons';
                var requestInfo = { id: id, name: name, token: token }
                const { data, error } = await supabase
                    .from('requests')
                    .insert({ id: id, type: type, titleorname: name, token: token });
                if (error) {

                }
                // save requestedlist
                var requestList = Storage.getRequestList();
                requestList.push(requestInfo);
                Storage.saveRequestList(requestList);
                toast.open();
            }
        } else if (event.target.classList.contains('delete_button')) {
            let id = event.target.parentElement.children[1].firstElementChild.dataset.id;
            let card = event.target.parentElement;
            let parentDOM = event.target.parentElement.parentElement;
            let wishlist = Storage.getWishlist();
            let newWishlist = wishlist.filter(
                (media) => media.id != id
            );
            Storage.saveWishList(newWishlist);
            parentDOM.removeChild(card);
        } else if (target.classList.contains('share_btn')) {
            var mediaId = event.target.dataset.id;
            var type = event.target.dataset.type;
            var posterUrl = event.target.dataset.poster;
            var mediaName = event.target.dataset.name;
            console.log(type, mediaId);
            var link = `https://kamumedia.online/${type}/${mediaId}`;
            window.plugins.socialsharing.share(`${mediaName}`, null, `${posterUrl}`, link);
        } else if (event.target.classList.contains('play_downloaded_video')) {
            let url = event.target.dataset.url;
            cordova.plugins.fileOpener2.showOpenWithDialog(
                url,
                'video/*',
                {
                    error: function (e) {
                        console.log('Error status: ' + e.status + ' - Error message: ' + e.message);
                    },
                    success: function () {
                        console.log('file opened successfully');
                    },
                    position: [0, 0]
                }
            );
        } else if (event.target.classList.contains('cancel_download_btn')) {
            let id = event.target.dataset.id;
            this.cancelDownload(id);
        } else if (event.target.classList.contains('now_btn')) {
            let id = event.target.dataset.id;
            if (downloadOperating == null) {
                this.startDownload(id);
            }
        } else if (target.classList.contains('filter-btn')) {
            var container = document.querySelector('.filter-container');
            container.classList.toggle('show');
        } else if (target.classList.contains('search_icon')) {
            if (true) {
                app.views.current.router.navigate('/search/');
            } else {
                app.views.current.router.navigate('/about/');
            }
        } else if (target.classList.contains('simulate-btn')) {
            let data = await this.simulateFetchAll();
        } else if (target.classList.contains('wish-link')) {
            app.views.current.router.navigate('/wishlist/');
        } else if (target.classList.contains('about-link')) {
            app.views.current.router.navigate('/about/');
        } else if (target.classList.contains('community-link')) {
            var url = "https://chat.whatsapp.com/GhIpKt00bNbFHkcixBGK3A";
            cordova.InAppBrowser.open(url, '_system');
        } else if (target.classList.contains('update-playstore-btn')) {
            var url = "https://play.google.com/store/apps/details?id=muvi.anime.hub";
            cordova.InAppBrowser.open(url, '_system');
        }
    }
    // observer scroll logic
    handleIntersection(entries, observer) {
        entries.forEach(async entry => {
            if (entry.isIntersecting) {
                const container = entry.target.parentElement;
                const type = container.dataset.type == 'movie' ? 'movie' : 'tv';
                const id = container.id;
                var progressSelector = type == "movie" ? "horizontal_scroll_progress" : "horizontal_scroll_progress_1";
                if (container.classList.contains('api')) {
                    var cache = dataCache[id];
                    var title = container.dataset.title.toLowerCase();
                    if (!apiLoading && cache.page <= 4) {
                        app.progressbar.show(`.${progressSelector}`);
                        apiLoading = true;
                        if (cache.page >= 5) {
                            loading = false;
                            return;
                        }
                        console.log('Starting fetching', title);
                        if (title === "popular") {
                            setTimeout(async () => {
                                const data = await this.getPopularMedia(type, title, cache.page + 1);
                                this.renderScrollMedia(data, container);
                                lazyLoad.update();
                                this.saveContainerData(id, 'api', title, data, type);
                                apiLoading = false;
                                app.progressbar.hide();
                            }, 2000);
                        } else if (title === "trending") {
                            setTimeout(async () => {
                                const data = await this.getTrendingMedia(type, title, cache.page + 1);
                                this.renderScrollMedia(data, container);
                                lazyLoad.update();
                                this.saveContainerData(id, 'api', title, data, type);
                                apiLoading = false;
                                app.progressbar.hide();
                            }, 2000);
                        }
                    }
                } else if (container.classList.contains('not-api')) {
                    var title = container.dataset.title;
                    const query = title == 'Recently uploaded' ? 'new' : 'latest';

                    var cache = dataCache[id];
                    if (!loading) {
                        app.progressbar.show(`.${progressSelector}`);
                        if (type == 'movie') {
                            console.log(cache.page);
                            let { data, count } = await this.getSupabaseMovies(query, cache.page + 1, cache.page + 11);
                            if (data.length > 0) {
                                console.log(data);
                                this.renderScrollMedia(data, container);
                                lazyLoad.update();
                                this.saveContainerData(id, 'not-api', title, data, type);
                                loading = false;
                                app.progressbar.hide();
                            } else {
                                app.progressbar.hide(`.${progressSelector}`);
                            }
                        } else {
                            console.log(cache.page);
                            let { data, count } = await this.getSupabaseShows(query, cache.page + 1, cache.page + 11);
                            if (data.length > 0) {
                                console.log(data);
                                this.renderScrollMedia(data, container);
                                lazyLoad.update();
                                this.saveContainerData(id, 'not-api', title, data, type);
                                loading = false;
                                app.progressbar.hide();
                            } else {
                                app.progressbar.hide(`.${progressSelector}`);
                            }
                        }
                    }
                }
            }
        });
    }
    observeLastItemInContainer(container) {
        const items = container.querySelectorAll('.media_card');
        if (items.length > 0) {
            const lastItem = items[items.length - 1];
            observer.observe(lastItem);
        }
    }
    unobserveLastItemInContainer(container) {
        const items = container.querySelectorAll('.media_card');
        if (items.length > 0) {
            const lastItem = items[items.length - 1];
            observer.unobserve(lastItem); // Unobserve the old last item
        }
    }
    subscribeRealTimeData() {
        // Create a single channel for multiple tables
        const channel = supabase
            .channel('multi-table-channel')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'movies' }, payload => {
                let data = payload.new;
                data.media_available = true;
                data.genres_text = data.genres;
                data.media_type = 'movie';
                this.cacheAllData(dataBaseCache, data);
            })
            // Subscribe to changes on the 'users' table
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tv_shows' }, payload => {
                let data = payload.new;
                data.media_available = true;
                data.genres_text = data.genres;
                data.media_type = 'tv';
                this.cacheAllData(dataBaseCache, data);
            })
            // Finalize the subscription
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log('Subscription to both tables has been successful')
                }
            })
    }
    async moviesView(appInstance) {
        await movieSlider(appInstance);
        app = appInstance;
        lazyLoad = app.lazyLoad;
        this.subscribeRealTimeData();
        await this.accessAppAndNativeFunctionality();

        observer = new IntersectionObserver((entries, observer) => this.handleIntersection(entries, observer), options);

        const elements = {
            moviesDOM: document.querySelector('.movies_dom'),
            sliderImages: document.querySelectorAll('.swiper-slide-image'),
            sliderTitle: document.querySelector('.slider_title'),
            previewBtn: document.querySelector('.preview_btn_movie'),
            movieSliderWishBtn: document.querySelector('.wishlist_button_movie'),
            movieSliderGenres: document.querySelector('.slider_genres_movie')
        };

        // Trending and Popular movies
        const [trendingData, popularData] = await Promise.all([
            this.getTrendingMedia('movie', 'trending', 1),
            this.getPopularMedia('movie', 'popular', 1)
        ]);

        // Supabase movie data
        const [recentMovies, latestMovies] = await Promise.all([
            this.getSupabaseMovies('new', 0, 10),
            this.getSupabaseMovies('latest', 0, 10)
        ]);

        await Promise.all([
            this.renderSlider(elements, trendingData, app.movieSlider),
            this.renderViewMedia(elements.moviesDOM, trendingData, 'movie', 'Trending'),
            this.renderViewMedia(elements.moviesDOM, popularData, 'movie', 'Popular')
        ]);

        await Promise.all([
            this.renderViewMedia(elements.moviesDOM, recentMovies.data, 'movie', 'Recently uploaded'),
            this.renderViewMedia(elements.moviesDOM, latestMovies.data, 'movie', 'Latest on Muvi')
        ]);

        lazyLoad.update();
        const containers = document.querySelectorAll('.content');
        containers.forEach(container => this.observeLastItemInContainer(container));
        document.querySelector('#movie_scroll_preloader').remove();
    }
    async showsView(app) {
        await showSlider(app);

        const elements = {
            showsDOM: document.querySelector('.shows_dom'),
            sliderImages: document.querySelectorAll('.swiper-slide-image1'),
            sliderTitle: document.querySelector('.slider_title1'),
            previewBtn: document.querySelector('.preview_btn_movie1'),
            movieSliderWishBtn: document.querySelector('.wishlist_button_movie1'),
            movieSliderGenres: document.querySelector('.slider_genres_show')
        }

        // Trending and popular shows plus slider
        const [trendingData, popularData] = await Promise.all([
            this.getTrendingMedia('tv', 'trending', 1),
            this.getPopularMedia('tv', 'popular', 1)
        ]);

        // Supabase show data
        const [recentShows, latestShows] = await Promise.all([
            this.getSupabaseShows('new', 0, 10),
            this.getSupabaseShows('latest', 0, 10)
        ]);

        await Promise.all([
            this.renderSlider(elements, trendingData, app.tvSlider),
            this.renderViewMedia(elements.showsDOM, trendingData, 'tv', 'Trending'),
            this.renderViewMedia(elements.showsDOM, popularData, 'tv', 'Popular')
        ]);

        await Promise.all([
            this.renderViewMedia(elements.showsDOM, recentShows.data, 'tv', 'Recently uploaded'),
            this.renderViewMedia(elements.showsDOM, latestShows.data, 'tv', 'Latest on Muvi')
        ]);
        lazyLoad.update();

        const containers = document.querySelectorAll('.content');
        containers.forEach(container => this.observeLastItemInContainer(container));
        app.infiniteScroll.destroy('#show_scroll');
        document.querySelector('#show_scroll_preloader').remove();

    }
}
var ui = new UI();
export default ui;