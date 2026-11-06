// =================================
// МОБИЛЬНОЕ МЕНЮ
// =================================

const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.navigation');

menuToggle.addEventListener('click', function () {

    navigation.classList.toggle('active');

});

// =================================
// ИНИЦИАЛИЗАЦИЯ ИКОНОК
// =================================

lucide.createIcons();

/* =================================
   ИЗБРАННОЕ И КОРЗИНА
================================= */

// =================================
// ИЗБРАННОЕ
// =================================

// Получаем сохранённое избранное
let favoriteProducts = JSON.parse(
    localStorage.getItem('favoriteProducts')
) || [];

// Обновляем состояние сердечек
function updateFavoriteButtons() {

    const favoriteButtons = document.querySelectorAll('.favorite-button');

    favoriteButtons.forEach(function (button) {

        const card = button.closest('.product-card');

        if (!card) return;

        const productName = card.querySelector('h3').textContent.trim();

        const isFavorite = favoriteProducts.includes(productName);

        button.classList.toggle('is-favorite', isFavorite);

        button.setAttribute('aria-pressed', isFavorite);

    });
}

// Отображаем товары на странице избранного
function updateFavoritesPage() {

    const favoritesPage = document.querySelector('.favorites-page');

    if (!favoritesPage) return;

    const productsGrid = favoritesPage.querySelector('.products-grid');
    const productCards = productsGrid.querySelectorAll('.product-card');

    let visibleCount = 0;

    productCards.forEach(function (card) {

        const productName = card.querySelector('h3').textContent.trim();

        const isFavorite = favoriteProducts.includes(productName);

        card.style.display = isFavorite ? '' : 'none';

        if (isFavorite) {
            visibleCount++;
        }

    });

    let emptyMessage = favoritesPage.querySelector('.favorites-empty');

    if (visibleCount === 0) {

        if (!emptyMessage) {

            emptyMessage = document.createElement('div');

            emptyMessage.className = 'favorites-empty';

            emptyMessage.innerHTML = `
                <i data-lucide="heart"></i>
                <h2>Пока здесь пусто</h2>
                <p>Добавляйте понравившиеся продукты в избранное, чтобы не потерять их.</p>
                <a href="catalog.html" class="empty-catalog-button">
                    Перейти в каталог
                </a>
            `;

            productsGrid.after(emptyMessage);

            lucide.createIcons();
        }

    } else if (emptyMessage) {

        emptyMessage.remove();

    }
}

// Обновляем индикатор избранного в шапке
function updateFavoriteNavIcon() {

    const favoriteNavLinks = document.querySelectorAll('.favorite-nav-link');

    favoriteNavLinks.forEach(function (link) {

        link.classList.toggle(
            'has-favorites',
            favoriteProducts.length > 0
        );

    });

}

// Сохраняем избранное
function saveFavorites() {

    localStorage.setItem(
        'favoriteProducts',
        JSON.stringify(favoriteProducts)
    );

}

// Обрабатываем нажатия на сердечки
document.addEventListener('click', function (event) {

    const button = event.target.closest('.favorite-button');

    if (!button) return;

    const card = button.closest('.product-card');

    if (!card) return;

    const productName = card.querySelector('h3').textContent.trim();

    if (favoriteProducts.includes(productName)) {

        favoriteProducts = favoriteProducts.filter(
            name => name !== productName
        );

    } else {

        favoriteProducts.push(productName);

    }

    saveFavorites();
    updateFavoriteButtons();
    updateFavoritesPage();
    updateFavoriteNavIcon();

});

// Восстанавливаем избранное при загрузке страницы
updateFavoriteButtons();
updateFavoritesPage();
updateFavoriteNavIcon();


// КОРЗИНА

const cartCount = document.querySelector('.cart-count');
const productsGrid = document.querySelector('.products-grid');

// Загружаем сохранённые товары
let cartProducts = JSON.parse(localStorage.getItem('cartProducts')) || {};

// Считаем общее количество товаров

function updateCartCount() {

    const total = Object.values(cartProducts).reduce(function (sum, quantity) {
        return sum + Number(quantity);
    }, 0);

    if (cartCount) {

        cartCount.textContent = total;

        // Показываем счётчик, если в корзине есть товары
        cartCount.style.display = total > 0 ? 'flex' : 'none';

    }

}

// Сохраняем корзину
function saveCart() {
    localStorage.setItem('cartProducts', JSON.stringify(cartProducts));
    updateCartCount();
}

// Создаём кнопку или счётчик товара
function renderProductControl(card) {
    const productName = card.querySelector('h3').textContent.trim();
    const quantity = Number(cartProducts[productName]) || 0;

    const oldControl = card.querySelector('.add-to-cart, .cart-stepper');

    if (!oldControl) return;

    if (quantity > 0) {
        oldControl.outerHTML = `
            <div class="cart-stepper">
                <button class="quantity-minus" aria-label="Уменьшить количество">
                    <i data-lucide="minus"></i>
                </button>

                <span class="quantity-value">${quantity}</span>

                <button class="quantity-plus" aria-label="Увеличить количество">
                    <i data-lucide="plus"></i>
                </button>
            </div>
        `;
    } else {
        oldControl.outerHTML = `
            <button class="add-to-cart" aria-label="Добавить в корзину">
                <i data-lucide="plus"></i>
            </button>
        `;
    }

    lucide.createIcons();
}

