<template>
    <div class="color-card" :style="{ backgroundColor: color.hex }">
        <div class="color-info">
            <div class="color-code" @click="copyColor">
                {{ displayFormat === 'HEX' ? color.hex : rgbString }}
            </div>
            <button
                class="lock-button"
                @click.stop="toggleLock"
                :class="{ locked: color.locked }"
                :title="
                    color.locked ? 'Разблокировать цвет' : 'Заблокировать цвет'
                "
            >
                {{ color.locked ? '🔒' : '🔓' }}
            </button>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { hexToRgb } from '../utils/colorUtils';

const props = defineProps({
    color: {
        type: Object,
        required: true,
    },
    displayFormat: {
        type: String,
        default: 'HEX',
    },
});

const emit = defineEmits(['copy', 'toggleLock']);

const rgbString = computed(() => {
    const rgb = hexToRgb(props.color.hex);
    return rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : props.color.hex;
});

const copyColor = () => {
    emit(
        'copy',
        props.displayFormat === 'HEX' ? props.color.hex : rgbString.value
    );
};

const toggleLock = () => {
    emit('toggleLock', props.color.id);
};
</script>

<style scoped>
.color-card {
    flex: 1;
    min-height: 200px;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    position: relative;
    cursor: pointer;
    transition: transform 0.2s;
}

.color-card:hover {
    transform: scale(1.05);
}

.color-info {
    width: 100%;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    text-align: center;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.color-code {
    font-family: monospace;
    font-size: 0.9rem;
    flex: 1;
    user-select: all;
}

.lock-button {
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: 1.2rem;
    padding: 0.25rem 0.5rem;
    opacity: 0.7;
    transition: opacity 0.2s;
}

.lock-button:hover {
    opacity: 1;
}

.lock-button.locked {
    opacity: 1;
}
</style>
