<template>
  <div ref="scroll">
    <slot />
  </div>
</template>
<script setup>
import { onMounted, onBeforeUnmount, useTemplateRef } from 'vue';

const emit = defineEmits(['scroll:end']);
const scrollRef = useTemplateRef('scroll');
let lastScrollTop = 0;

const scrollUp = () => {
  scrollRef.value.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
};

const throttle = (func, limit) => {
  let inThrottle = false;
  return (...args) => {
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

const onScroll = () => {
  const el = scrollRef.value;
  const currentScrollTop = el.scrollTop;
  const isScrollingDown = currentScrollTop > lastScrollTop;
  lastScrollTop = currentScrollTop;
  if (!isScrollingDown) return;
  if (Math.round(el.offsetHeight + currentScrollTop) >= el.scrollHeight * 0.75) {
    emit('scroll:end');
  }
};

const throttledScroll = throttle(onScroll, 200);

onMounted(() => scrollRef.value.addEventListener('scroll', throttledScroll));
onBeforeUnmount(() => { scrollRef.value?.removeEventListener('scroll', throttledScroll); });

defineExpose({ scrollRef, scrollUp });
</script>
