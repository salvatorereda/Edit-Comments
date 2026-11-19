<!--
The Comments panel with one thread open: the "flyover" half of
CommentsPanel.vue (Back row, hero snapshot, comments, new-comment box), with
the edit-comment flow added. The whole flow is clickable from any start state:

  attach a photo → write → post → ⋮ → Edit comment → change it → Save changes
                                                        ↘ Cancel (→ Discard Changes? if edited)
-->
<template>
  <div :class="$style['panel']" data-testid="comment-thread-panel">
    <RightSidebarPanel :open="true" testId="comments" :title="$t('Comments')" :icon="CommentsIcon">
      <div :class="$style['comments-container']">
        <div :class="$style['comment-editor-header']">
          <div :class="$style['back-button-container']" data-testid="back-button">
            <RightSidebarIconButton
              :class="$style['back-button']"
              :selected="false"
              :svg="ChevronLeftIcon"
            />
            <span :class="$style['center-text']">{{ $t('Back') }}</span>
          </div>
        </div>

        <img
          :class="$style['thread-top-image']"
          :src="topic.snapshot"
          :alt="topic.text"
        />

        <ThreadComment
          :comment="topic"
          :isTopic="true"
          :canEdit="false"
          :editing="false"
          @react="(c) => react(topic, c)"
        />
        <ThreadComment
          v-for="reply in replies"
          :key="reply.id"
          :comment="reply"
          :isTopic="false"
          :canEdit="reply.author.id === CURRENT_USER.id"
          :editing="editingId === reply.id"
          :startDirty="props.start === 'editingWithChanges'"
          :openMenuOnMount="props.start === 'menuOpen' && reply.author.id === CURRENT_USER.id"
          @edit="startEditing(reply)"
          @delete="deleteReply(reply)"
          @save="(value) => saveEdit(reply, value)"
          @cancel="(dirty) => cancelEdit(dirty)"
          @react="(c) => react(reply, c)"
        />

        <!-- New-comment box. Hidden while a comment is being edited, as in Figma. -->
        <div
          v-if="editingId == null"
          ref="composer"
          :class="$style['comment-input-container']"
          @keydown.enter.capture="submitOnReturn"
        >
          <div v-if="draftImage != null" :class="$style['image-container']">
            <img
              :class="$style['image']"
              :src="draftImage"
              alt="Imported Image"
              data-testid="pending-comment-image"
            />
            <SkpIconButton
              :class="$style['delete-image-button']"
              :title="$t('Delete Photo')"
              :svg="DeleteIcon"
              data-testid="delete-image-button"
              @click="draftImage = null"
            />
          </div>
          <CommentTextArea
            :value="draftText"
            :class="$style['comment-input']"
            :showClearBtn="draftText.length > 0"
            :captureCameraEnabled="false"
            :forceCaptureCamera="false"
            :allowSubmit="draftText.length > 0 || draftImage != null"
            :hasPhoto="draftImage != null"
            :loading="false"
            @input="(value) => (draftText = value)"
            @addPhoto="draftImage = STOREFRONT_PHOTO"
            @toggleCamera="() => {}"
            @submitComment="postDraft"
          />
        </div>
      </div>
    </RightSidebarPanel>

    <SkpDialog
      v-if="confirmDiscard"
      :title="$t('Discard Changes?')"
      :skinny="true"
      :buttons="[
        { text: $t('Keep Editing'), emit: 'keep', type: 'secondary', testId: 'keep-editing-button' },
        { text: $t('Discard'), emit: 'discard', type: 'warning', testId: 'discard-button' },
      ]"
      @keep="confirmDiscard = false"
      @discard="discardEdit"
      @dialog-close="confirmDiscard = false"
    >
      {{ $t("Your changes to this comment won't be saved.") }}
    </SkpDialog>
  </div>
</template>

<script setup lang="ts">
import {
  ChevronLeftIcon,
  CommentsIcon,
  DeleteIcon,
} from '@resources/menu';
import { nextTick, provide, ref, watch } from 'vue';

import {
  CURRENT_USER,
  MAYA_POSTED_TEXT,
  MAYA_REPLY,
  MAYA_WRITTEN_TEXT,
  REPLIES,
  STOREFRONT_PHOTO,
  TOPIC,
} from './mockData';
import ThreadComment from './ThreadComment.vue';

import CommentTextArea from '@/components/Collaboration/CommentTextArea.vue';
import { RightSidebarIconButton } from '@/components/RightSidebarIconButtons';
import SkpDialog from '@/components/skpLibrary/SkpDialog.vue';
import SkpIconButton from '@/components/skpLibrary/SkpIconButton.vue';
import { $t } from '@/l10n';
import { TrimbleConnectProviderKey } from '@/models/CommentTypes';
import RightSidebarPanel from '@/views/modelScreen/rightSidebar/RightSidebarPanel.vue';

type StartState =
  | 'create'
  | 'photoAttached'
  | 'commentWritten'
  | 'posted'
  | 'menuOpen'
  | 'editing'
  | 'editingWithChanges'
  | 'discardPrompt'
  | 'saved';

