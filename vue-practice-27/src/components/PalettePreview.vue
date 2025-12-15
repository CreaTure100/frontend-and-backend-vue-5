<template>
    <div class="palette-preview" :class="{ dark: isDarkBackground }">
        <h3>Предпросмотр интерфейса</h3>
        <div class="preview-container">
            <div class="preview-section">
                <h4 class="preview-heading" :style="{ color: colors[0]?.hex }">
                    Пример заголовка
                </h4>
                <p class="preview-text">
                    Пример текста, чтобы увидеть, как ваша палитра выглядит в
                    интерфейсе.
                </p>
            </div>

            <div class="preview-section">
                <button class="preview-button" :style="buttonStyle">
                    Основная кнопка
                </button>
                <button
                    class="preview-button secondary"
                    :style="secondaryButtonStyle"
                >
                    Вторичная кнопка
                </button>
            </div>

            <div class="preview-section">
                <div class="preview-card" :style="cardStyle">
                    <h5 :style="{ color: colors[0]?.hex }">
                        Заголовок карточки
                    </h5>
                    <p>Содержимое карточки с применёнными цветами палитры.</p>
                    <a href="#" :style="{ color: colors[1]?.hex }"
                        >Узнать больше →</a
                    >
                </div>
            </div>
        </div>

        <button class="toggle-background" @click="toggleBackground">
            {{ isDarkBackground ? 'Светлая тема' : 'Тёмная тема' }}
        </button>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
    colors: {
        type: Array,
        required: true,
    },
});

const isDarkBackground = ref(false);

const buttonStyle = computed(() => ({
    backgroundColor: props.colors[0]?.hex || '#007bff',
    borderColor: props.colors[0]?.hex || '#007bff',
    color: '#ffffff',
}));

const secondaryButtonStyle = computed(() => ({
    backgroundColor: 'transparent',
    borderColor: props.colors[1]?.hex || '#6c757d',
    color: props.colors[1]?.hex || '#6c757d',
}));

const cardStyle = computed(() => ({
    borderColor: props.colors[2]?.hex || '#dee2e6',
    backgroundColor: isDarkBackground.value
        ? 'rgba(255, 255, 255, 0.05)'
        : 'white',
}));

const toggleBackground = () => {
    isDarkBackground.value = !isDarkBackground.value;
};
</script>

<style scoped>
.palette-preview {
    padding: 2rem;
    border-radius: 8px;
    background: #f8f9fa;
    transition: background 0.3s;
}

.palette-preview.dark {
    background: #1a1a1a;
    color: #ffffff;
}

.palette-preview h3 {
    margin-top: 0;
    margin-bottom: 1.5rem;
}

.preview-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.preview-section {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
}

.preview-heading {
    margin: 0;
    font-size: 1.5rem;
    font-weight: bold;
}

.preview-text {
    margin: 0;
    flex: 1;
}

.preview-button {
    padding: 0.5rem 1.5rem;
    border: 2px solid;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: opacity 0.2s;
}

.preview-button:hover {
    opacity: 0.8;
}

.preview-button.secondary {
    background: transparent;
}

.preview-card {
    flex: 1;
    min-width: 250px;
    padding: 1.5rem;
    border: 2px solid;
    border-radius: 8px;
    transition: background 0.3s;
}

.preview-card h5 {
    margin-top: 0;
    margin-bottom: 0.5rem;
}

.preview-card p {
    margin: 0.5rem 0;
}

.preview-card a {
    text-decoration: none;
    font-weight: 500;
}

.toggle-background {
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    background: white;
    cursor: pointer;
    transition: background 0.2s;
}

.dark .toggle-background {
    background: #333;
    color: white;
    border-color: #555;
}

.toggle-background:hover {
    background: #e9ecef;
}

.dark .toggle-background:hover {
    background: #444;
}
</style>