// Обновляем отображение всех товаров
function renderAllProductControls() {
    if (!productsGrid) return;

    const productCards = productsGrid.querySelectorAll('.product-card');

    productCards.forEach(function (card) {
        renderProductControl(card);
    });
}

// Обработка нажатий на кнопки корзины
if (productsGrid) {
    productsGrid.addEventListener('click', function (event) {

        const addButton = event.target.closest('.add-to-cart');
        const plusButton = event.target.closest('.quantity-plus');
        const minusButton = event.target.closest('.quantity-minus');

        const clickedButton = addButton || plusButton || minusButton;

        if (!clickedButton) return;

        const card = clickedButton.closest('.product-card');
        const productName = card.querySelector('h3').textContent.trim();

        let quantity = Number(cartProducts[productName]) || 0;

        if (addButton || plusButton) {
            quantity++;
        }

        if (minusButton) {
            quantity--;
        }

        if (quantity > 0) {
            cartProducts[productName] = quantity;
        } else {
            delete cartProducts[productName];
        }

        saveCart();
        renderProductControl(card);
    });
}

// Восстанавливаем корзину при загрузке страницы
renderAllProductControls();
updateCartCount();

/* =================================
   ПОДРОБНАЯ КАРТОЧКА ТОВАРА
================================= */

// Данные товаров

const productDetails = {
    'Томаты розовые': {
        category: 'Овощи',
        farm: 'Ферма «Зелёный луг»',
        description: 'Сочные розовые томаты с нежной мякотью и насыщенным сладковатым вкусом. Отлично подходят для свежих салатов, закусок и домашних блюд.',
        weight: '500 г',
        composition: 'Розовые томаты',
        storage: 'От +2 до +6 °C',
        shelfLife: 'До 7 дней',
        price: '290 ₽',
        image: 'images/product-tomatoes.jpg'
    },

    'Молоко цельное': {
        category: 'Молочные продукты',
        farm: 'Ферма «Молочная долина»',
        description: 'Натуральное цельное молоко с мягким сливочным вкусом. Подходит для завтраков, приготовления каш, напитков и домашних десертов.',
        weight: '1 л',
        composition: 'Цельное коровье молоко',
        storage: 'От +2 до +6 °C',
        shelfLife: 'До 5 дней',
        price: '160 ₽',
        image: 'images/product-milk.jpg'
    },

    'Яйца деревенские': {
        category: 'Яйца',
        farm: 'Ферма «Птичий двор»',
        description: 'Свежие куриные яйца от фермерских кур. Подходят для приготовления завтраков, выпечки и разнообразных домашних блюд.',
        weight: '10 шт.',
        composition: 'Куриные яйца',
        storage: 'От 0 до +20 °C',
        shelfLife: 'До 25 дней',
        price: '180 ₽',
        image: 'images/product-eggs.jpg'
    },

    'Сыр сливочный': {
        category: 'Молочные продукты',
        farm: 'Сыроварня «Свои»',
        description: 'Нежный фермерский сыр с мягкой текстурой и деликатным сливочным вкусом. Хорошо сочетается со свежим хлебом, овощами и фруктами.',
        weight: '200 г',
        composition: 'Молоко, закваска, соль',
        storage: 'От +2 до +6 °C',
        shelfLife: 'До 14 дней',
        price: '340 ₽',
        image: 'images/product-cheese.jpg'
    },

    'Яблоки сезонные': {
        category: 'Фрукты',
        farm: 'Сад «Яблоневый»',
        description: 'Ароматные сезонные яблоки с сочной мякотью и приятным балансом сладости и кислинки. Отличный вариант для перекуса и домашних десертов.',
        weight: '1 кг',
        composition: 'Свежие яблоки',
        storage: 'От +2 до +6 °C',
        shelfLife: 'До 30 дней',
        price: '210 ₽',
        image: 'images/product-apples.jpg'
    },

    'Мёд цветочный': {
        category: 'Бакалея',
        farm: 'Пасека «Медовый край»',
        description: 'Натуральный цветочный мёд с насыщенным ароматом и богатым вкусом. Подходит к чаю, выпечке и различным десертам.',
        weight: '500 г',
        composition: 'Натуральный цветочный мёд',
        storage: 'В сухом месте при комнатной температуре',
        shelfLife: 'До 12 месяцев',
        price: '450 ₽',
        image: 'images/product-honey.jpg'
    },

    'Огурцы грунтовые': {
        category: 'Овощи',
        farm: 'Ферма «Зелёный луг»',
        description: 'Свежие грунтовые огурцы с хрустящей мякотью и приятным ароматом. Подойдут для салатов, закусок и домашней консервации.',
        weight: '500 г',
        composition: 'Свежие огурцы',
        storage: 'От +2 до +6 °C',
        shelfLife: 'До 7 дней',
        price: '140 ₽',
        image: 'images/product-cucumbers.jpg'
    },

    'Хлеб ремесленный': {
        category: 'Бакалея',
        farm: 'Пекарня «Тёплый хлеб»',
        description: 'Ароматный ремесленный хлеб с хрустящей корочкой и мягким мякишем. Хорошо подходит к завтракам, супам и основным блюдам.',
        weight: '400 г',
        composition: 'Мука, вода, закваска, соль',
        storage: 'В сухом месте при комнатной температуре',
        shelfLife: 'До 3 дней',
        price: '190 ₽',
        image: 'images/product-bread.jpg'
    }
};


// Элементы модального окна

const productModal = document.querySelector('#productModal');
const modalClose = document.querySelector('.modal-close');
const modalOverlay = document.querySelector('.product-modal-overlay');

