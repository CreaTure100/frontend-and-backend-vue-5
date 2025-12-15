<template>
    <div class="accessibility-checker">
        <h3>Проверка доступности (WCAG)</h3>
        <div class="checker-controls">
            <div class="color-selector">
                <label>Цвет текста:</label>
                <select v-model="foregroundIndex">
                    <option
                        v-for="(color, index) in colors"
                        :key="color.id"
                        :value="index"
                    >
                        Цвет {{ index + 1 }} - {{ color.hex }}
                    </option>
                </select>
            </div>
            <div class="color-selector">
                <label>Цвет фона:</label>
                <select v-model="backgroundIndex">
                    <option
                        v-for="(color, index) in colors"
                        :key="color.id"
                        :value="index"
                    >
                        Цвет {{ index + 1 }} - {{ color.hex }}
                    </option>
                </select>
            </div>
        </div>

        <div class="contrast-result" v-if="foregroundColor && backgroundColor">
            <div class="preview-box" :style="previewStyle">
                <span>Пример текста</span>
                <h2>Крупный текст</h2>
            </div>

            <div class="metrics">
                <div class="metric">
                    <strong>Контрастность:</strong>
                    <span class="ratio">{{ contrastRatio.toFixed(2) }}:1</span>
                </div>

                <div class="metric">
                    <strong>Обычный текст:</strong>
                    <span
                        :class="`level level-${normalTextLevel.toLowerCase()}`"
                    >
                        {{ localizedNormalLevel }}
                    </span>
                </div>

                <div class="metric">
                    <strong>Крупный текст:</strong>
                    <span
                        :class="`level level-${largeTextLevel.toLowerCase()}`"
                    >
                        {{ localizedLargeLevel }}
                    </span>
                </div>
            </div>

            <div class="recommendations" v-if="normalTextLevel === 'Fail'">
                <p>⚠️ Эти цвета не соответствуют WCAG для обычного текста.</p>
                <p>
                    Попробуйте увеличить контраст или скорректировать яркость.
                </p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { getContrastRatio, getAccessibilityLevel } from '../utils/colorUtils';

const props = defineProps({
    colors: {
        type: Array,
        required: true,
    },
});

const foregroundIndex = ref(0);
const backgroundIndex = ref(1);

const foregroundColor = computed(() => props.colors[foregroundIndex.value]);
const backgroundColor = computed(() => props.colors[backgroundIndex.value]);

const contrastRatio = computed(() => {
    if (!foregroundColor.value || !backgroundColor.value) return 0;
    return getContrastRatio(
        foregroundColor.value.hex,
        backgroundColor.value.hex
    );
});

const normalTextLevel = computed(() => {
    return getAccessibilityLevel(contrastRatio.value, false);
});

const largeTextLevel = computed(() => {
    return getAccessibilityLevel(contrastRatio.value, true);
});

const previewStyle = computed(() => ({
    color: foregroundColor.value?.hex,
    backgroundColor: backgroundColor.value?.hex,
}));

const levelLabels = {
    Fail: 'Не проходит',
    AA: 'AA',
    AAA: 'AAA',
};

const localizedNormalLevel = computed(
    () => levelLabels[normalTextLevel.value] || normalTextLevel.value
);
const localizedLargeLevel = computed(
    () => levelLabels[largeTextLevel.value] || largeTextLevel.value
);
</script>

<style scoped>
.accessibility-checker {
    padding: 1.5rem;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    background: white;
}

.accessibility-checker h3 {
    margin-top: 0;
    margin-bottom: 1rem;
}

.checker-controls {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
}

.color-selector {
    flex: 1;
    min-width: 200px;
}

.color-selector label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
}

.color-selector select {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 0.9rem;
}

.contrast-result {
    margin-top: 1.5rem;
}

.preview-box {
    padding: 2rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    text-align: center;
}

.preview-box span {
    font-size: 1rem;
    display: block;
    margin-bottom: 1rem;
}

.preview-box h2 {
    font-size: 1.5rem;
    margin: 0;
}

.metrics {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 4px;
}

.metric {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.ratio {
    font-size: 1.2rem;
    font-weight: bold;
    color: #495057;
}

.level {
    padding: 0.25rem 0.75rem;
    border-radius: 4px;
    font-weight: bold;
    font-size: 0.9rem;
}

.level-aaa {
    background: #28a745;
    color: white;
}

.level-aa {
    background: #ffc107;
    color: #000;
}

.level-fail {
    background: #dc3545;
    color: white;
}

.recommendations {
    margin-top: 1rem;
    padding: 1rem;
    background: #fff3cd;
    border: 1px solid #ffc107;
    border-radius: 4px;
    color: #856404;
}

.recommendations p {
    margin: 0.5rem 0;
}
</style>
