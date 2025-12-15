<template>
    <div class="generator-view">
        <div class="header">
            <h1>Генератор цветовых палитр</h1>
            <p>Создавайте красивые, гармоничные палитры для ваших проектов</p>
        </div>

        <div class="controls">
            <div class="control-group">
                <label>Количество цветов:</label>
                <div class="button-group">
                    <button
                        v-for="count in [3, 5, 7]"
                        :key="count"
                        @click="
                            colorCount = count;
                            generateNewPalette();
                        "
                        :class="{ active: colorCount === count }"
                    >
                        {{ count }}
                    </button>
                </div>
            </div>

            <div class="control-group">
                <label>Формат отображения:</label>
                <div class="button-group">
                    <button
                        @click="displayFormat = 'HEX'"
                        :class="{ active: displayFormat === 'HEX' }"
                    >
                        HEX
                    </button>
                    <button
                        @click="displayFormat = 'RGB'"
                        :class="{ active: displayFormat === 'RGB' }"
                    >
                        RGB
                    </button>
                </div>
            </div>

            <button class="generate-button" @click="generateNewPalette">
                Сгенерировать случайную палитру
            </button>
        </div>

        <div class="palette-display">
            <ColorCard
                v-for="color in colors"
                :key="color.id"
                :color="color"
                :display-format="displayFormat"
                @copy="handleCopy"
                @toggle-lock="toggleLock"
            />
        </div>

        <div class="advanced-section">
            <PalettePreview :colors="colors" />
        </div>

        <Notification :message="notification" />
    </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import ColorCard from '../components/ColorCard.vue';
import PalettePreview from '../components/PalettePreview.vue';
import Notification from '../components/Notification.vue';
import { generateRandomPalette, copyToClipboard } from '../utils/colorUtils';

const colors = ref([]);
const colorCount = ref(5);
const displayFormat = ref('HEX');
const notification = ref('');

const generateNewPalette = () => {
    const lockedColors = colors.value.filter((c) => c.locked);
    const newColors = generateRandomPalette(colorCount.value);

    // Keep locked colors in their positions
    if (lockedColors.length > 0) {
        lockedColors.forEach((lockedColor) => {
            const index = colors.value.findIndex(
                (c) => c.id === lockedColor.id
            );
            if (index >= 0 && index < newColors.length) {
                newColors[index] = lockedColor;
            }
        });
    }

    colors.value = newColors;
    savePaletteToLocalStorage();
};

const handleCopy = async (colorValue) => {
    const success = await copyToClipboard(colorValue);
    if (success) {
        notification.value = `Скопировано ${colorValue} в буфер обмена!`;
        setTimeout(() => {
            notification.value = '';
        }, 2500);
    }
};

const toggleLock = (colorId) => {
    const color = colors.value.find((c) => c.id === colorId);
    if (color) {
        color.locked = !color.locked;
        savePaletteToLocalStorage();
    }
};

const savePaletteToLocalStorage = () => {
    localStorage.setItem('currentPalette', JSON.stringify(colors.value));
    localStorage.setItem('colorCount', colorCount.value.toString());
};

const loadPaletteFromLocalStorage = () => {
    const saved = localStorage.getItem('currentPalette');
    const savedCount = localStorage.getItem('colorCount');

    if (savedCount) {
        colorCount.value = parseInt(savedCount);
    }

    if (saved) {
        try {
            colors.value = JSON.parse(saved);
        } catch (e) {
            console.error('Failed to load palette:', e);
            generateNewPalette();
        }
    } else {
        generateNewPalette();
    }
};

watch(colorCount, () => {
    localStorage.setItem('colorCount', colorCount.value.toString());
});

onMounted(() => {
    loadPaletteFromLocalStorage();
});
</script>

<style scoped>
.generator-view {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

.header {
    text-align: center;
    margin-bottom: 2rem;
}

.header h1 {
    margin: 0 0 0.5rem 0;
    font-size: 2.5rem;
    color: #212529;
}

.header p {
    margin: 0;
    color: #6c757d;
    font-size: 1.1rem;
}

.controls {
    display: flex;
    gap: 1.5rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
}

.control-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.control-group label {
    font-weight: 500;
    font-size: 0.9rem;
    color: #495057;
}

.button-group {
    display: flex;
    gap: 0.5rem;
}

.button-group button {
    padding: 0.5rem 1rem;
    border: 2px solid #dee2e6;
    background: white;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.9rem;
}

.button-group button:hover {
    border-color: #007bff;
    color: #007bff;
}

.button-group button.active {
    background: #007bff;
    border-color: #007bff;
    color: white;
}

.generate-button {
    padding: 0.75rem 2rem;
    background: #28a745;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1.1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
}

.generate-button:hover {
    background: #218838;
}

.palette-display {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 2rem;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.advanced-section {
    margin-top: 2rem;
}
</style>
