import { watchEffect } from 'vue';
import { useStorage, useColorMode } from '@vueuse/core';

export const FONT_SIZES = [
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
];

const SCALE_BY_SIZE = { sm: 0.9, md: 1, lg: 1.1 };

const BASE_REM = {
  '--text-xs': 0.75,
  '--text-sm': 0.875,
  '--text-base': 1,
  '--text-lg': 1.125,
  '--text-xl': 1.25,
  '--text-2xl': 1.5,
};

export const fontSize = useStorage('fontSize', 'md');
export const skipDeleteConfirmation = useStorage('skipBookmarkDeleteConfirmation', false);
export const mode = useColorMode({ modes: { light: '' }, emitAuto: true });

watchEffect(() => {
  const scale = SCALE_BY_SIZE[fontSize.value] ?? SCALE_BY_SIZE.md;
  Object.entries(BASE_REM).forEach(([name, rem]) => {
    document.documentElement.style.setProperty(name, `${(rem * scale).toFixed(4)}rem`);
  });
});
