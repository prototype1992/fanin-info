function createPhotoItem(url) {
    // create li
    let photoItem = document.createElement('li');
    photoItem.classList.add('photos__item');
    // create image
    let image = new Image();
    image.src = url;
    image.classList.add('photos__img');

    photoItem.appendChild(image);

    return photoItem;
}

function createReviewNode(item) {
    console.log('item', item);

    // создаем обертку
    let li = document.createElement('li');
    li.classList.add('review-item');

    // левая часть с картинкой
    let reviewImage = document.createElement('div');
    reviewImage.classList.add('review-image');

    // картинка человека
    let userImage = new Image();
    userImage.src = './src/img/fanin.jpg';

    // вставляем аватарку в блок
    reviewImage.appendChild(userImage);

    // правая часть с контентом отзыва
    let reviewContent = document.createElement('div');
    reviewContent.classList.add('review-content');

    // верхняя часть
    let reviewTop = document.createElement('div');
    reviewTop.classList.add('review-top');

    let reviewName = document.createElement('h4');
    reviewName.classList.add('review-name');
    reviewName.textContent = item.name;

    let reviewInfo = document.createElement('div');
    reviewInfo.classList.add('review-info');

    let reviewPlace = document.createElement('span');
    reviewPlace.classList.add('review-place');
    reviewPlace.textContent = item.placeValue;

    let reviewDate = document.createElement('span');
    reviewDate.classList.add('review-date');
    reviewDate.textContent = item.date;

    reviewInfo.appendChild(reviewPlace);
    reviewInfo.appendChild(reviewDate);

    reviewTop.appendChild(reviewName);
    reviewTop.appendChild(reviewInfo);

    let reviewComment = document.createElement('p');
    reviewComment.classList.add('review-text');
    reviewComment.textContent = item.comment;

    reviewContent.appendChild(reviewTop);
    reviewContent.appendChild(reviewComment);

    li.appendChild(reviewImage);
    li.appendChild(reviewContent);

    return li;
}

let myMap = null; // карта
let clusterer = null; // кластер для меток
let placeMark = null; // текущая открытая метка
let coords = null; // временное хранение координат
let points = []; // временное хранение координат
let reviews = {}; // отзывы
let photos = []; // фотки

// элементы ДОМ
const DOM = {
    addReview: document.querySelector('#addReview'),
    address: document.querySelector('#address'),
    close: document.querySelector('#close'),
    addBtn: document.querySelector('#add-btn'),
    formName: document.querySelector('#form-name'),
    formPlaceName: document.querySelector('#form-place-name'),
    formText: document.querySelector('#form-text'),
    list: document.querySelector('#reviews-list'),

    formUpload: document.querySelector('#formUpload'),
    photosList: document.querySelector('#photos-list'),
    fileInput: document.querySelector('#fileInput'),
};

ymaps.ready(initMap);

function initMap() {
    myMap = new ymaps.Map("map", {
        center: [55.76, 37.64],
        zoom: 5,
        // controls: ['zoomControl'],
        // behaviors: ['drag']
    });

    // создаем кластер
    clusterer = new ymaps.Clusterer({
        preset: 'islands#invertedVioletClusterIcons',
        groupByCoordinates: false,
        clusterDisableClickZoom: true,
        clusterHideIconOnBalloonOpen: false,
        geoObjectHideIconOnBalloonOpen: false,
        clusterOpenBalloonOnClick: true,
        clusterBalloonContentLayout: 'cluster#balloonCarousel',
        clusterBalloonPanelMaxMapArea: 0,
        clusterBalloonContentLayoutWidth: 250,
        clusterBalloonContentLayoutHeight: 150,
        clusterBalloonPagerSize: 5
    });
    clusterer.add(points);
    myMap.geoObjects.add(clusterer);

    // клик по карте
    myMap.events.add('click', function (e) {
        // получаем координаты
        coords = e.get('coords');

        // отображаем блок с добавлением
        showAddReview();

        // если метка есть, сравни ее с координатами
        if (placeMark) {
            // если координаты не совпадают
            if (placeMark.geometry.getCoordinates().toString() !== coords.toString()) {
                // очищаем текущий маркер
                placeMark = null;

                // очищаем отзывы
                reviews = [];
                photos = [];

                // очищаем блок отзывы
                DOM.list.innerHTML = 'Отзывов пока нет...';
            }
        } else {
            // иначе очищаем блок отзывы
            DOM.list.innerHTML = 'Отзывов пока нет...';
        }

        // если метка открыта, то закрыть
        if (myMap.balloon.isOpen()) {
            myMap.balloon.close();
        }

        // меняем адрес в строке адреса
        changeAddress(coords, DOM.address);
    });
}

