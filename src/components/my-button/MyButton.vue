<template>
  <button class="my-button">
    <span class="my-button__label" v-text="label" />
    <span class="test-label">{{ label }}</span>
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'MyButton',
  props: {
    label: String,
  },
});
</script>