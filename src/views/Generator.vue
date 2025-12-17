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

        <div class="share-section">
            <button class="share-button" @click="sharePalette">
                Поделиться палитрой (ссылка)
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
import { ref, watch, onMounted, computed } from 'vue';
import ColorCard from '../components/ColorCard.vue';
import PalettePreview from '../components/PalettePreview.vue';
import Notification from '../components/Notification.vue';
import {
    generateRandomPalette,
    copyToClipboard,
    encodePalette,
    decodePalette,
    hexToHsl,
} from '../utils/colorUtils';

const colors = ref([]);
const colorCount = ref(5);
const displayFormat = ref('HEX');
const notification = ref('');

const shareLink = computed(() => {
    if (!colors.value.length) return '';
    const encoded = encodePalette(colors.value);
    if (!encoded) return '';
    const url = new URL(window.location.href);
    url.searchParams.set('palette', encoded);
    return url.toString();
});

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

const loadPaletteFromQuery = () => {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('palette');
    if (!encoded) return false;
    const hexes = decodePalette(encoded);
    if (!hexes || !hexes.length) return false;

    const shared = hexes.map((hex, i) => ({
        id: Date.now() + i,
        hex,
        hsl: hexToHsl(hex),
        locked: false,
    }));

    colors.value = shared;
    colorCount.value = shared.length;
    savePaletteToLocalStorage();
    notification.value = 'Палитра загружена из шаринговой ссылки';
    setTimeout(() => (notification.value = ''), 2500);
    return true;
};

const sharePalette = async () => {
    if (!shareLink.value) {
        notification.value = 'Нет палитры для шаринга';
        setTimeout(() => (notification.value = ''), 2000);
        return;
    }
    const success = await copyToClipboard(shareLink.value);
    if (success) {
        notification.value = 'Ссылка на палитру скопирована!';
        setTimeout(() => (notification.value = ''), 2500);
    } else {
        notification.value = 'Не удалось скопировать ссылку';
        setTimeout(() => (notification.value = ''), 2500);
    }
};

watch(colorCount, () => {
    localStorage.setItem('colorCount', colorCount.value.toString());
});

onMounted(() => {
    const loadedFromQuery = loadPaletteFromQuery();
    if (!loadedFromQuery) {
        loadPaletteFromLocalStorage();
    }
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
    margin-bottom: 1.25rem;
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

.share-section {
    display: flex;
    justify-content: center;
    margin-bottom: 1rem;
}

.share-button {
    padding: 0.6rem 1.4rem;
    background: #17a2b8;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    transition: background 0.2s;
}

.share-button:hover {
    background: #11849a;
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