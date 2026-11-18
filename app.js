const recommendations = {
    espresso: {
        name: 'Эспрессо',
        description: 'Крепкий, насыщенный кофе без лишнего.',
        cardId: 'drink-espresso'
    },
    cappuccino: {
        name: 'Капучино',
        description: 'Мягкий баланс эспрессо и молочной пены.',
        cardId: 'drink-cappuccino'
    },
    latte: {
        name: 'Латте',
        description: 'Нежный кофейный вкус с большим количеством молока.',
        cardId: 'drink-latte'
    },
    raf: {
        name: 'Раф',
        description: 'Сливочный напиток с ванилью — для особенного настроения.',
        cardId: 'drink-raf'
    }
};

const choiceButtons = document.querySelectorAll('.choice-button[data-drink]');
const recommendation = document.querySelector('#recommendation');
const recommendationName = document.querySelector('#recommendation-name');
const recommendationDescription = document.querySelector('#recommendation-description');
const recommendationLink = document.querySelector('#recommendation-link');

choiceButtons.forEach((button) => {
    button.addEventListener('click', () => {
        const selectedDrink = recommendations[button.dataset.drink];

        if (!selectedDrink) {
            throw new Error(`Unknown drink selection: ${button.dataset.drink}`);
        }

        choiceButtons.forEach((choice) => {
            choice.setAttribute('aria-pressed', String(choice === button));
        });

        recommendationName.textContent = selectedDrink.name;
        recommendationDescription.textContent = selectedDrink.description;
        recommendationLink.href = `#${selectedDrink.cardId}`;
        recommendation.hidden = false;

        document.querySelectorAll('.drink-card').forEach((card) => {
            card.classList.toggle('is-highlighted', card.id === selectedDrink.cardId);
        });
    });
});

const menuProducts = new Map(
    [...document.querySelectorAll('.drink-card[data-drink-card]')].map((card) => [
        card.dataset.drinkCard,
        {
            id: card.dataset.drinkCard,
            name: card.querySelector('h3').textContent,
            price: Number(card.dataset.price)
        }
    ])
);
const orderCart = new Map();
const cartCount = document.querySelector('#cart-count');
const orderSummary = document.querySelector('#order-summary');
const orderEmpty = document.querySelector('#order-empty');
const orderItems = document.querySelector('#order-items');
const orderTotal = document.querySelector('#order-total');
const orderTotalPrice = document.querySelector('#order-total-price');
const checkoutForm = document.querySelector('#checkout-form');
const orderStatus = document.querySelector('#order-status');
const formatPrice = new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 0
});

function formatKzt(amount) {
    return `${formatPrice.format(amount)} ₸`;
}

function renderCart() {
    orderItems.replaceChildren();

    let itemCount = 0;
    let total = 0;

    orderCart.forEach((quantity, productId) => {
        const product = menuProducts.get(productId);
        itemCount += quantity;
        total += product.price * quantity;

        const item = document.createElement('li');
        item.className = 'order-item';

        const details = document.createElement('div');
        details.className = 'order-item-details';

        const name = document.createElement('strong');
        name.textContent = product.name;

        const unitPrice = document.createElement('span');
        unitPrice.textContent = `${formatKzt(product.price)} за шт.`;
        details.append(name, unitPrice);

        const controls = document.createElement('div');
        controls.className = 'quantity-controls';

        const decreaseButton = document.createElement('button');
        decreaseButton.className = 'quantity-button';
        decreaseButton.type = 'button';
        decreaseButton.dataset.cartAction = 'decrease';
        decreaseButton.dataset.productId = productId;
        decreaseButton.setAttribute('aria-label', `Уменьшить количество: ${product.name}`);
        decreaseButton.textContent = '−';

        const quantityLabel = document.createElement('span');
        quantityLabel.className = 'item-quantity';
        quantityLabel.textContent = String(quantity);

        const increaseButton = document.createElement('button');
        increaseButton.className = 'quantity-button';
        increaseButton.type = 'button';
        increaseButton.dataset.cartAction = 'increase';
        increaseButton.dataset.productId = productId;
        increaseButton.setAttribute('aria-label', `Увеличить количество: ${product.name}`);
        increaseButton.textContent = '+';

        controls.append(decreaseButton, quantityLabel, increaseButton);

        const subtotal = document.createElement('strong');
        subtotal.className = 'order-item-subtotal';
        subtotal.textContent = formatKzt(product.price * quantity);

        item.append(details, controls, subtotal);
        orderItems.append(item);
    });

    const hasItems = itemCount > 0;
    cartCount.textContent = String(itemCount);
    orderSummary.textContent = hasItems ? `Добавлено напитков: ${itemCount}` : 'Корзина пока пуста';
    orderEmpty.hidden = hasItems;
    orderItems.hidden = !hasItems;
    orderTotal.hidden = !hasItems;
    checkoutForm.hidden = !hasItems;
    orderTotalPrice.textContent = formatKzt(total);

    document.querySelectorAll('[data-add-to-order]').forEach((button) => {
        const productId = button.closest('.drink-card').dataset.drinkCard;
        button.textContent = orderCart.has(productId) ? 'Добавить ещё' : 'Добавить в заказ';
    });
}

document.querySelectorAll('[data-add-to-order]').forEach((button) => {
    button.addEventListener('click', () => {
        const productId = button.closest('.drink-card').dataset.drinkCard;

        if (!menuProducts.has(productId)) {
            throw new Error(`Unknown menu product: ${productId}`);
        }

        orderCart.set(productId, (orderCart.get(productId) || 0) + 1);
        orderStatus.textContent = '';
        renderCart();
    });
});

orderItems.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) {
        return;
    }

    const button = event.target.closest('button[data-cart-action]');

    if (!button) {
        return;
    }

    const productId = button.dataset.productId;
    const quantity = orderCart.get(productId);

    if (button.dataset.cartAction === 'increase') {
        orderCart.set(productId, quantity + 1);
    } else if (button.dataset.cartAction === 'decrease') {
        if (quantity === 1) {
            orderCart.delete(productId);
        } else {
            orderCart.set(productId, quantity - 1);
        }
    }

    orderStatus.textContent = '';
    renderCart();
});

checkoutForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = checkoutForm.elements.namedItem('customerName').value.trim();
    const phone = checkoutForm.elements.namedItem('phone').value.trim();

    if (!name || !phone) {
        orderStatus.textContent = 'Укажите имя и телефон для самовывоза.';
        return;
    }

    orderStatus.textContent = `Спасибо, ${name}! Заказ рассчитан в демо-режиме и не отправлен в кофейню.`;
});

renderCart();
