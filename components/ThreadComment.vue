<!--
One comment in an open thread. Mirrors CommentDetailsView.vue (same real
CommentContent, action buttons, kebab, reactions and layout), with two
changes for the edit-comment flow:

- The kebab gets "Edit comment" next to "Delete comment", for the same
  people who can delete (the author of a reply; never on the parent topic).
- While editing, the comment is replaced in place by CommentEditor.
- An edited comment shows "Edited" after its timestamp.
-->
<template>
  <CommentEditor
    v-if="props.editing"
    :initialText="props.comment.text"
    :initialImage="props.comment.image"
    :startDirty="props.startDirty"
    @save="(value) => emit('save', value)"
    @cancel="(dirty) => emit('cancel', dirty)"
  />
  <div
    v-else
    :class="$style['comment-display']"
    data-testid="comment-details"
  >
    <div :class="$style['comment-container']">
      <CommentContent
        :authorName="props.comment.author.name"
        :authorId="props.comment.author.id"
        :initials="initials"
        :timestamp="timestamp"
        :mainColor="props.comment.author.mainColor"
        :outlineColor="props.comment.author.outlineColor"
        :commentText="props.comment.image ? '' : props.comment.text"
      >
        <div :class="$style['actions-group']">
          <RightSidebarIconButton
            :class="$style['action-button']"
            :title="$t('Fly to location')"
            :svg="CommentLocationIcon"
          />
          <RightSidebarIconButton
            ref="addReactionButton"
            :class="$style['action-button']"
            :title="$t('Add Reaction')"
            :svg="ThumbsUpIcon"
            @click="emojiPickerOpen = !emojiPickerOpen"
          />
          <SkpEmojiPicker
            ref="emojiPickerContainer"
            :class="$style['emoji-picker-container']"
            :parentBounds="addReactionButtonBounds"
            :open="emojiPickerOpen"
            @emojiPicked="addReaction"
          />
          <SkpKebab
            v-if="kebabOptions.length > 0"
            ref="kebab"
            :class="$style['action-button']"
            :options="kebabOptions"
            menuAlignment="right"
            data-testid="comment-kebab"
            @selected="handleKebabItemSelected"
          />
          <div v-else :class="$style['action-button-placeholder']"></div>
        </div>
      </CommentContent>
      <div v-if="props.comment.image != null" :class="$style['image-container']">
        <img
          :class="$style['image']"
          :src="props.comment.image"
          alt="Comment photo"
          data-testid="comment-photo"
        />
      </div>
      <p
        v-if="props.comment.image && props.comment.text"
        :class="$style['photo-caption']"
        data-testid="comment-photo-caption"
      >
        {{ props.comment.text }}
      </p>
      <div :class="$style['reactions']">
        <span
          v-for="(info, character) in reactionCounts"
          :key="character"
          :class="$style['reaction']"
          :title="info.authors.join('\n')"
          @click="addReaction(character)"
        >
          {{ character }}
          <div v-if="info.count > 1" :class="$style['count']">
            {{ info.count }}
          </div>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CommentLocationIcon } from '@resources/menu';
import { ThumbsUpIcon } from '@resources/rightsidebar';
// SkpKebab draws its icon from the "#overflow_menu" sprite, which the app
// registers globally at startup. Importing it registers it here.
import '@resources/old/overflow_menu.svg';
import { onClickOutside, useElementBounding } from '@vueuse/core';
import { computed, nextTick, onMounted, ref, useCssModule } from 'vue';

import CommentEditor from './CommentEditor.vue';

import CommentContent from '@/components/Collaboration/CommentContent.vue';
import { RightSidebarIconButton } from '@/components/RightSidebarIconButtons';
import SkpEmojiPicker from '@/components/skpLibrary/SkpEmojiPicker.vue';
import SkpKebab from '@/components/skpLibrary/SkpKebab.vue';
import { $t } from '@/l10n';

interface MockComment {
  id: string;
  author: { id: string; name: string; mainColor: string; outlineColor: string };
  createdAt: string;
  editedAt?: string;
  text: string;
  image: string | null;
  reactions: { character: string; authorName: string }[];
}

interface ThreadCommentProps {
  comment: MockComment;
  isTopic: boolean;
  canEdit: boolean;
  editing: boolean;
  // Story-only helpers to land on a given Figma frame.
  startDirty?: boolean;
  openMenuOnMount?: boolean;
}

const props = withDefaults(defineProps<ThreadCommentProps>(), {
  startDirty: false,
  openMenuOnMount: false,
});

