<template>
    <div class="advanced-view">
        <h1>Продвинутые инструменты палитр</h1>

        <div class="advanced-controls">
            <!-- Блок: генерация от базового цвета -->
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

            <!-- Блок: генерация по настроению -->
            <div class="control-section">
                <h3>Создать по настроению</h3>
                <div class="palette-type-selector">
                    <label>Настроение:</label>
                    <select v-model="mood">
                        <option value="calm">Спокойное</option>
                        <option value="energetic">Энергичное</option>
                        <option value="professional">Профессиональное</option>
                    </select>
                </div>
                <button @click="generateByMood" class="action-button">
                    Создать палитру по настроению
                </button>
            </div>
        </div>

        <div class="share-section">
            <button class="share-button" @click="sharePalette">
                Поделиться палитрой (ссылка)
            </button>
            <span class="share-hint">Ссылка включает текущие цвета</span>
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

        <div class="accent-section" v-if="accentColors.length">
            <h3>Акцентные цвета (относительно первого цвета палитры)</h3>
            <div class="accent-list">
                <div
                    v-for="accent in accentColors"
                    :key="accent.hex"
                    class="accent-card"
                    :style="{ backgroundColor: accent.hex }"
                >
                    <div class="accent-info">
                        <span class="accent-label">{{ accent.label }}</span>
                        <button class="accent-copy" @click="copyAccent(accent.hex)">
                            📋 Копировать
                        </button>
                    </div>
                    <div class="accent-code">{{ accent.hex }}</div>
                </div>
            </div>
        </div>

        <div class="tools-grid">
            <AccessibilityChecker :colors="colors" />
            <ExportPanel :colors="colors" @notify="showNotification" />
            <ColorWheel :colors="colors" />
            <div class="share-card">
                <h4>Шаринг палитры</h4>
                <p>Скопируйте ссылку и поделитесь палитрой.</p>
                <button class="share-button full" @click="sharePalette">
                    📋 Скопировать ссылку
                </button>
            </div>
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
import { ref, onMounted, watch, computed } from 'vue';
import ColorCard from '../components/ColorCard.vue';
import AccessibilityChecker from '../components/AccessibilityChecker.vue';
import ExportPanel from '../components/ExportPanel.vue';
import SavedPalettes from '../components/SavedPalettes.vue';
import Notification from '../components/Notification.vue';
import ColorWheel from '../components/ColorWheel.vue';
import {
    generateAnalogousPalette,
    generateMonochromaticPalette,
    generateTriadicPalette,
    generateComplementaryPalette,
    generateRandomPalette,
    generateMoodPalette,
    getAccentColors,
    copyToClipboard,
    encodePalette,
    decodePalette,
    hexToHsl,
} from '../utils/colorUtils';

const colors = ref(generateRandomPalette(5));
const baseColor = ref('#3498db');
const paletteType = ref('analogous');
const displayFormat = ref('HEX');
const notification = ref('');
const mood = ref('calm');

const paletteTypeLabels = {
    analogous: 'Аналоговая',
    monochromatic: 'Монохромная',
    triadic: 'Триадная',
    complementary: 'Комплементарная',
};

const moodLabels = {
    calm: 'Спокойная',
    energetic: 'Энергичная',
    professional: 'Профессиональная',
};

const STORAGE_KEY = 'advancedPalette';

const accentColors = computed(() => {
    const base = colors.value?.[0]?.hex;
    if (!base) return [];
    return getAccentColors(base);
});

const shareLink = computed(() => {
    if (!colors.value.length) return '';
    const encoded = encodePalette(colors.value);
    if (!encoded) return '';
    const url = new URL(window.location.href);
    url.searchParams.set('palette', encoded);
    return url.toString();
});

const saveCurrentPalette = () => {
    const payload = {
        colors: colors.value,
        baseColor: baseColor.value,
        paletteType: paletteType.value,
        mood: mood.value,
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
        if (parsed.mood) mood.value = parsed.mood;
    } catch (err) {
        console.error('Не удалось загрузить палитру:', err);
        colors.value = generateRandomPalette(5);
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
    baseColor.value = shared[0]?.hex || baseColor.value;
    saveCurrentPalette();
    showNotification('Палитра загружена из шаринговой ссылки');
    return true;
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

const generateByMood = () => {
    const newPalette = generateMoodPalette(mood.value, 5);
    colors.value = newPalette;
    showNotification(
        `Создана палитра по настроению: ${
            moodLabels[mood.value] || mood.value
        }`
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

const copyAccent = async (hex) => {
    const success = await copyToClipboard(hex);
    if (success) {
        showNotification(`Скопировано ${hex} в буфер обмена!`);
    }
};

const sharePalette = async () => {
    if (!shareLink.value) {
        showNotification('Нет палитры для шаринга');
        return;
    }
    const success = await copyToClipboard(shareLink.value);
    showNotification(
        success ? 'Ссылка на палитру скопирована!' : 'Не удалось скопировать ссылку'
    );
};

watch(baseColor, saveCurrentPalette);
watch(paletteType, saveCurrentPalette);
watch(mood, saveCurrentPalette);
watch(colors, saveCurrentPalette, { deep: true });

onMounted(() => {
    const fromQuery = loadPaletteFromQuery();
    if (!fromQuery) {
        loadSavedPalette();
    }
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
    margin-bottom: 1.25rem;
}

.share-section {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.25rem;
    flex-wrap: wrap;
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

.share-button.full {
    width: 100%;
    text-align: center;
}

.share-hint {
    color: #6c757d;
    font-size: 0.9rem;
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
    margin-bottom: 1.5rem;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.tools-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.share-card {
    padding: 1rem;
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.share-card h4 {
    margin: 0;
}

.share-card p {
    margin: 0;
    color: #6c757d;
}

.library-section {
    margin-top: 2rem;
}

.accent-section {
    margin-bottom: 1.5rem;
    padding: 1.25rem;
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 8px;
}

.accent-list {
    display: grid;
    gap: 0.75rem;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    margin-top: 0.75rem;
}

.accent-card {
    position: relative;
    border-radius: 8px;
    padding: 1rem;
    color: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.accent-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
    gap: 0.5rem;
}

.accent-label {
    font-weight: 600;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
}

.accent-copy {
    background: rgba(0, 0, 0, 0.25);
    color: white;
    border: none;
    border-radius: 4px;
    padding: 0.35rem 0.6rem;
    cursor: pointer;
    transition: background 0.2s;
}

.accent-copy:hover {
    background: rgba(0, 0, 0, 0.4);
}

.accent-code {
    font-family: monospace;
    font-size: 0.95rem;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
}
</style>