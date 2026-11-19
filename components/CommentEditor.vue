<!--
Edit mode for a posted comment (Figma "Edit comment mode 2"). The comment is
replaced in place by an editor holding its photo and text. The text box, clear
button, + menu and emoji button are the same as CommentTextArea.vue; the send
button is swapped for Cancel / Save changes.

New behavior (not in source yet):
- Save changes is disabled until something changed, and when the edit would
  leave the comment with neither text nor a photo.
- Return saves (same key that submits a new comment), Esc cancels.
-->
<template>
  <div
    :class="[$style['editor'], { [$style['active']]: isActive }]"
    data-testid="comment-editor"
    @keydown.esc.stop="emit('cancel', isDirty)"
  >
    <div v-if="image != null" :class="$style['image-container']">
      <img
        :class="$style['image']"
        :src="image"
        alt="Comment photo"
        data-testid="editing-comment-image"
      />
      <SkpIconButton
        :class="$style['delete-image-button']"
        :title="$t('Remove photo')"
        :svg="DeleteIcon"
        data-testid="remove-photo-button"
        @click="image = null"
      />
    </div>

    <div :class="$style['text-container']">
      <div ref="growWrap" :class="$style['grow-wrap']">
        <textarea
          :id="textAreaId"
          ref="textArea"
          :value="text"
          :class="$style['text-area']"
          :placeholder="$t('Your comment goes here')"
          data-testid="edit-comment-text"
          @input="onInput"
          @keydown.enter="checkSave"
        />
      </div>
      <button
        v-if="text !== ''"
        :class="$style['clear-btn']"
        :title="$t('Clear')"
        @click="setText('')"
      >
        <SkpSvg :svg="CancelSmallIcon" />
      </button>
    </div>

    <div :class="$style['bottom-row']">
      <SkpKebab
        :class="$style['overflow-menu']"
        :useSlot="true"
        :options="addOptions"
        @selected="handleAddOption"
      >
        <RightSidebarIconButton
          :svg="AddIcon"
          :class="[$style['overflow-button'], $style['bottom-row-button']]"
          data-testid="edit-comment-options-button"
        />
      </SkpKebab>
      <RightSidebarIconButton
        ref="emojiButton"
        :svg="SmileIcon"
        :class="$style['bottom-row-button']"
        data-testid="edit-comment-emoji-button"
        @click="emojiPickerOpen = !emojiPickerOpen"
      />
      <div :class="$style['actions']">
        <SkpButton
          type="secondary"
          :class="$style['action-button']"
          dataTestId="cancel-edit-button"
          @click="emit('cancel', isDirty)"
        >
          {{ $t('Cancel') }}
        </SkpButton>
        <SkpButton
          type="primary"
          :class="$style['action-button']"
          :disabled="!canSave"
          dataTestId="save-edit-button"
          @click="save"
        >
          {{ $t('Save changes') }}
        </SkpButton>
      </div>
    </div>

    <SkpEmojiPicker
      ref="emojiPickerContainer"
      :class="$style['emoji-picker-container']"
      :open="emojiPickerOpen"
      :parentBounds="emojiButtonBounds"
      @emojiPicked="insertEmoji"
    />
  </div>
</template>

<script setup lang="ts">
import {
  AddIcon,
  CancelSmallIcon,
  DeleteIcon,
  SmileIcon,
} from '@resources/menu';
import { ImageIcon } from '@resources/rightsidebar';
import {
  onClickOutside,
  useActiveElement,
  useElementBounding,
} from '@vueuse/core';
import { computed, nextTick, onMounted, ref } from 'vue';

import { STOREFRONT_PHOTO } from './mockData';

import { RightSidebarIconButton } from '@/components/RightSidebarIconButtons';
import SkpButton from '@/components/skpLibrary/SkpButton.vue';
import SkpEmojiPicker from '@/components/skpLibrary/SkpEmojiPicker.vue';
import SkpIconButton from '@/components/skpLibrary/SkpIconButton.vue';
import SkpKebab from '@/components/skpLibrary/SkpKebab.vue';
import SkpSvg from '@/components/skpLibrary/SkpSvg.vue';
import { $t } from '@/l10n';

interface CommentEditorProps {
  initialText: string;
  initialImage: string | null;
  // Story-only: start with the text already changed.
  startDirty?: boolean;
}

const props = withDefaults(defineProps<CommentEditorProps>(), {
  startDirty: false,
});

type CommentEditorEmits = {
  (e: 'save', value: { text: string; image: string | null }): void;
  (e: 'cancel', dirty: boolean): void;
};

const emit = defineEmits<CommentEditorEmits>();

const text = ref(
  props.startDirty
    ? props.initialText.replace('some lighting', 'some exterior lighting')
    : props.initialText
);
const image = ref<string | null>(props.initialImage);

const isDirty = computed(
  () => text.value !== props.initialText || image.value !== props.initialImage
);
const canSave = computed(
  () => isDirty.value && (text.value.trim() !== '' || image.value != null)
);

const textAreaId = `edit-comment-${Math.random().toString(36).slice(2)}`;
const textArea = ref<HTMLTextAreaElement | null>(null);
const growWrap = ref<HTMLDivElement | null>(null);

function setText(value: string): void {
  text.value = value;
  // Same auto-grow trick as CommentTextArea.vue.
  if (growWrap.value != null) {
    growWrap.value.dataset.replicatedValue = value;
  }
  emojiButtonBounds.update();
}

