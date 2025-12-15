<template>
  <Transition name="notification">
    <div v-if="show" class="notification" :class="type">
      {{ message }}
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  message: {
    type: String,
    default: ''
  },
  duration: {
    type: Number,
    default: 2000
  },
  type: {
    type: String,
    default: 'success'
  }
});

const show = ref(false);

watch(() => props.message, (newMessage) => {
  if (newMessage) {
    show.value = true;
    setTimeout(() => {
      show.value = false;
    }, props.duration);
  }
});
</script>

<style scoped>
.notification {
  position: fixed;
  top: 2rem;
  right: 2rem;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  background: #28a745;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  font-weight: 500;
}

.notification.error {
  background: #dc3545;
}

.notification.info {
  background: #17a2b8;
}

.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.notification-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>
