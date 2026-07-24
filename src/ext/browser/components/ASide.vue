<template>
  <aside
    class="flex flex-col h-full min-h-0 w-14 min-w-14 border-soft-900 bg-soft-50 shadow-inner dark:border-r dark:border-neutral-900 dark:bg-neutral-950 relative"
  >
    <div class="flex flex-col items-center pt-3 pb-2 shrink-0">
      <RiBookmarkFill class="size-8 fill-black text-black dark:fill-white dark:text-white" />
    </div>
    <div
      ref="indicatorRef"
      class="absolute left-1/2 size-10 rounded-md bg-gray-400/20 transition-transform duration-500 dark:bg-neutral-800 pointer-events-none z-10"
      :style="{ transform: `translate(-50%, ${indicatorTop}px)` }"
    />
    <ul class="flex-1 flex flex-col items-center justify-center gap-y-8 overflow-auto py-4 min-h-[60px] max-h-full relative z-10">
      <li
        v-for="(item, key) in items"
        :key="item.key"
        :ref="el => setMenuItemRef(el, item.name)"
      >
        <RouterLink
          :key="key"
          v-tooltip.right="{ content: item.tooltip }"
          :to="{ name: item.name }"
          class="relative"
          tabindex="0"
        >
          <component
            :is="item.icon"
            class="pointer-events-none size-6 text-black dark:text-white"
          />
        </RouterLink>
      </li>
    </ul>
    <div class="flex flex-col items-center gap-y-5 py-3 mt-auto shrink-0">
      <AppSettings
        v-tooltip.right="{ content: 'Settings' }"
      />
      <a
        v-tooltip.right="{ content: 'GitHub' }"
        href="https://github.com/dd3v/favbox"
        target="_blank"
        aria-label="GitHub repository"
      >
        <IconoirGithub class="size-4 text-soft-900 hover:text-black dark:text-white dark:hover:text-white" />
      </a>
    </div>
  </aside>
</template>
<script setup>
import {
  defineProps, ref, onMounted, onBeforeUnmount, reactive, watch, nextTick,
} from 'vue';
import { useRoute } from 'vue-router';

import AppSettings from '@/ext/browser/components/AppSettings.vue';
import RiBookmarkFill from '~icons/ri/bookmark-fill';
import IconoirGithub from '~icons/iconoir/github';

defineProps({
  items: {
    type: Array,
    required: true,
  },
});

const route = useRoute();
const indicatorRef = ref(null);
const indicatorTop = ref(0);
const menuItemsRef = reactive({});

const setMenuItemRef = (el, name) => {
  menuItemsRef[name] = el;
};

const updateIndicatorPosition = () => {
  const element = menuItemsRef[route.name];
  const container = indicatorRef.value?.parentElement;
  if (!element || !container) return;
  const containerRect = container.getBoundingClientRect();
  const targetRect = element.getBoundingClientRect();
  const center = (targetRect.top - containerRect.top) + targetRect.height / 2;
  indicatorTop.value = center - (indicatorRef.value.offsetHeight / 2);
};

onMounted(() => {
  window.addEventListener('resize', updateIndicatorPosition);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateIndicatorPosition);
});

watch(() => route.name, async () => {
  await nextTick();
  updateIndicatorPosition();
}, { immediate: true });
</script>
<style scoped>
aside {
  box-shadow: inset 0 2px 16px 0 rgba(60,60,60,0.14);
}
.dark aside {
  box-shadow: none;
}
</style>