type ThreadCommentEmits = {
  (e: 'edit'): void;
  (e: 'delete'): void;
  (e: 'save', value: { text: string; image: string | null }): void;
  (e: 'cancel', dirty: boolean): void;
  (e: 'react', character: string): void;
};

const emit = defineEmits<ThreadCommentEmits>();

const componentStyle = useCssModule();

const initials = computed(() =>
  props.comment.author.name
    .split(' ')
    .map((name) => name[0])
    .join('')
);

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    day: '2-digit',
    month: 'short',
    hour: 'numeric',
    minute: 'numeric',
  });
}

const timestamp = computed(() => {
  const created = formatTime(props.comment.createdAt);
  return props.comment.editedAt != null
    ? `${created} · ${$t('Edited')}`
    : created;
});

const reactionCounts = computed(() =>
  props.comment.reactions.reduce(
    (counts: Record<string, { count: number; authors: string[] }>, r) => {
      counts[r.character] ??= { count: 0, authors: [] };
      counts[r.character].count++;
      counts[r.character].authors.push(r.authorName);
      return counts;
    },
    {}
  )
);

// Edit sits above Delete in the flyout.
const kebabOptions = computed(() => {
  if (props.isTopic || !props.canEdit) {
    return [];
  }
  return [
    {
      label: $t('Edit comment'),
      eventId: 'edit',
      testId: 'edit-comment-option',
    },
    {
      label: $t('Delete comment'),
      eventId: 'delete',
      className: componentStyle['list-item-delete'],
      testId: 'delete-comment-option',
    },
  ];
});

function handleKebabItemSelected(eventId: 'delete' | 'edit'): void {
  if (eventId === 'edit') {
    emit('edit');
  } else {
    emit('delete');
  }
}

const addReactionButton = ref<Vue | null>(null);
const emojiPickerContainer = ref<Vue | null>(null);
const emojiPickerOpen = ref(false);
const addReactionButtonElement = computed(
  () => addReactionButton.value?.$el as HTMLElement | undefined
);
const addReactionButtonBounds = useElementBounding(addReactionButtonElement);

function addReaction(character: string): void {
  emit('react', character);
  emojiPickerOpen.value = false;
}

onClickOutside(
  computed(() => emojiPickerContainer.value?.$el as HTMLElement | undefined),
  () => {
    emojiPickerOpen.value = false;
  },
  { ignore: [addReactionButtonElement] }
);

const kebab = ref<Vue | null>(null);

onMounted(async () => {
  if (props.openMenuOnMount) {
    await nextTick();
    // The kebab icon is an SVG (no .click()), so dispatch the event instead.
    kebab.value?.$el.firstElementChild?.dispatchEvent(
      new MouseEvent('click', { bubbles: true })
    );
  }
});
</script>

<style module lang="scss">
@use '@sass/color';

.comment-display {
  display: flex;
  justify-content: space-between;

  .actions-group {
    display: flex;
    justify-content: flex-end;
    align-items: flex-start;
    gap: 2px;
  }

  // override span styles from CommentContent.vue (no 2-line clamp in a thread)
  span {
    display: inline-block;
  }

  .comment-container {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .reactions {
    margin-top: 8px;
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    position: relative;
    padding: 2px 0 0 32px;

    &:empty {
      display: none;
    }

    .reaction {
      display: flex;
      flex-direction: column;
      justify-content: center;
      position: relative;
      cursor: pointer;
      user-select: none;
      padding: 6px 10px;
      border: 1px solid color.$col_gray_1;
      border-radius: 4px;
      font-size: 20px;

      .count {
        position: absolute;
        top: -6px;
        right: -6px;
        width: 12px;
        height: 12px;
        border-radius: 6px;
        background-color: color.$col_blue_electric;
        text-align: center;
        user-select: none;
        color: color.$col_white;
        font-size: 8px;
        font-family: 'Open Sans', sans-serif;
        font-weight: 600;
      }

      &:hover {
        background: color.$col_gray_0;
      }
    }
  }

  .action-button {
    width: 32px;
    height: 32px;
    cursor: pointer;
  }

  .action-button-placeholder {
    width: 32px;
    height: 32px;
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

.photo-caption {
  margin: 0;
  padding: 0 8px 0 40px;
  font-family: 'Open Sans', sans-serif;
  font-size: 13px;
  line-height: 18px;
}

.image-container {
  display: flex;
  justify-content: center;
  padding: 8px 4px 4px 4px;
  width: 100%;
  box-sizing: border-box;

  .image {
    max-height: 166.5px;
    width: 100%;
    object-fit: contain;
  }
}

.list-item-delete:hover {
  background-color: color.$col_sketchup_red;
  color: color.$col_white;
}
</style>
