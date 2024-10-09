const options2 = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwMTRjMDcwNTQ4MTEwNTc1MGY2NTYwNWVmNzhiMTEzOCIsInN1YiI6IjY2NGE0NmI2Y2NkMWIyYmUyODkyZmY2MSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.N65dSOgnFiBMsCeNfZdA3WoLHMxZQJ4oMFNeIzn0S9o'
    }
};

class PageUI {
    async getCollectionData(id) {
        const response = await fetch(`https://api.themoviedb.org/3/collection/${id}?language=en-US`, options2);
        const data = await response.json();
        return data.parts;
    }
    async getRecommendedMovies(id, page) {
        const response = await fetch(`https://api.themoviedb.org/3/movie/${id}/recommendations?language=en-US&page=${page}`, options2);
        const data = await response.json();
        return data.results;
    }
    async getRecommendedShows(id, page) {
        const response = await fetch(`https://api.themoviedb.org/3/tv/${id}/recommendations?language=en-US&page=${page}`, options2);
        const data = await response.json();
        return data.results;
    }
    renderScrollMedia(mediaArr, mediaDOM) {
        var dateProperty;
        var titleProperty;
        var mediaType;
        var shortenName;
        mediaArr.forEach(mediaItem => {
            if (mediaItem.title) {
                titleProperty = "title";
                dateProperty = "release_date";
                mediaType = "movie";
                shortenName = mediaItem.title;
            } else {
                shortenName = mediaItem.name;
                mediaType = "tv";
                titleProperty = "name";
                dateProperty = "first_air_date";
            }
            var date = mediaItem[dateProperty];
            var poster = mediaItem.poster_path
            var id = mediaItem.id;
            var mediaCard = document.createElement('div');
            mediaCard.className = "media_card";

            var media = document.createElement('div');
            media.className = "media";
            var img = document.createElement('img');
            img.className = "movie_poster lazy";
            img.dataset.id = id;
            img.dataset.name = mediaType;
            img.dataset.page = "main";
            img.setAttribute('data-src', `https://image.tmdb.org/t/p/w500${poster}`);
            img.src = '../pages/placeholder.webp';
            media.appendChild(img);
            var details = document.createElement('div');
            details.className = "details";
            details.innerHTML = `
            <h4>${shortenName}</h4>
            <p>${date}</p>
            `
            mediaCard.appendChild(media);
            mediaCard.appendChild(details);
            mediaDOM.appendChild(mediaCard);
        });
    }
    renderCast(castArr, mediaDOM) {
        castArr.forEach(cast => {
            var name = cast.name
            var character = cast.character
            var profile = cast.profile_path;
            var list = document.createElement('li');

            var itemLink = document.createElement('a');
            itemLink.className = 'item-link';
            // Create item content div
            var itemContent = document.createElement('div');
            itemContent.classList.add('item-content');
            itemContent.style.pointerEvents = 'none';
            // Create item media div
            var itemMedia = document.createElement('div');
            itemMedia.classList.add('item-media');
            // Create image element
            var img = document.createElement('img');
            img.className = "list_poster_img lazy"
            img.style.borderRadius = '8px';
            img.src = '../pages/placeholder.webp';
            img.setAttribute('data-src', `https://image.tmdb.org/t/p/w300${profile}`);
            // Append image to item media
            itemMedia.appendChild(img);
            // Create item inner div
            var itemInner = document.createElement('div');
            itemInner.classList.add('item-inner');
            // Create item title row div
            var itemTitleRow = document.createElement('div');
            itemTitleRow.classList.add('item-title-row');
            // Create item title div
            var itemTitle = document.createElement('div');
            itemTitle.classList.add('item-title');
            itemTitle.textContent = name;
            // Append item title to item title row
            itemTitleRow.appendChild(itemTitle);
            // Append item title row to item inner
            itemInner.appendChild(itemTitleRow);
            // Create item subtitle div
            var itemSubtitle = document.createElement('div');
            itemSubtitle.classList.add('item-subtitle');
            itemSubtitle.textContent = character;
            // Append item subtitle to item inner
            itemInner.appendChild(itemSubtitle);
            // Append item media, item inner to item content
            itemContent.appendChild(itemMedia);
            itemContent.appendChild(itemInner);
            // Append item content to anchor element
            itemLink.appendChild(itemContent);

            list.appendChild(itemLink);
            mediaDOM.appendChild(list)
        })
    }
    renderCollection(mediaArr, mediaDOM, mediaPage) {
        var dateProperty;
        var titleProperty;
        var mediaType;
        var shortenName;
        mediaArr.forEach(media => {
            if (media.title) {
                titleProperty = "title";
                dateProperty = "release_date";
                mediaType = "movie";
                shortenName = media.title;
            } else {
                shortenName = media.name;
                mediaType = "tv";
                titleProperty = "name";
                dateProperty = "first_air_date";
            }
            var date = media[dateProperty];
            var poster = media.poster_path
            var id = media.id;
            var list = document.createElement('li');

            var itemLink = document.createElement('a');
            itemLink.className = 'item-link movie_poster';
            itemLink.dataset.id = id;
            itemLink.dataset.page = mediaPage;
            itemLink.dataset.name = mediaType;
            // Create item content div
            var itemContent = document.createElement('div');
            itemContent.classList.add('item-content');
            itemContent.style.pointerEvents = 'none';
            // Create item media div
            var itemMedia = document.createElement('div');
            itemMedia.classList.add('item-media');
            // Create image element
            var img = document.createElement('img');
            img.className = "list_poster_img lazy"
            img.style.borderRadius = '8px';
            img.src = './pages/placeholder.webp';
            img.setAttribute('data-src', `https://image.tmdb.org/t/p/w500${poster}`);
            // Append image to item media
            itemMedia.appendChild(img);
            // Create item inner div
            var itemInner = document.createElement('div');
            itemInner.classList.add('item-inner');
            // Create item title row div
            var itemTitleRow = document.createElement('div');
            itemTitleRow.classList.add('item-title-row');
            // Create item title div
            var itemTitle = document.createElement('div');
            itemTitle.classList.add('item-title');
            itemTitle.textContent = shortenName;
            // Append item title to item title row
            itemTitleRow.appendChild(itemTitle);
            // Append item title row to item inner
            itemInner.appendChild(itemTitleRow);
            // Create item subtitle div
            var itemSubtitle = document.createElement('div');
            itemSubtitle.classList.add('item-subtitle');
            itemSubtitle.textContent = mediaType;
            // Append item subtitle to item inner
            itemInner.appendChild(itemSubtitle);
            // Create item text div
            var itemText = document.createElement('div');
            itemText.classList.add('item-text');
            itemText.textContent = media.overview;
            // Append item text to item inner
            itemInner.appendChild(itemText);
            // Append item media, item inner to item content
            itemContent.appendChild(itemMedia);
            itemContent.appendChild(itemInner);
            // Append item content to anchor element
            itemLink.appendChild(itemContent);

            list.appendChild(itemLink);
            mediaDOM.appendChild(list)
        })
    }
    renderEpisodes(mediaDOM, mediaArr, id, showOverview) {
        mediaArr.forEach(episode => {
            let overView = episode.overview != '' ? episode.overview : showOverview;
            var list = document.createElement('li');
            list.innerHTML = `
                <a class="item-link no-ripple">
                        <div class="item-content">
                            <div class="item-media">
                                    <span>
                                        <i class="f7-icons play_episode_btn" data-episode-name="${episode.name}" data-season-number="${episode.season_number}" data-show-id="${id}">play_circle_fill</i>
                                    </span>
                                <img style="border-radius: 8px" src="./pages/placeholder.webp" data-src="https://image.tmdb.org/t/p/w300${episode.still_path}" class="lazy backdrop still_image" />
                            </div>
                            <div class="item-inner">
                                    <i class="f7-icons download_episode_btn ripple" data-episode-name="${episode.name}" data-season-number="${episode.season_number}" data-show-id="${id}">arrow_down_to_line</i>
                                <div class="item-title-row">
                                    <div class="item-title">Episode ${episode.episode_number}</div>
                                </div>
                                <div class="item-subtitle">${episode.name}</div>
                                <div class="item-text">${overView}</div>
                            </div>
                        </div>
                    </a>
                `
            mediaDOM.appendChild(list);
        })
    }
    renderWishMedia(mediaArr, mediaDOM) {
        var dateProperty;
        var titleProperty;
        var mediaType;
        var shortenName;
        function shortenText2(string, maxLength) {
            if (string.length > maxLength) {
                return string.substring(0, maxLength) + '...';
            }
            return string;
        }
        mediaArr.forEach(media => {
            if (media.title) {
                titleProperty = "title";
                dateProperty = "release_date";
                mediaType = "movie";
                shortenName = media.title;
            } else {
                shortenName = media.name;
                mediaType = "tv";
                titleProperty = "name";
                dateProperty = "first_air_date";
            }
            var title = shortenText2(shortenName, 14);
            var date = media[dateProperty];
            var poster = media.poster_path
            var id = media.id;
            var mediaCard = document.createElement('div');
            mediaCard.className = "media_card";

            var deleteBtn = document.createElement('i');
            deleteBtn.className = "icon material-icons delete_button";
            deleteBtn.innerText = "delete";

            var media = document.createElement('div');
            media.className = "media";
            var img = document.createElement('img');
            img.className = "movie_poster lazy";
            img.dataset.id = id;
            img.dataset.name = mediaType;
            img.dataset.page = "main";
            img.setAttribute('data-src', `https://image.tmdb.org/t/p/w500${poster}`);
            img.src = './placeholder.jpg';
            media.appendChild(img);

            var details = document.createElement('div');
            details.className = "details";
            details.innerHTML = `
            <h4 class="title">${title}</h4>
            <p>${date}</p>
            `
            mediaCard.appendChild(deleteBtn);
            mediaCard.appendChild(media);
            mediaCard.appendChild(details);

            // content.appendChild(mediaCard);
            mediaDOM.appendChild(mediaCard);
        });
    }
}

var ui = new PageUI();
export default ui;