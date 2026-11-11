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