function onInput(event: Event): void {
  setText((event.target as HTMLTextAreaElement).value);
}

function save(): void {
  if (canSave.value) {
    emit('save', { text: text.value, image: image.value });
  }
}

function checkSave(event: KeyboardEvent): void {
  if (event.shiftKey || event.isComposing || event.keyCode === 229) {
    return;
  }
  event.preventDefault();
  save();
}

// The + menu: the same Add / Update Photo item the new-comment box has.
const addOptions = computed(() => [
  {
    label: image.value != null ? $t('Update Photo') : $t('Add Photo'),
    eventId: 'addPhoto',
    svg: ImageIcon,
  },
]);

function handleAddOption(): void {
  // The real flow opens ImportImageDialog; the mock attaches the sample photo.
  image.value = STOREFRONT_PHOTO;
}

// Emoji picker, wired like CommentTextArea.vue.
const emojiButton = ref<Vue | null>(null);
const emojiPickerContainer = ref<Vue | null>(null);
const emojiPickerOpen = ref(false);
const emojiButtonElement = computed(
  () => emojiButton.value?.$el as HTMLElement | undefined
);
const emojiPickerContainerElement = computed(
  () => emojiPickerContainer.value?.$el as HTMLElement | undefined
);
const emojiButtonBounds = useElementBounding(emojiButtonElement);

function insertEmoji(emoji: string): void {
  const el = textArea.value;
  if (el == null) {
    return;
  }
  el.setRangeText(emoji);
  const start = el.selectionStart;
  setText(el.value);
  el.focus();
  el.setSelectionRange(start + emoji.length, start + emoji.length);
}

onClickOutside(
  emojiPickerContainerElement,
  () => {
    emojiPickerOpen.value = false;
  },
  { ignore: [emojiButtonElement] }
);

const activeElement = useActiveElement();
const isActive = computed(
  () => activeElement.value?.id === textAreaId || emojiPickerOpen.value
);

// Entering edit mode puts the caret at the end of the text, ready to type.
onMounted(async () => {
  setText(text.value);
  await nextTick();
  const el = textArea.value;
  if (el != null) {
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
  }
});
</script>

<style module lang="scss">
@use '@sass/color';

.editor {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  padding-bottom: 6px;

  background-color: color.$col_white;
  border: 1px solid color.$col_blue_light;
  border-radius: 8px;
  overflow: hidden;

  font-family: 'Open Sans', sans-serif;
  font-size: 12px;

  button,
  textarea {
    font-family: 'Open Sans', sans-serif;
  }

  &.active {
    border-width: 2px;
  }
}

.image-container {
  // nearest positioned ancestor for the delete button, as in CommentsPanel.vue
  position: relative;
  width: 100%;

  .image {
    display: block;
    width: 100%;
  }

  .delete-image-button {
    display: flex;
    align-items: center;
    position: absolute;
    top: 6px;
    right: 8px;
    width: 24px;
    height: 24px;
    border: none;
    border-radius: 4px;
    background: #f6f6f6;
    cursor: pointer;
  }
}

.text-container {
  display: flex;
  justify-content: space-between;
  padding: 0 4px 0 0;
}

// Auto-growing textarea, same technique as CommentTextArea.vue.
.grow-wrap {
  display: grid;
  // minmax(0, 1fr) + min-width: 0 let long URLs wrap instead of widening the box
  grid-template-columns: minmax(0, 1fr);
  min-width: 0;
  flex-grow: 1;
  padding: 4px 0;
  margin-left: 12px;

  > textarea {
    resize: none;
    overflow: hidden;
  }

  &::after {
    white-space: pre-wrap;
    visibility: hidden;
  }

  > textarea,
  &::after {
    border: none;
    outline: none;
    padding: 0;
    width: 100%;
    box-sizing: border-box;
    overflow-wrap: anywhere;
    content: attr(data-replicated-value) ' ';
    font: inherit;
    font-size: 12px;
    line-height: 17px;
    color: color.$col_typography_body;
    grid-area: 1 / 1 / 2 / 2;
  }

  .text-area::placeholder {
    color: color.$col_gray_2;
    opacity: 1;
  }
}

.clear-btn {
  display: flex;
  align-items: flex-start;
  border: none;
  outline: none;
  background: none;
  padding: 0;
  cursor: pointer;

  > svg {
    width: 32px;
    height: 32px;
    margin: 0;
  }
}

.bottom-row {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 8px;
}

.bottom-row-button {
  width: 24px;
  height: 24px;
  padding: 2px;
  cursor: pointer;
}

.overflow-menu {
  width: 28px;
  height: 28px;
}

.overflow-button {
  border-radius: 8px;

  &:hover {
    background-color: color.$col_gray_0;
  }
}

.actions {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

// SkpButton is sized for dialogs (48px, min-width 180px). Figma's in-panel
// buttons are 28px tall and fit their label.
.action-button {
  height: 28px !important;
  min-width: 0 !important;
  padding: 0 12px !important;
  line-height: 26px !important;
  font-size: 12px !important;
  font-weight: 600 !important;
  border-radius: 4px !important;

  &:disabled {
    cursor: default;
    opacity: 0.4;
  }
}

.emoji-picker-container {
  width: 0;
  height: 0;

  emoji-picker {
    position: fixed;
    --emoji-font-family: 'Apple Color Emoji';
  }
}
</style>