let currentModalProduct = null;


// Открытие подробной карточки

function openProductModal(card) {
    const name = card.querySelector('h3').textContent.trim();
    const product = productDetails[name];

    if (!product || !productModal) return;

    currentModalProduct = name;

    document.querySelector('#modalProductImage').src = product.image;
    document.querySelector('#modalProductImage').alt = name;

    document.querySelector('#modalProductCategory').textContent = product.category;
    document.querySelector('#modalProductName').textContent = name;
    document.querySelector('#modalProductFarm').textContent = product.farm;
    document.querySelector('#modalProductDescription').textContent = product.description;
    document.querySelector('#modalProductWeight').textContent = product.weight;
    document.querySelector('#modalProductComposition').textContent = product.composition;
    document.querySelector('#modalProductStorage').textContent = product.storage;
    document.querySelector('#modalProductShelfLife').textContent = product.shelfLife;
    document.querySelector('#modalProductPrice').textContent = product.price;

    updateModalQuantity();

    productModal.classList.add('active');
    productModal.setAttribute('aria-hidden', 'false');

    document.body.style.overflow = 'hidden';

    lucide.createIcons();
}


// Закрытие подробной карточки

function closeProductModal() {
    if (!productModal) return;

    productModal.classList.remove('active');
    productModal.setAttribute('aria-hidden', 'true');

    document.body.style.overflow = '';
    currentModalProduct = null;
}


// Обновление количества в модальном окне

function updateModalQuantity() {
    if (!currentModalProduct) return;

    const quantity = Number(cartProducts[currentModalProduct]) || 0;

    document.querySelector('.modal-quantity-value').textContent = quantity;
}


// Нажатие на фотографию или название товара

if (productsGrid) {
    productsGrid.addEventListener('click', function (event) {
        const card = event.target.closest('.product-card');

        if (!card) return;

        const clickedImage = event.target.closest('.product-image img');
        const clickedName = event.target.closest('.product-info h3');

        if (clickedImage || clickedName) {
            openProductModal(card);
        }
    });
}


// Кнопки закрытия

if (modalClose) {
    modalClose.addEventListener('click', closeProductModal);
}

if (modalOverlay) {
    modalOverlay.addEventListener('click', closeProductModal);
}


// Закрытие клавишей Escape

document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && productModal?.classList.contains('active')) {
        closeProductModal();
    }
});


// Управление количеством внутри модального окна

const modalCartControl = document.querySelector('#modalCartControl');

if (modalCartControl) {
    modalCartControl.addEventListener('click', function (event) {

        const plus = event.target.closest('.modal-quantity-plus');
        const minus = event.target.closest('.modal-quantity-minus');

        if (!plus && !minus) return;
        if (!currentModalProduct) return;

        let quantity = Number(cartProducts[currentModalProduct]) || 0;

        if (plus) quantity++;
        if (minus) quantity--;

        if (quantity > 0) {
            cartProducts[currentModalProduct] = quantity;
        } else {
            delete cartProducts[currentModalProduct];
        }

        saveCart();
        updateModalQuantity();

        // Обновляем счётчик в карточке каталога
        const cards = productsGrid.querySelectorAll('.product-card');

        cards.forEach(function (card) {
            const name = card.querySelector('h3').textContent.trim();

            if (name === currentModalProduct) {
                renderProductControl(card);
            }
        });
    });
}


/* =================================
   УПРАВЛЕНИЕ ОКНОМ ФИЛЬТРОВ
================================= */

const filterModal = document.querySelector('#filterModal');
const filterButton = document.querySelector('.filter-button');
const filterClose = document.querySelector('.filter-close');
const filterOverlay = document.querySelector('.filter-overlay');

// Открытие окна
if (filterButton && filterModal) {
    filterButton.addEventListener('click', function () {
        filterModal.classList.add('active');
        filterModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    });
}

// Закрытие окна
function closeFilterModal() {
    if (!filterModal) return;

    filterModal.classList.remove('active');
    filterModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

if (filterClose) {
    filterClose.addEventListener('click', closeFilterModal);
}

if (filterOverlay) {
    filterOverlay.addEventListener('click', closeFilterModal);
}

// Закрытие клавишей Escape
document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && filterModal?.classList.contains('active')) {
        closeFilterModal();
    }
});



/* =================================
   ФИЛЬТРАЦИЯ ТОВАРОВ
================================= */

const applyFiltersButton = document.querySelector('.filter-apply');
const resetFiltersButton = document.querySelector('.filter-reset');
const categoryCheckboxes = document.querySelectorAll('.category-filter');
const priceCheckboxes = document.querySelectorAll('.price-filter');

// Демонстрационные показатели популярности товаров
const productPopularity = {
    'Томаты розовые': 95,
    'Молоко цельное': 90,
    'Яйца деревенские': 85,
    'Сыр сливочный': 80,
    'Яблоки сезонные': 75,
    'Мёд цветочный': 70,
    'Огурцы грунтовые': 65,
    'Хлеб ремесленный': 60
};

// Демонстрационные данные о новинках
const productNewness = {
    'Сыр сливочный': 1
};

// Применение фильтров