// событие добавления отзыва
DOM.addBtn.addEventListener('click', event => {
    let {formName, formPlaceName, formText} = DOM;

    let date = new Date();

    let newReview = {
        name: formName.value,
        placeValue: formPlaceName.value,
        comment: formText.value,
        date: date.toLocaleString()
    };

    // если форма валидка
    if (validForm()) {
        // Если метка уже создана.
        if (!placeMark) {
            // create placeMark to map
            createPlaceMark(coords, newReview);
            // add review
            addReview(newReview);
            // render reviews
            renderReviews(reviews);
            // clear form data
            clearForm();
        } else {
            // add review
            addReview(newReview);
            // render reviews
            renderReviews(reviews);
            // clear form data
            clearForm();
        }
    }

    console.log('points', points);
});

DOM.close.addEventListener('click', () => {
    // скрываем блок с отзывами и формой
    hideAddReview();

    // очищаем текущий маркер
    placeMark = null;

    // очищаем отзывы
    reviews = [];

    // очищаем фотки
    photos = [];
});

// скрытие блока ДОБАВЛЕНИЯ
function hideAddReview() {
    DOM.addReview.style.display = 'none';
}

// отображение блока ДОБАВЛЕНИЯ
function showAddReview() {
    DOM.addReview.style.display = 'block';
}

function openClusterLink(event) {
    showAddReview();

    let balloonLink = document.querySelector('.balloonLink');

    let localCoords = balloonLink.getAttribute('data-coords');
    let localReviews = [];

    // console.log('balloonLink', balloonLink);
    // console.log('localCoords', localCoords);
    // console.log('points', points);

    for (let item of points) {
        if (item.geometry._coordinates.toString() === localCoords.toString()) {
            localReviews.push(item.properties.get('reviews'));
            console.log('localReviews', localReviews);
        }
    }
    renderReviews(localReviews[0]);
}

window.openClusterLink = openClusterLink;

// создание метки
function createPlaceMark(coords, review) {
    //Создаём метку.
    let newPlaceMark = new ymaps.Placemark(
        coords,
        {
            balloonContentHeader: `<p>${review.placeValue}</p>`,
            balloonContentBody: `<div>
<h3 class="clusterTitle"><a href="#" data-coords="${coords}" class="balloonLink" onclick="(function() {
    console.log('this', this);
    window.openClusterLink();
})()">${DOM.address.textContent}</a></h3>
<p class="clusterText">${review.placeValue}</p>
</div>`,
            balloonContentFooter: `<p>${review.date}</p>`
        },
        {
            preset: 'islands#violetDotIconWithCaption',
            draggable: false,
            openBalloonOnClick: false
        }
    );

    placeMark = newPlaceMark;

    // создаем поле с отзывами в метке
    newPlaceMark.properties.set('reviews', []);
    newPlaceMark.properties.set('photos', []);

    reviews = newPlaceMark.properties.get('reviews');
    photos = newPlaceMark.properties.get('photos');

    // добавляем флажок на карту
    myMap.geoObjects.add(newPlaceMark);
    // clustered add
    clusterer.add(newPlaceMark);
    // добавляем в points
    points.push(newPlaceMark);

    newPlaceMark.events.add('click', event => {
        // показываем блок
        showAddReview();

        // меняем адрес
        changeAddress(newPlaceMark.geometry.getCoordinates(), DOM.address);

        // рендерим отзывы
        reviews = newPlaceMark.properties.get('reviews');
        renderReviews(reviews);
    });
}

// рендер отзывов
function renderReviews(data) {
    DOM.list.innerHTML = '';

    let fragment = document.createDocumentFragment();

    for (let item of data) {
        let review = createReviewNode(item);

        fragment.appendChild(review);
    }

    DOM.list.appendChild(fragment);
}

// добавление отзыва
function addReview(object) {
    let {name, placeValue, comment} = object;
    if (name && placeValue && comment) {
        reviews.push(object);
    } else {
        alert('Заполните все поля для добавления отзыва!');
    }
}

function changeAddress(coords, element) {
    // получаем данные по координатам
    ymaps.geocode(coords)
        .then((response) => {
            // меняем адрес на блоке добавления
            let firstGeoObject = response.geoObjects.get(0);
            // меняем адрес на блоке добавления
            element.textContent = firstGeoObject.getAddressLine();
        });
}

function validForm() {
    if (DOM.formName.value && DOM.formPlaceName.value && DOM.formText) {
        return true;
    }
    return false;
}

function clearForm() {
    DOM.formName.value = '';
    DOM.formPlaceName.value = '';
    DOM.formText.value = '';
}

// загрузка фотографии
DOM.formUpload.addEventListener('submit', event => {
    event.preventDefault();

    let data = new FormData();
    data.append('data', DOM.fileInput.files[0]);

    // xhr
    const xhr = new XMLHttpRequest();

    xhr.open('POST', 'https://api.graph.cool/file/v1/cj9s3t4t4637u0101uzts1e9f');

    xhr.send(data);

    xhr.addEventListener('load', response => {
        let responseParse = JSON.parse(response.target.response);

        DOM.photosList.appendChild(createPhotoItem(responseParse.url));
    });
});

