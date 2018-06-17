// создание блока с отзывом
export function createReviewNode(item) {
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

`<li class="review-item">
    <div class="review-image">
        <img src="./src/img/fanin.jpg" alt="fanin">
    </div>
    <div class="review-content">
        <div class="review-top">
            <h4 class="review-name">Валентин Фанин</h4>
            <div class="review-info">
                <span class="review-place">Шоколадница</span>
                <span class="review-date">13.12.2015</span>
            </div>
        </div>
        <p class="review-text">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusamus doloremque doloribus excepturi exercitationem expedita explicabo facere hic illo illum magni, maiores molestiae nostrum, nulla pariatur perspiciatis quidem quos recusandae reiciendis repellendus, repudiandae rerum similique soluta vel. Asperiores debitis ea eius eligendi enim eos, molestiae non obcaecati, officiis perspiciatis quasi quod?
        </p>
    </div>
</li>`

// создание блока с фотографией
export function createPhotoItem(url) {
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