function applyFilters() {
    const selectedCategories = Array.from(categoryCheckboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);

    const selectedPrices = Array.from(priceCheckboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);

    const sortSelect = document.querySelector('#sortSelect');
    const sortValue = sortSelect ? sortSelect.value : 'popular';

    const cards = Array.from(document.querySelectorAll('.product-card'));

    // Сохраняем первоначальный порядок карточек
cards.forEach(function (card, index) {
    if (!card.hasAttribute('data-original-order')) {
        card.dataset.originalOrder = index;
    }
});
    const productsGrid = document.querySelector('.products-grid');
    let visibleCount = 0;

    // Фильтрация
    const visibleCards = [];
    const hiddenCards = [];

    cards.forEach(function (card) {
        const name = card.querySelector('h3').textContent.trim();
        const product = productDetails[name];

        if (!product) return;

        const price = Number(
            card.querySelector('.product-price').textContent.replace(/[^\d]/g, '')
        );

        const category = product.category;

        const categoryMatch = selectedCategories.length === 0 ||
            selectedCategories.some(function (selected) {
                if (selected === 'Овощи') {
                    return category === 'Овощи' || category === 'Фрукты';
                }
                return category === selected;
            });

        const priceMatch = selectedPrices.length === 0 ||
            selectedPrices.some(function (range) {
                if (range === '0-200') return price <= 200;
                if (range === '200-300') return price > 200 && price <= 300;
                if (range === '300-400') return price > 300 && price <= 400;
                if (range === '400-500') return price > 400 && price <= 500;
                if (range === '500+') return price > 500;
                return false;
            });

        if (categoryMatch && priceMatch) {
            visibleCards.push(card);
        } else {
            hiddenCards.push(card);
        }
    });

    // Сортировка видимых товаров
visibleCards.sort(function (a, b) {
    const nameA = a.querySelector('h3').textContent.trim();
    const nameB = b.querySelector('h3').textContent.trim();

    const priceA = Number(
        a.querySelector('.product-price').textContent.replace(/[^\d]/g, '')
    );

    const priceB = Number(
        b.querySelector('.product-price').textContent.replace(/[^\d]/g, '')
    );

    if (sortValue === 'price-low') {
        return priceA - priceB;
    }

    if (sortValue === 'price-high') {
        return priceB - priceA;
    }

    if (sortValue === 'popular') {
    return productPopularity[nameB] - productPopularity[nameA];
}

if (sortValue === 'new') {
    const newnessDifference =
        (productNewness[nameB] || 0) - (productNewness[nameA] || 0);

    if (newnessDifference !== 0) {
        return newnessDifference;
    }

    return Number(a.dataset.originalOrder) - Number(b.dataset.originalOrder);
}

return Number(a.dataset.originalOrder) - Number(b.dataset.originalOrder);
});

    // Возвращаем карточки в каталог
    [...visibleCards, ...hiddenCards].forEach(function (card) {
        productsGrid.appendChild(card);
        card.style.display = visibleCards.includes(card) ? '' : 'none';
    });

    visibleCount = visibleCards.length;

// Показываем сообщение, если товары не найдены
const catalogEmpty = document.querySelector('#catalogEmpty');

if (catalogEmpty) {
    catalogEmpty.style.display =
        visibleCount === 0 ? 'flex' : 'none';
}

    const resultsCount = document.querySelector('.results-count');

if (resultsCount) {
    let word = 'товаров';

    if (visibleCount % 10 === 1 && visibleCount % 100 !== 11) {
        word = 'товар';
    } else if (
        visibleCount % 10 >= 2 &&
        visibleCount % 10 <= 4 &&
        (visibleCount % 100 < 12 || visibleCount % 100 > 14)
    ) {
        word = 'товара';
    }

    resultsCount.textContent = `${visibleCount} ${word}`;
}

    const resultsTitle = document.querySelector('.catalog-results > span:first-child');
        if (resultsTitle) {
        const hasActiveFilters =
            selectedCategories.length > 0 || selectedPrices.length > 0;

        resultsTitle.textContent = hasActiveFilters
            ? 'Результаты фильтрации'
            : 'Все продукты';
    }

    closeFilterModal();

    // Обновляем активную быструю категорию
    updateQuickCategoryState();
}


// Кнопка «Показать товары»
if (applyFiltersButton) {
    applyFiltersButton.addEventListener('click', applyFilters);
}

// Быстрые категории каталога

const quickCategories = document.querySelectorAll('.category-item');

// Синхронизация активной быстрой категории

function updateQuickCategoryState() {

    const selectedCategories = Array.from(categoryCheckboxes)
        .filter(function (checkbox) {
            return checkbox.checked;
        })
        .map(function (checkbox) {
            return checkbox.value;
        });

    quickCategories.forEach(function (item) {
        item.classList.remove('active');
    });

    // Если категории не выбраны — активна кнопка «Все продукты»
    if (selectedCategories.length === 0) {

        const allCategory = document.querySelector(
            '.category-item[data-category="all"]'
        );

        if (allCategory) {
            allCategory.classList.add('active');
        }

    }

    // Если выбрана ровно одна категория — подсвечиваем её
    if (selectedCategories.length === 1) {

        const selectedItem = document.querySelector(
            '.category-item[data-category="' + selectedCategories[0] + '"]'
        );

        if (selectedItem) {
            selectedItem.classList.add('active');
        }

    }

}

quickCategories.forEach(function (item) {

    item.addEventListener('click', function (event) {

        event.preventDefault();

        const selectedCategory = item.dataset.category;

        // Снимаем все выбранные категории
        categoryCheckboxes.forEach(function (checkbox) {
            checkbox.checked = false;
        });

        // Выбираем нужную категорию
        if (selectedCategory !== 'all') {

            categoryCheckboxes.forEach(function (checkbox) {

                if (checkbox.value === selectedCategory) {
                    checkbox.checked = true;
                }

            });

        }

        // Обновляем активную кнопку
        quickCategories.forEach(function (category) {
            category.classList.remove('active');
        });

        item.classList.add('active');

        // Применяем фильтры
        applyFilters();

    });

});

