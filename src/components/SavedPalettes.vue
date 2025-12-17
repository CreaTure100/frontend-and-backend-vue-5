<template>
    <div class="saved-palettes">
        <h3>Сохранённые палитры</h3>

        <div class="save-section">
            <input
                v-model="paletteName"
                type="text"
                placeholder="Название палитры..."
                @keyup.enter="savePalette"
            />
            <input
                v-model="paletteTags"
                type="text"
                placeholder="Теги (через запятую)..."
            />
            <button @click="savePalette" class="save-button">
                Сохранить текущую палитру
            </button>
        </div>

        <div class="search-section">
            <input
                v-model="searchQuery"
                type="text"
                placeholder="Поиск палитр..."
            />
        </div>

        <div class="palettes-list">
            <div
                v-for="palette in filteredPalettes"
                :key="palette.id"
                class="palette-item"
                :class="{ favorite: palette.favorite }"
            >
                <div class="palette-colors">
                    <div
                        v-for="color in palette.colors"
                        :key="color.id"
                        class="mini-color"
                        :style="{ backgroundColor: color.hex }"
                    ></div>
                </div>

                <div class="palette-info" v-if="editingId !== palette.id">
                    <h4>{{ palette.name }}</h4>
                    <div
                        class="palette-tags"
                        v-if="palette.tags && palette.tags.length"
                    >
                        <span
                            v-for="tag in palette.tags"
                            :key="tag"
                            class="tag"
                            >{{ tag }}</span
                        >
                    </div>
                </div>

                <div class="palette-info edit-mode" v-else>
                    <input
                        v-model="editName"
                        type="text"
                        class="edit-input"
                        placeholder="Название палитры"
                    />
                    <input
                        v-model="editTags"
                        type="text"
                        class="edit-input"
                        placeholder="Теги (через запятую)"
                    />
                </div>

                <div class="palette-actions" v-if="editingId !== palette.id">
                    <button
                        @click="toggleFavorite(palette.id)"
                        class="action-button"
                        title="Отметить как избранное"
                    >
                        {{ palette.favorite ? 'Избранное' : 'Отметить' }}
                    </button>
                    <button
                        @click="loadPalette(palette)"
                        class="action-button"
                        title="Загрузить палитру"
                    >
                        Загрузить
                    </button>
                    <button
                        @click="startEdit(palette)"
                        class="action-button"
                        title="Редактировать"
                    >
                        Редактировать
                    </button>
                    <button
                        @click="deletePalette(palette.id)"
                        class="action-button delete"
                        title="Удалить палитру"
                    >
                        Удалить
                    </button>
                </div>

                <div class="palette-actions edit-actions" v-else>
                    <button
                        @click="applyEdit(palette.id)"
                        class="action-button primary"
                        title="Сохранить изменения"
                    >
                        Сохранить
                    </button>
                    <button
                        @click="applyColors(palette.id)"
                        class="action-button"
                        title="Обновить цвета текущей палитрой"
                    >
                        Обновить цветами
                    </button>
                    <button
                        @click="cancelEdit"
                        class="action-button"
                        title="Отмена"
                    >
                        Отмена
                    </button>
                </div>
            </div>

            <div v-if="filteredPalettes.length === 0" class="empty-state">
                <p>Сохранённых палитр нет.</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
    currentColors: {
        type: Array,
        required: true,
    },
});

const emit = defineEmits(['load', 'notify']);

const paletteName = ref('');
const paletteTags = ref('');
const searchQuery = ref('');
const savedPalettes = ref([]);

const editingId = ref(null);
const editName = ref('');
const editTags = ref('');

// Load saved palettes from localStorage on mount
const loadSavedPalettes = () => {
    const saved = localStorage.getItem('savedPalettes');
    if (saved) {
        try {
            savedPalettes.value = JSON.parse(saved);
        } catch (e) {
            console.error('Failed to load saved palettes:', e);
        }
    }
};

loadSavedPalettes();

const filteredPalettes = computed(() => {
    if (!searchQuery.value) {
        return savedPalettes.value;
    }

    const query = searchQuery.value.toLowerCase();
    return savedPalettes.value.filter((palette) => {
        const nameMatch = palette.name.toLowerCase().includes(query);
        const tagsMatch =
            palette.tags &&
            palette.tags.some((tag) => tag.toLowerCase().includes(query));
        return nameMatch || tagsMatch;
    });
});

const persist = () => {
    localStorage.setItem('savedPalettes', JSON.stringify(savedPalettes.value));
};

