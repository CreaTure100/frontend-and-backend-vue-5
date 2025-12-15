<template>
    <div class="advanced-view">
        <h1>Продвинутые инструменты палитр</h1>

        <div class="advanced-controls">
            <div class="control-section">
                <h3>Создать от базового цвета</h3>
                <div class="base-color-controls">
                    <input
                        type="color"
                        v-model="baseColor"
                        class="color-picker"
                    />
                    <input
                        type="text"
                        v-model="baseColor"
                        placeholder="#000000"
                        class="color-input"
                    />
                </div>

                <div class="palette-type-selector">
                    <label>Тип палитры:</label>
                    <select v-model="paletteType">
                        <option value="analogous">Аналоговая</option>
                        <option value="monochromatic">Монохромная</option>
                        <option value="triadic">Триадная</option>
                        <option value="complementary">Комплементарная</option>
                    </select>
                </div>

                <button @click="generateFromBase" class="action-button">
                    Создать по базовому цвету
                </button>
            </div>
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

        <div class="tools-grid">
            <AccessibilityChecker :colors="colors" />
            <ExportPanel :colors="colors" @notify="showNotification" />
        </div>

        <div class="library-section">
            <SavedPalettes
                :current-colors="colors"
                @load="loadPalette"
                @notify="showNotification"
            />
        </div>

        <Notification :message="notification" />
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import ColorCard from '../components/ColorCard.vue';
import AccessibilityChecker from '../components/AccessibilityChecker.vue';
import ExportPanel from '../components/ExportPanel.vue';
import SavedPalettes from '../components/SavedPalettes.vue';
import Notification from '../components/Notification.vue';
import {
    generateAnalogousPalette,
    generateMonochromaticPalette,
    generateTriadicPalette,
    generateComplementaryPalette,
    generateRandomPalette,
    copyToClipboard,
} from '../utils/colorUtils';

const colors = ref(generateRandomPalette(5));
const baseColor = ref('#3498db');
const paletteType = ref('analogous');
const displayFormat = ref('HEX');
const notification = ref('');

const paletteTypeLabels = {
    analogous: 'Аналоговая',
    monochromatic: 'Монохромная',
    triadic: 'Триадная',
    complementary: 'Комплементарная',
};

const STORAGE_KEY = 'advancedPalette';

const saveCurrentPalette = () => {
    const payload = {
        colors: colors.value,
        baseColor: baseColor.value,
        paletteType: paletteType.value,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
};

const loadSavedPalette = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
        colors.value = generateRandomPalette(5);
        saveCurrentPalette();
        return;
    }
    try {
        const parsed = JSON.parse(saved);
        if (parsed.colors && Array.isArray(parsed.colors)) {
            colors.value = parsed.colors;
        }
        if (parsed.baseColor) baseColor.value = parsed.baseColor;
        if (parsed.paletteType) paletteType.value = parsed.paletteType;
    } catch (err) {
        console.error('Не удалось загрузить палитру:', err);
        colors.value = generateRandomPalette(5);
    }
};

const generateFromBase = () => {
    let newPalette;

    switch (paletteType.value) {
        case 'analogous':
            newPalette = generateAnalogousPalette(baseColor.value, 5);
            break;
        case 'monochromatic':
            newPalette = generateMonochromaticPalette(baseColor.value, 5);
            break;
        case 'triadic':
            newPalette = generateTriadicPalette(baseColor.value);
            break;
        case 'complementary':
            newPalette = generateComplementaryPalette(baseColor.value);
            break;
        default:
            newPalette = generateRandomPalette(5);
    }

    colors.value = newPalette;
    showNotification(
        `Создана ${paletteTypeLabels[paletteType.value] || 'новая'} палитра!`
    );
    saveCurrentPalette();
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
        saveCurrentPalette();
    }
};

const loadPalette = (paletteColors) => {
    colors.value = JSON.parse(JSON.stringify(paletteColors));
    saveCurrentPalette();
};

const showNotification = (message) => {
    notification.value = message;
    setTimeout(() => {
        notification.value = '';
    }, 2500);
};

watch(baseColor, saveCurrentPalette);
watch(paletteType, saveCurrentPalette);
watch(colors, saveCurrentPalette, { deep: true });

onMounted(() => {
    loadSavedPalette();
});
</script>

<style scoped>
.advanced-view {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

.advanced-view h1 {
    text-align: center;
    margin-bottom: 2rem;
    color: #212529;
}

.advanced-controls {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.control-section {
    padding: 1.5rem;
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 8px;
}

.control-section h3 {
    margin-top: 0;
    margin-bottom: 1rem;
}

.base-color-controls {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
}

.color-picker {
    width: 80px;
    height: 40px;
    border: 1px solid #ced4da;
    border-radius: 4px;
    cursor: pointer;
}

.color-input {
    flex: 1;
    padding: 0.5rem;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-family: monospace;
}

.palette-type-selector {
    margin-bottom: 1rem;
}

.palette-type-selector label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
}

.palette-type-selector select {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ced4da;
    border-radius: 4px;
}

.action-button {
    width: 100%;
    padding: 0.75rem;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    transition: background 0.2s;
}

.action-button:hover {
    background: #0056b3;
}

.palette-display {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 2rem;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.tools-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.library-section {
    margin-top: 2rem;
}
</style>
