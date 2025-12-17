<template>
    <div class="color-wheel">
        <div class="wheel" :style="wheelStyle">
            <div class="marker"
                 v-for="m in markers"
                 :key="m.hex"
                 :style="m.style"
                 :title="m.hex">
            </div>
            <div class="center-dot">Цветовой круг</div>
        </div>
        <p class="hint">Отображение оттенков текущей палитры на круге</p>
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

const wheelStyle = computed(() => {
    const palette = props.colors || [];
    if (!palette.length) {
        return {
            background: 'conic-gradient(#ccc, #888, #ccc)',
        };
    }
    const n = palette.length;
    const stops = palette.map((c, i) => {
        const start = (i * 360) / n;
        const end = ((i + 1) * 360) / n;
        return `${c.hex} ${start}deg ${end}deg`;
    });
    return {
        background: `conic-gradient(${stops.join(', ')})`,
    };
});

const markers = computed(() => {
    const radius = 42; // проценты от размера круга
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
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    border: 8px solid #fff;
    overflow: hidden;
}

.marker {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.9);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
}

.center-dot {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 110px;
    height: 110px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.85);
    border: 2px solid #e9ecef;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 0.75rem;
    color: #495057;
    font-weight: 600;
    font-size: 0.9rem;
    transform: translate(-50%, -50%);
    box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.08);
}

.hint {
    margin: 0;
    color: #6c757d;
    font-size: 0.9rem;
}
</style>