// Сброс фильтров
if (resetFiltersButton) {
    resetFiltersButton.addEventListener('click', function () {
        // Сбрасываем категории
        categoryCheckboxes.forEach(function (checkbox) {
            checkbox.checked = false;
        });

        // Сбрасываем цены
        priceCheckboxes.forEach(function (checkbox) {
            checkbox.checked = false;
        });

        // Возвращаем сортировку по популярности
        const sortSelect = document.querySelector('#sortSelect');

        if (sortSelect) {

    sortSelect.value = 'popular';

    // Обновляем надпись в кастомной сортировке
    const sortLabel = document.querySelector('.sort-select-button span');

    if (sortLabel) {
        sortLabel.textContent = 'По популярности';
    }

    // Закрываем список сортировки
    const customSort = document.querySelector('.custom-sort-select');

    if (customSort) {
        customSort.classList.remove('active');
    }

}

        // Обновляем каталог
        applyFilters();
    });
}


const emptyResetButton = document.querySelector('.empty-reset');

if (emptyResetButton && resetFiltersButton) {
    emptyResetButton.addEventListener('click', function () {
        resetFiltersButton.click();
    });
}

const sortSelect = document.querySelector('#sortSelect');

if (sortSelect) {
    sortSelect.addEventListener('change', applyFilters);
}


/* =================================
   ОТОБРАЖЕНИЕ КОРЗИНЫ
================================= */

const cartItemsContainer = document.querySelector('#cartItems');
const cartSummary = document.querySelector('#cartSummary');
const cartEmpty = document.querySelector('#cartEmpty');

function renderCartPage() {
    if (!cartItemsContainer) return;

    const products = Object.entries(cartProducts);
    const cartPageCount = document.querySelector('.cart-page-count');

    // Общее количество товаров
    const totalQuantity = products.reduce(function (sum, item) {
        return sum + Number(item[1]);
    }, 0);

    if (cartPageCount) {
        let word = 'товаров';

        if (totalQuantity % 10 === 1 && totalQuantity % 100 !== 11) {
            word = 'товар';
        } else if (
            totalQuantity % 10 >= 2 &&
            totalQuantity % 10 <= 4 &&
            (totalQuantity % 100 < 12 || totalQuantity % 100 > 14)
        ) {
            word = 'товара';
        }

        cartPageCount.textContent = `${totalQuantity} ${word}`;
    }

    // Пустая корзина
    if (products.length === 0) {
        cartItemsContainer.style.display = 'none';
        cartSummary.style.display = 'none';
        cartEmpty.style.display = 'flex';
        return;
    }

    cartItemsContainer.style.display = 'flex';
    cartSummary.style.display = 'block';
    cartEmpty.style.display = 'none';

    let totalPrice = 0;

    // Создание карточек товаров
    cartItemsContainer.innerHTML = products.map(function (item) {
        const productName = item[0];
        const quantity = Number(item[1]);
        const product = productDetails[productName];

        if (!product) return '';

        const price = Number(product.price.replace(/[^\d]/g, ''));
        const itemTotal = price * quantity;

        totalPrice += itemTotal;

        return `
            <article class="cart-item">

                <div class="cart-item-image">
                    <img src="${product.image}" alt="${productName}">
                </div>

                <div class="cart-item-info">
                    <span class="cart-item-farm">${product.farm}</span>
                    <h3>${productName}</h3>
                    <span class="cart-item-weight">${product.weight}</span>

                    <div class="cart-item-controls">
                        <div class="cart-item-stepper">
                            <button class="cart-minus" data-name="${productName}" aria-label="Уменьшить количество">
                                <i data-lucide="minus"></i>
                            </button>

                            <span>${quantity}</span>

                            <button class="cart-plus" data-name="${productName}" aria-label="Увеличить количество">
                                <i data-lucide="plus"></i>
                            </button>
                        </div>

                        <button class="cart-item-remove" data-name="${productName}" aria-label="Удалить товар">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                </div>

                <div class="cart-item-price">${itemTotal.toLocaleString('ru-RU')} ₽</div>

            </article>
        `;
    }).join('');

    // Итоговая стоимость
    cartSummary.innerHTML = `
        <h2>Ваш заказ</h2>

        <div class="cart-summary-row">
            <span>Товары (${totalQuantity} шт.)</span>
            <span>${totalPrice.toLocaleString('ru-RU')} ₽</span>
        </div>

        <div class="cart-summary-row">
            <span>Доставка</span>
            <span>Рассчитаем позже</span>
        </div>

        <div class="cart-summary-divider"></div>

        <div class="cart-summary-total">
            <span>Итого</span>
            <span>${totalPrice.toLocaleString('ru-RU')} ₽</span>
        </div>

        <button class="cart-checkout-button">
            Перейти к оформлению
        </button>
    `;

    lucide.createIcons();
}

