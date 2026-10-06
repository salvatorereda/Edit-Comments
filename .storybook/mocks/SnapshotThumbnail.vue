<!--
Stand-in for src/views/commentsPanel/SnapshotThumbnail.vue. The real one
fetches the hi-res image through the Trimble Connect provider and opens its
error dialog through DialogPrompts, which imports most of the app. This keeps
the same markup and style; snapshotUrl is used directly.
-->
<template>
  <div>
    <img
      v-if="image != null"
      :src="image"
      :alt="props.description"
      :class="$style['image']"
    />
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';

import type { ViewpointSnapshot } from '@/models/CommentTypes';

interface SnapshotThumbnailProps {
  snapshot: ViewpointSnapshot;
  description?: string;
}

const props = defineProps<SnapshotThumbnailProps>();

const image = computed(
  () =>
    props.snapshot.snapshotUrl ??
    `data:image/${props.snapshot.snapshotType};base64,${props.snapshot.snapshotData}`
);
</script>
<style module lang="scss">
.image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  max-height: inherit;
  cursor: pointer;
}
</style>
