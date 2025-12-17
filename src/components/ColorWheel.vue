<template>
    <div class="color-wheel">
        <div class="wheel">
            <div
                class="marker"
                v-for="m in markers"
                :key="m.hex"
                :style="m.style"
                :title="m.hex"
            />
        </div>
        <p class="hint">Оттенки текущей палитры отмечены точками</p>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { hexToHsl } from '../utils/colorUtils';

const props = defineProps({
    colors: {
        type: Array,
        required: true,
    },
});

// Маркеры палитры поверх непрерывного цветового круга
const markers = computed(() => {
    const radius = 48; // ближе к внешнему кольцу
    return (props.colors || []).map((c) => {
        const hsl = hexToHsl(c.hex);
        const angle = hsl ? hsl.h : 0;
        return {
            hex: c.hex,
            style: {
                transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-${radius}%) rotate(${-angle}deg)`,
                backgroundColor: c.hex,
            },
        };
    });
});
</script>

<style scoped>
.color-wheel {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
}

.wheel {
    position: relative;
    width: 320px;
    height: 320px;
    border-radius: 50%;
    background: conic-gradient(
        from 0deg,
        red 0deg,
        #ff8000 30deg,
        #ffbf00 60deg,
        yellow 90deg,
        #80ff00 120deg,
        #00ff40 150deg,
        #00ffbf 180deg,
        #00bfff 210deg,
        #0080ff 240deg,
        #4000ff 270deg,
        #8000ff 300deg,
        #ff00bf 330deg,
        red 360deg
    );
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    border: 8px solid #fff;
    overflow: hidden;
}

.marker {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.95);
    box-shadow:
        0 2px 8px rgba(0, 0, 0, 0.35),
        0 0 0 1px rgba(0, 0, 0, 0.15);
    z-index: 3;
}

.hint {
    margin: 0;
    color: #6c757d;
    font-size: 0.9rem;
}
</style>