// Обработка кнопок корзины
if (cartItemsContainer) {
    cartItemsContainer.addEventListener('click', function (event) {
        const button = event.target.closest('button');
        if (!button) return;

        const productName = button.dataset.name;
        if (!productName) return;

        if (button.classList.contains('cart-plus')) {
            cartProducts[productName]++;
        }

        if (button.classList.contains('cart-minus')) {
            cartProducts[productName]--;

            if (cartProducts[productName] <= 0) {
                delete cartProducts[productName];
            }
        }

        if (button.classList.contains('cart-item-remove')) {
            delete cartProducts[productName];
        }

        saveCart();
        renderCartPage();
    });
}

// Первоначальная загрузка
renderCartPage();


/* =================================
   УПРАВЛЕНИЕ ОФОРМЛЕНИЕМ ЗАКАЗА
================================= */

const checkoutModal = document.querySelector('#checkoutModal');
const checkoutButton = document.querySelector('.cart-checkout-button');
const checkoutClose = document.querySelector('.checkout-close');
const checkoutOverlay = document.querySelector('.checkout-overlay');
const checkoutTotal = document.querySelector('#checkoutTotal');
const checkoutForm = document.querySelector('#checkoutForm');

// Кастомный выбор времени доставки

const timeSelect = document.querySelector('.custom-time-select');

if (timeSelect) {

    const timeButton = timeSelect.querySelector('.time-select-button');
    const timeOptions = timeSelect.querySelector('.time-select-options');
    const timeValue = timeSelect.querySelector('#deliveryTime');
    const timeLabel = timeButton.querySelector('span');

    // Открываем и закрываем список
    timeButton.addEventListener('click', function () {
        timeSelect.classList.toggle('active');
    });

    // Выбираем время
    timeOptions.addEventListener('click', function (event) {

        const option = event.target.closest('button[data-value]');

        if (!option) return;

        timeValue.value = option.dataset.value;
        timeSelect.classList.remove('invalid');
        timeLabel.textContent = option.dataset.value;

        timeSelect.classList.remove('active');

    });

    // Закрываем список при клике вне него
    document.addEventListener('click', function (event) {

        if (!timeSelect.contains(event.target)) {
            timeSelect.classList.remove('active');
        }

    });

}

// Открытие окна
function openCheckoutModal() {
    if (!checkoutModal || !checkoutTotal) return;

    const total = Object.entries(cartProducts).reduce(function (sum, item) {
        const product = productDetails[item[0]];

        if (!product) return sum;

        const price = Number(product.price.replace(/[^\d]/g, ''));

        return sum + price * Number(item[1]);
    }, 0);

    checkoutTotal.textContent = total.toLocaleString('ru-RU') + ' ₽';

    checkoutModal.classList.add('active');
    checkoutModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

// Закрытие окна
function closeCheckoutModal() {
    if (!checkoutModal) return;

    checkoutModal.classList.remove('active');
    checkoutModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

// Обработчики открытия и закрытия
if (checkoutButton) {
    checkoutButton.addEventListener('click', openCheckoutModal);
}

if (checkoutClose) {
    checkoutClose.addEventListener('click', closeCheckoutModal);
}

if (checkoutOverlay) {
    checkoutOverlay.addEventListener('click', closeCheckoutModal);
}

// Закрытие по Escape
document.addEventListener('keydown', function (event) {
    if (
        event.key === 'Escape' &&
        checkoutModal?.classList.contains('active')
    ) {
        closeCheckoutModal();
    }
});


/* =================================
   ПОДТВЕРЖДЕНИЕ ЗАКАЗА
================================= */

const successModal = document.querySelector('#successModal');
const successOrderNumber = document.querySelector('#successOrderNumber');
const successReturnButton = document.querySelector('#successReturnButton');

// Кастомный календарь доставки

const customDatePicker = document.querySelector('.custom-date-picker');

if (customDatePicker) {

    const dateButton = customDatePicker.querySelector('.date-picker-button');
    const dateLabel = dateButton.querySelector('span');
    const calendar = customDatePicker.querySelector('.date-picker-calendar');
    const monthLabel = customDatePicker.querySelector('.calendar-month-year');
    const daysContainer = customDatePicker.querySelector('.calendar-days');
    const prevButton = customDatePicker.querySelector('.calendar-prev');
    const nextButton = customDatePicker.querySelector('.calendar-next');
    const dateInput = customDatePicker.querySelector('#deliveryDate');

    // Минимальная дата — завтра
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const minDate = new Date(today);
    minDate.setDate(minDate.getDate() + 1);

    // Месяц, который сейчас отображается
    let displayedMonth = new Date(
        minDate.getFullYear(),
        minDate.getMonth(),
        1
    );

    // Формат даты для сохранения
    function formatDateValue(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    }

    // Отрисовка календаря
    function renderCalendar() {

        const year = displayedMonth.getFullYear();
        const month = displayedMonth.getMonth();

        const monthName = new Intl.DateTimeFormat('ru-RU', {
            month: 'long',
            year: 'numeric'
        }).format(displayedMonth);

        monthLabel.textContent =
            monthName.charAt(0).toUpperCase() + monthName.slice(1);

        daysContainer.innerHTML = '';

        // Запоминаем день недели первого числа
        const firstDay = new Date(year, month, 1).getDay();
        const offset = (firstDay + 6) % 7;

        // Пустые ячейки перед первым числом
        for (let i = 0; i < offset; i++) {
            const emptyDay = document.createElement('span');
            daysContainer.appendChild(emptyDay);
        }

        // Количество дней в месяце
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let day = 1; day <= daysInMonth; day++) {

            const currentDate = new Date(year, month, day);
            const dateValue = formatDateValue(currentDate);

            const dayButton = document.createElement('button');

            dayButton.type = 'button';
            dayButton.className = 'calendar-day';
            dayButton.textContent = day;

            // Блокируем сегодняшний и прошедшие дни
            if (currentDate < minDate) {
                dayButton.disabled = true;
            }

            // Выделяем сегодняшний день
            if (currentDate.getTime() === today.getTime()) {
                dayButton.classList.add('today');
            }

            // Выделяем выбранную дату
            if (dateInput.value === dateValue) {
                dayButton.classList.add('selected');
            }

            // Выбор даты
            dayButton.addEventListener('click', function () {

                dateInput.value = dateValue;
                customDatePicker.classList.remove('invalid');

                dateLabel.textContent =
                    new Intl.DateTimeFormat('ru-RU', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    }).format(currentDate);

                customDatePicker.classList.remove('active');

                renderCalendar();

            });

            daysContainer.appendChild(dayButton);
        }

        // Нельзя перейти к месяцу раньше минимального
        const minMonth = new Date(
            minDate.getFullYear(),
            minDate.getMonth(),
            1
        );

        prevButton.disabled = displayedMonth <= minMonth;
    }

    // Открытие календаря
    dateButton.addEventListener('click', function () {
        customDatePicker.classList.toggle('active');
        renderCalendar();
    });

    // Предыдущий месяц
    prevButton.addEventListener('click', function () {
        displayedMonth.setMonth(displayedMonth.getMonth() - 1);
        renderCalendar();
    });

    // Следующий месяц
    nextButton.addEventListener('click', function () {
        displayedMonth.setMonth(displayedMonth.getMonth() + 1);
        renderCalendar();
    });

    // Закрытие при клике за пределами календаря
    document.addEventListener('click', function (event) {
        if (!customDatePicker.contains(event.target)) {
            customDatePicker.classList.remove('active');
        }
    });

    renderCalendar();

}