const savePalette = () => {
    if (!paletteName.value.trim()) {
        emit('notify', 'Введите название палитры');
        return;
    }

    const tags = paletteTags.value
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag);

    const newPalette = {
        id: Date.now(),
        name: paletteName.value.trim(),
        tags,
        colors: JSON.parse(JSON.stringify(props.currentColors)),
        createdAt: new Date().toISOString(),
        favorite: false,
    };

    savedPalettes.value.unshift(newPalette);
    persist();

    paletteName.value = '';
    paletteTags.value = '';

    emit('notify', 'Палитра сохранена!');
};

const loadPalette = (palette) => {
    emit('load', palette.colors);
    emit('notify', `Загружена палитра: ${palette.name}`);
};

const deletePalette = (id) => {
    if (confirm('Вы уверены, что хотите удалить эту палитру?')) {
        savedPalettes.value = savedPalettes.value.filter((p) => p.id !== id);
        persist();
        emit('notify', 'Палитра удалена');
        if (editingId.value === id) {
            cancelEdit();
        }
    }
};

const toggleFavorite = (id) => {
    const palette = savedPalettes.value.find((p) => p.id === id);
    if (palette) {
        palette.favorite = !palette.favorite;
        persist();
    }
};

const startEdit = (palette) => {
    editingId.value = palette.id;
    editName.value = palette.name;
    editTags.value = (palette.tags || []).join(', ');
};

const cancelEdit = () => {
    editingId.value = null;
    editName.value = '';
    editTags.value = '';
};

const applyEdit = (id) => {
    const palette = savedPalettes.value.find((p) => p.id === id);
    if (!palette) return;

    const name = editName.value.trim();
    const tags = editTags.value
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t);

    if (name) palette.name = name;
    palette.tags = tags;

    persist();
    emit('notify', 'Палитра обновлена');
    cancelEdit();
};

const applyColors = (id) => {
    const palette = savedPalettes.value.find((p) => p.id === id);
    if (!palette) return;
    palette.colors = JSON.parse(JSON.stringify(props.currentColors));
    persist();
    emit('notify', 'Цвета обновлены из текущей палитры');
};
</script>

<style scoped>
.saved-palettes {
    padding: 1.5rem;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    background: white;
}

.saved-palettes h3 {
    margin-top: 0;
    margin-bottom: 1rem;
}

.save-section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
}

.save-section input {
    padding: 0.5rem;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 0.9rem;
}

.save-button {
    padding: 0.75rem;
    background: #28a745;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    transition: background 0.2s;
}

.save-button:hover {
    background: #218838;
}

.search-section {
    margin-bottom: 1rem;
}

.search-section input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 0.9rem;
}

.palettes-list {
    max-height: 400px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.palette-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem;
    border: 2px solid #dee2e6;
    border-radius: 8px;
    transition: border-color 0.2s;
}

.palette-item:hover {
    border-color: #007bff;
}

.palette-item.favorite {
    border-color: #ffc107;
    background: #fffbf0;
}

.palette-colors {
    display: flex;
    gap: 2px;
    min-width: 100px;
}

.mini-color {
    width: 20px;
    height: 40px;
    border-radius: 2px;
}

.palette-info {
    flex: 1;
}

.palette-info h4 {
    margin: 0 0 0.25rem 0;
    font-size: 1rem;
}

.palette-tags {
    display: flex;
    gap: 0.25rem;
    flex-wrap: wrap;
}

.tag {
    padding: 0.125rem 0.5rem;
    background: #e9ecef;
    border-radius: 12px;
    font-size: 0.75rem;
    color: #495057;
}

.palette-actions {
    display: flex;
    gap: 0.25rem;
}

.action-button {
    background: transparent;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    padding: 0.25rem 0.5rem;
    cursor: pointer;
    font-size: 1rem;
    transition: background 0.2s;
}

.action-button:hover {
    background: #f8f9fa;
}

.action-button.delete:hover {
    background: #f8d7da;
    border-color: #dc3545;
}

.action-button.primary {
    border-color: #007bff;
    color: #007bff;
}

.action-button.primary:hover {
    background: #e7f0ff;
}

.edit-mode {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
}

.edit-input {
    padding: 0.45rem 0.6rem;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 0.9rem;
}

.edit-actions {
    display: flex;
    gap: 0.35rem;
}

.empty-state {
    text-align: center;
    padding: 2rem;
    color: #6c757d;
}

.empty-state p {
    margin: 0;
}
</style>