class Storage {
    static saveToken(fcmToken) {
        localStorage.setItem("fcmToken", fcmToken);
    }
    static getToken() {
        return localStorage.getItem("fcmToken") ? localStorage.getItem("fcmToken") : null;
    }
    static saveUser(user) {
        localStorage.setItem('user', JSON.stringify(user));
    }
    static getUser() {
        return localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : {};
    }
    static saveWishList(wishlist) {
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }
    static getWishlist() {
        return localStorage.getItem("wishlist") ? JSON.parse(localStorage.getItem("wishlist")) : [];
    }
    static saveRequestList(requestList) {
        localStorage.setItem('requests', JSON.stringify(requestList));
    }
    static saveVideoThumbNail(url, thumbnail) {
        var thumbnails = localStorage.getItem("thumbnails") ? JSON.parse(localStorage.getItem("thumbnails")) : [];
        if (!thumbnails.some(thumbnail => thumbnail.url == url)) {
            var thumbNailData = {
                url,
                thumbnail
            }
            thumbnails.push(thumbNailData);
            localStorage.setItem('thumbnails', JSON.stringify(thumbnails));
        }
    }
    static getVideoThumbnail(url) {
        var thumbnails = localStorage.getItem("thumbnails") ? JSON.parse(localStorage.getItem("thumbnails")) : [];
        var thumbnailObj = thumbnails.find(thumbnail => thumbnail.url == url);
        return thumbnailObj.thumbnail;
    }
    static getRequestList() {
        return localStorage.getItem("requests") ? JSON.parse(localStorage.getItem("requests")) : [];
    }
    static getBannerStatus() {
        return localStorage.getItem("bannerShowed") ? JSON.parse(localStorage.getItem("bannerShowed")) : false;
    }
}

export default Storage;