// МАСКА НОМЕРА ТЕЛЕФОНА

const phoneInput = document.querySelector('#customerPhone');

if (phoneInput) {

    function formatPhone(digits) {
        let formatted = '';

        if (digits.length > 0) {
            formatted = '+7 (' + digits.slice(0, 3);

            if (digits.length >= 3) {
                formatted += ')';
            }

            if (digits.length > 3) {
                formatted += ' ' + digits.slice(3, 6);
            }

            if (digits.length > 6) {
                formatted += '-' + digits.slice(6, 8);
            }

            if (digits.length > 8) {
                formatted += '-' + digits.slice(8, 10);
            }
        }

        return formatted;
    }

    function getCaretPosition(formatted, digitCount) {
        if (digitCount === 0) {
            return 4;
        }

        let count = 0;

        for (let i = 0; i < formatted.length; i++) {
            if (/\d/.test(formatted[i])) {

                // Пропускаем цифру 7 в коде страны
                if (i === 1) continue;

                count++;

                if (count === digitCount) {
                    return i + 1;
                }
            }
        }

        return formatted.length;
    }

    phoneInput.addEventListener('input', function () {
        const oldValue = phoneInput.value;
        const oldCaret = phoneInput.selectionStart;

        let digits = oldValue.replace(/\D/g, '');

        let digitsBeforeCaret = oldValue
            .slice(0, oldCaret)
            .replace(/\D/g, '').length;

        // Убираем код страны или восьмёрку
        if (digits.startsWith('7') || digits.startsWith('8')) {
            digits = digits.slice(1);

            if (oldValue.startsWith('+7') || oldValue.startsWith('+8')) {
                digitsBeforeCaret = Math.max(0, digitsBeforeCaret - 1);
            } else {
                digitsBeforeCaret = Math.max(0, digitsBeforeCaret - 1);
            }
        }

        digits = digits.slice(0, 10);
        digitsBeforeCaret = Math.min(digitsBeforeCaret, digits.length);

        const formatted = formatPhone(digits);

        phoneInput.value = formatted;

        const newCaret = getCaretPosition(formatted, digitsBeforeCaret);
        phoneInput.setSelectionRange(newCaret, newCaret);

        if (digits.length > 0 && digits.length < 10) {
            phoneInput.setCustomValidity(
                'Введите полный номер телефона из 10 цифр.'
            );
        } else {
            phoneInput.setCustomValidity('');
        }
    });
}

// Отправка формы
if (checkoutForm) {
    checkoutForm.addEventListener('submit', function (event) {
        event.preventDefault();

        if (Object.keys(cartProducts).length === 0) {
            closeCheckoutModal();
            return;
        }

        if (!checkoutForm.reportValidity()) return;
        // Проверяем выбор даты и времени доставки

const selectedDate = document.querySelector('#deliveryDate');
const selectedTime = document.querySelector('#deliveryTime');

const datePicker = document.querySelector('.custom-date-picker');
const timePicker = document.querySelector('.custom-time-select');

if (!selectedDate.value) {
    datePicker.classList.add('invalid');
    datePicker.querySelector('.date-picker-button').focus();
    return;
}

if (!selectedTime.value) {
    timePicker.classList.add('invalid');
    timePicker.querySelector('.time-select-button').focus();
    return;
}

datePicker.classList.remove('invalid');
timePicker.classList.remove('invalid');

        // Генерируем демонстрационный номер заказа
        const orderNumber = Math.floor(100000 + Math.random() * 900000);

        // Закрываем оформление
        closeCheckoutModal();

        // Очищаем корзину
        cartProducts = {};
        saveCart();
        renderCartPage();

        // Показываем успешное оформление
        if (successOrderNumber) {
            successOrderNumber.textContent = `№ ${orderNumber}`;
        }

        if (successModal) {
            successModal.classList.add('active');
            successModal.setAttribute('aria-hidden', 'false');
        }

        // Очищаем форму
        checkoutForm.reset();
    });
}

