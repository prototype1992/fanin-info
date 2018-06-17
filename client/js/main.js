const API_URL = 'http://localhost:9001/api/places';

class PlaceApi {
    static getPlaces() {
        return fetch(API_URL, {method: 'get'})
            .then(response => response.json())
    }

    static addPlace(place) {
        return fetch(API_URL, {
            method: 'post',
            body: JSON.stringify(place),
            headers: {
                'Accept': 'application/json',
                'Content-type': 'application/json'
            }
        })
            .then(response => response.json());
    }
}

class MapApi {
    static createPlaceMark(coords) {}
}

function photoComponent(url) {
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

function reviewComponent(item) {
    console.log('item', item);

    // создаем обертку
    let li = document.createElement('li');
    li.classList.add('review-item');

    // левая часть с картинкой
    let reviewImage = document.createElement('div');
    reviewImage.classList.add('review-image');

    // картинка человека
    let userImage = new Image();
    userImage.src = './img/fanin.jpg';

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
    reviewPlace.textContent = item.place;

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
let places = []; // карта
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
        zoom: 4,
        controls: ['zoomControl'],
        // behaviors: ['drag']
    });

    // создаем кластер
    clusterer = new ymaps.Clusterer({
        preset: 'islands#invertedVioletClusterIcons'
    });
    clusterer.add(points);
    myMap.geoObjects.add(clusterer);

    // клик по карте
    myMap.events.add('click', function (e) {
        // получаем координаты
        coords = e.get('coords');

        console.log('coords', coords.toString());

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

    console.log('points', points);

    // получаем все метки с api и рендерим их на карту
    PlaceApi.getPlaces()
        .then(response => {
            console.log('getPlaces', response);
            places = response;
            console.log('places', places);
            response.forEach(item => {
                let myPlaceMark = new ymaps.Placemark(
                    item.coordinates.split(','),
                    {
                        preset: 'islands#violetDotIconWithCaption',
                        draggable: false,
                        openBalloonOnClick: false
                    }
                );
                // вставляем данные с апи в метку
                myPlaceMark.properties.set('_id', item._id);
                myPlaceMark.properties.set('reviews', item.reviews);
                myPlaceMark.properties.set('photos', item.photos);

                // добавляем метку на карту
                myMap.geoObjects.add(myPlaceMark);
                console.log('myPlaceMark', myPlaceMark);

                // обработка клика по карте
                myPlaceMark.events.add('click', event => {
                    let _id = myPlaceMark.properties.get('_id');

                    console.log('_id', _id);
                    console.log('coords', coords);
                    coords = myPlaceMark.geometry.getCoordinates();

                    placeMark = myPlaceMark;

                    // показываем блок
                    showAddReview();

                    // меняем адрес
                    changeAddress(myPlaceMark.geometry.getCoordinates(), DOM.address);

                    // рендерим отзывы
                    reviews = myPlaceMark.properties.get('reviews');
                    renderReviews(reviews);

                    // рендерим фотки
                    photos = myPlaceMark.properties.get('photos');
                    renderPhotos(photos);
                });
            })
        });
}

// событие добавления отзыва
DOM.addBtn.addEventListener('click', () => {
    let {formPlaceName, formText} = DOM;

    let date = new Date();

    let newReview = {
        place: formPlaceName.value,
        comment: formText.value,
        date: date.toLocaleString(),
        coordinates: coords.toString(),
        address: DOM.address.textContent,
        reviewPlace: formPlaceName.value,
        reviewComment: formText.value,
        photoUrl: 'http://www.nat-geo.ru/upload/iblock/484/484764813d6e0fabdfe15024d814ea34.jpg'
    };

    // если форма валидка
    if (validForm()) {
        // Если метка уже создана.
        if (!placeMark) {
            // отправляем запрос в БД
            PlaceApi.addPlace(newReview);
            // create placeMark to map
            createPlaceMark(coords);
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

// создание метки
function createPlaceMark(coords) {
    //Создаём метку.
    let newPlaceMark = new ymaps.Placemark(
        coords,
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

    console.log('placeMark', placeMark);
}

// рендер отзывов
function renderReviews(data) {
    DOM.list.innerHTML = '';

    console.log('data renderReviews', data);

    let fragment = document.createDocumentFragment();

    for (let item of data) {
        let review = reviewComponent(item);

        fragment.appendChild(review);
    }

    DOM.list.appendChild(fragment);
}

function renderPhotos(data) {
    DOM.photosList.innerHTML = '';

    console.log('data renderPhotos', data);

    let fragment = document.createDocumentFragment();

    for (let item of data) {
        let photo = photoComponent(item.url);

        fragment.appendChild(photo);
    }

    DOM.photosList.appendChild(fragment);
}

// добавление отзыва
function addReview(object) {
    let {reviewPlace, reviewComment} = object;
    if (reviewPlace && reviewComment) {
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
    if (DOM.formPlaceName.value && DOM.formText) {
        return true;
    }
    return false;
}

function clearForm() {
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

        DOM.photosList.appendChild(photoComponent(responseParse.url));
    });
});