interface PanelProps {
  start?: StartState;
}

const props = withDefaults(defineProps<PanelProps>(), {
  start: 'photoAttached',
});

// AvatarBubble (inside CommentContent) looks up photos through this provider
// whenever it gets a userId. No photos in the mock: initials only.
provide(TrimbleConnectProviderKey, {
  getUserAvatarUrl: async () => null,
} as never);

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

const posted = !['create', 'photoAttached', 'commentWritten'].includes(props.start);

const topic = ref(clone(TOPIC));
const replies = ref(posted ? [...clone(REPLIES), clone(MAYA_REPLY)] : clone(REPLIES));

const draftText = ref(props.start === 'commentWritten' ? MAYA_WRITTEN_TEXT : '');
const draftImage = ref<string | null>(
  props.start === 'photoAttached' || props.start === 'commentWritten' ? STOREFRONT_PHOTO : null
);

const editingId = ref<string | null>(
  ['editing', 'editingWithChanges', 'discardPrompt'].includes(props.start)
    ? MAYA_REPLY.id
    : null
);
const confirmDiscard = ref(props.start === 'discardPrompt');

if (props.start === 'posted') {
  const mine = replies.value[replies.value.length - 1];
  mine.text = MAYA_POSTED_TEXT;
}

if (props.start === 'saved') {
  const mine = replies.value[replies.value.length - 1];
  mine.text = '';
  mine.editedAt = '2026-08-23T09:42:00';
}

const composer = ref<HTMLElement | null>(null);

function labelReturnToSubmit(): void {
  const area = composer.value?.querySelector('textarea');
  if (area instanceof HTMLTextAreaElement) {
    area.placeholder = 'Press Return to submit your comment.';
  }
}

watch(composer, () => {
  void nextTick(labelReturnToSubmit);
});

function submitOnReturn(event: KeyboardEvent): void {
  if (event.shiftKey || event.isComposing || event.keyCode === 229) {
    return;
  }
  if (!(event.target instanceof HTMLTextAreaElement)) {
    return;
  }
  event.preventDefault();
  event.stopPropagation();
  if (draftText.value.length > 0 || draftImage.value != null) {
    postDraft();
  }
}

function postDraft(): void {
  replies.value.push({
    ...clone(MAYA_REPLY),
    id: `reply-${Date.now()}`,
    createdAt: new Date().toISOString(),
    text: draftText.value,
    image: draftImage.value,
  });
  draftText.value = '';
  draftImage.value = null;
}

function startEditing(reply: { id: string }): void {
  editingId.value = reply.id;
}

function saveEdit(
  reply: { text: string; image: string | null; editedAt?: string },
  value: { text: string; image: string | null }
): void {
  reply.text = value.text;
  reply.image = value.image;
  reply.editedAt = new Date().toISOString();
  editingId.value = null;
}

function cancelEdit(dirty: boolean): void {
  if (dirty) {
    confirmDiscard.value = true;
  } else {
    editingId.value = null;
  }
}

function discardEdit(): void {
  confirmDiscard.value = false;
  editingId.value = null;
}

function deleteReply(reply: { id: string }): void {
  replies.value = replies.value.filter((r) => r.id !== reply.id);
}

function react(
  comment: { reactions: { character: string; authorName: string }[] },
  character: string
): void {
  const index = comment.reactions.findIndex(
    (r) => r.character === character && r.authorName === CURRENT_USER.name
  );
  if (index >= 0) {
    comment.reactions.splice(index, 1);
  } else {
    comment.reactions.push({ character, authorName: CURRENT_USER.name });
  }
}
</script>

<style module lang="scss">
@use '@sass/color';

.panel {
  width: 320px;
  box-shadow: 2px 2px 5px 0px rgba(0, 0, 0, 0.2); // shadow_southeast
  background: color.$col_gray_light;
}

// From CommentsPanel.vue
.comments-container {
  font-size: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  user-select: text;
}

.comment-editor-header {
  display: flex;
  justify-content: space-between;
}

.back-button-container {
  display: flex;
  align-items: center;
  padding: 2px 10px 2px 0px;
  height: 32px;
  width: fit-content;

  .back-button {
    width: 32px;
    height: 32px;
  }

  .center-text {
    display: flex;
    flex-direction: column;
    justify-content: center;
    font-size: 14px;
    color: color.$col_blue_dark;
  }

  &:hover {
    background-color: color.$col_gray_0;
    cursor: pointer;
    border-radius: 8px;
  }
}

.thread-top-image {
  width: 296px;
  max-height: 166.5px;
  object-fit: contain;
}

.comment-input-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 296px;
  background: color.$col_white;
  border-radius: 8px;
  overflow: hidden;

  .comment-input {
    flex-grow: 1;
    flex-shrink: 1;
    min-height: 62px;
    height: auto;
    border: none;
  }
}

.image-container {
  position: relative;
  width: 296px;

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
    outline: none;
    background: #f6f6f6;
    cursor: pointer;
  }
}
</style>