// Возвращение в каталог
if (successReturnButton) {
    successReturnButton.addEventListener('click', function () {
        window.location.href = 'catalog.html';
    });
}


// =================================
// ПОИСК ПО САЙТУ
// =================================

const searchToggle = document.querySelector('.search-toggle');
const searchPanel = document.querySelector('.search-panel');
const searchInput = document.querySelector('#siteSearchInput');
const searchClose = document.querySelector('.search-close');
const siteHeader = document.querySelector('.header');

if (searchToggle && searchPanel && searchInput && searchClose) {

    function openSearch() {
        searchPanel.style.top = `${siteHeader.getBoundingClientRect().bottom}px`;
        searchPanel.classList.add('active');
        searchInput.focus();
    }

    function closeSearch() {
        searchPanel.classList.remove('active');
        searchInput.value = '';
    }

    searchToggle.addEventListener('click', function (event) {
        event.preventDefault();

        if (searchPanel.classList.contains('active')) {
            closeSearch();
        } else {
            openSearch();
        }
    });

    searchClose.addEventListener('click', closeSearch);

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            closeSearch();
        }
    });

    window.addEventListener('resize', function () {
        if (searchPanel.classList.contains('active')) {
            searchPanel.style.top = `${siteHeader.getBoundingClientRect().bottom}px`;
        }
    });
}


// =================================
// ПОИСК ТОВАРОВ И ФЕРМ
// =================================

const searchResults = document.querySelector('#searchResults');

if (searchInput && searchResults) {

    searchInput.addEventListener('input', function () {
        const query = this.value.trim().toLowerCase();

        if (!query) {
            searchResults.innerHTML = `
                <p class="search-hint">
                    Начните вводить название товара или фермы
                </p>
            `;
            return;
        }

        // Ищем товары
        const products = Object.entries(productDetails).filter(([name, product]) => {
            return (
                name.toLowerCase().includes(query) ||
                product.farm.toLowerCase().includes(query) ||
                product.category.toLowerCase().includes(query)
            );
        });

        // Формируем уникальный список ферм
        const farms = [...new Set(
            Object.values(productDetails).map(product => product.farm)
        )].filter(farm => farm.toLowerCase().includes(query));

        let resultsHTML = '';

        if (products.length > 0) {
            resultsHTML += `<h4 class="search-result-heading">Товары</h4>`;

            products.forEach(([name, product]) => {
                resultsHTML += `
                    <a href="catalog.html"
                       class="search-result"
                       data-product="${name}">
                        <img src="${product.image}" alt="">
                        <span>
                            <strong>${name}</strong>
                            <small>${product.farm}</small>
                        </span>
                        <b>${product.price}</b>
                    </a>
                `;
            });
        }

        if (farms.length > 0) {
            resultsHTML += `<h4 class="search-result-heading">Фермы</h4>`;

            farms.forEach(farm => {
                resultsHTML += `
                    <a href="farms.html" class="search-result farm-search-result">
                        <span>
                            <strong>${farm}</strong>
                            <small>Фермерское хозяйство</small>
                        </span>
                        <i data-lucide="arrow-up-right"></i>
                    </a>
                `;
            });
        }

        if (!resultsHTML) {
            resultsHTML = `
                <p class="search-empty">
                    Ничего не найдено. Попробуйте изменить запрос.
                </p>
            `;
        }

        searchResults.innerHTML = resultsHTML;

        lucide.createIcons();
    });

    // Открытие выбранного товара
    searchResults.addEventListener('click', function (event) {
        const result = event.target.closest('[data-product]');

        if (!result) return;

        const productName = result.dataset.product;

        // Если пользователь уже находится в каталоге
        if (document.querySelector('#productModal')) {
            const cards = document.querySelectorAll('.product-card');

            const card = [...cards].find(item => {
                return item.querySelector('h3')?.textContent.trim() === productName;
            });

            if (card) {
                event.preventDefault();
                closeSearch();
                openProductModal(card);
            }
        }
    });
}

// Кастомная сортировка каталога

const customSort = document.querySelector('.custom-sort-select');

if (customSort) {

    const sortButton = customSort.querySelector('.sort-select-button');
    const sortLabel = sortButton.querySelector('span');
    const sortOptions = customSort.querySelector('.sort-select-options');
    const sortSelect = customSort.querySelector('#sortSelect');

    // Открываем и закрываем список
    sortButton.addEventListener('click', function () {
        customSort.classList.toggle('active');
    });

    // Выбираем способ сортировки
    sortOptions.addEventListener('click', function (event) {

        const option = event.target.closest('button[data-value]');

        if (!option) return;

        const value = option.dataset.value;
        console.log('Выбранная сортировка:', value);

        // Обновляем скрытый select
        sortSelect.value = value;

        // Обновляем надпись
        sortLabel.textContent = option.textContent.trim();

        // Передаём изменение существующей сортировке
        sortSelect.dispatchEvent(new Event('change', {
            bubbles: true
        }));

        customSort.classList.remove('active');

    });

    // Закрываем список при клике вне него
    document.addEventListener('click', function (event) {

        if (!customSort.contains(event.target)) {
            customSort.classList.remove('active');
        }

    });

}