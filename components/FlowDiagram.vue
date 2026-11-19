<!--
The edit-comment flow as a diagram. Each step opens its story (addon-links).
Solid steps are in the Figma mocks; dashed steps are proposed here.
-->
<template>
  <div :class="$style['wrapper']">
    <svg
      :class="$style['diagram']"
      viewBox="0 0 760 800"
      role="img"
      aria-label="Edit comment flow"
    >
      <defs>
        <marker
          id="arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L10,5 L0,10 z" :class="$style['arrowhead']" />
        </marker>
      </defs>

      <!-- Edges -->
      <g v-for="edge in edges" :key="edge.id">
        <path
          :d="edge.d"
          :class="[$style['edge'], { [$style['proposed-edge']]: edge.proposed }]"
          marker-end="url(#arrow)"
        />
        <text
          :x="edge.lx"
          :y="edge.ly"
          :text-anchor="edge.anchor"
          :transform="edge.rotate ? `rotate(-90 ${edge.lx} ${edge.ly})` : null"
          :class="$style['edge-label']"
        >
          {{ edge.label }}
        </text>
      </g>

      <!-- Steps -->
      <g
        v-for="node in nodes"
        :key="node.id"
        :class="[$style['node'], $style[node.kind], { [$style['linked']]: node.story }]"
        :tabindex="node.story ? 0 : null"
        :role="node.story ? 'link' : null"
        @click="open(node)"
        @keydown.enter="open(node)"
      >
        <title>{{ node.story ? `Open story: ${node.story}` : node.title }}</title>
        <rect :x="node.x" :y="node.y" width="280" height="60" rx="6" />
        <text :x="node.x + 14" :y="node.y + 24" :class="$style['node-title']">
          {{ node.title }}
        </text>
        <text :x="node.x + 14" :y="node.y + 44" :class="$style['node-sub']">
          {{ node.sub }}
        </text>
        <text
          :x="node.x + 268"
          :y="node.y + 24"
          text-anchor="end"
          :class="$style['node-tag']"
        >
          {{ node.tag }}
        </text>
      </g>
    </svg>

    <div :class="$style['legend']">
      <span><i :class="[$style['swatch'], $style['figma']]"></i>In the Figma mocks</span>
      <span><i :class="[$style['swatch'], $style['proposed']]"></i>Proposed, not in Figma yet</span>
      <span><i :class="[$style['swatch'], $style['today']]"></i>Works this way today</span>
      <span>Click a step to open its story.</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { linkTo } from '@storybook/addon-links';

const KIND = 'Edit Comment/Thread';

interface FlowNode {
  id: string;
  x: number;
  y: number;
  title: string;
  sub: string;
  tag: string;
  kind: 'figma' | 'proposed' | 'today';
  story?: string;
}

const L = 40; // left column
const R = 440; // right column

const nodes: FlowNode[] = [
  { id: 'photo', x: L, y: 20, title: '1 · Photo attached', sub: 'New-comment box: photo, no text yet', tag: 'Figma', kind: 'figma', story: '1. Photo attached' },
  { id: 'written', x: L, y: 130, title: '2 · Comment written', sub: 'Text, emoji and a link added', tag: 'Figma', kind: 'figma', story: '2. Comment written' },
  { id: 'posted', x: L, y: 240, title: '3 · Comment posted', sub: 'Your reply has a menu; others’ don’t', tag: 'Figma', kind: 'figma', story: '3. Comment posted' },
  { id: 'menu', x: L, y: 350, title: '4 · Comment menu', sub: 'Edit comment · Delete comment', tag: 'Figma', kind: 'figma', story: '4. Comment menu open' },
  { id: 'deleted', x: R, y: 350, title: 'Comment deleted', sub: 'Unchanged from today', tag: 'Today', kind: 'today' },
  { id: 'editing', x: L, y: 470, title: '5 · Editing', sub: 'Editor in place; new-comment box hides', tag: 'Figma', kind: 'figma', story: '5. Editing' },
  { id: 'dirty', x: L, y: 580, title: '6 · Unsaved changes', sub: 'Save changes turns on', tag: 'Proposed', kind: 'proposed', story: '6. Editing with unsaved changes' },
  { id: 'discard', x: R, y: 580, title: '7 · Discard Changes?', sub: 'Keep Editing · Discard', tag: 'Proposed', kind: 'proposed', story: '7. Discard Changes? prompt' },
  { id: 'saved', x: L, y: 700, title: '8 · Saved', sub: 'Updated in place, marked “Edited”', tag: 'Proposed', kind: 'proposed', story: '8. Saved and marked Edited' },
];

const C = L + 140; // main column center

const edges = ([
  { id: 'a-b', d: `M${C},80 V128`, label: 'Type a comment', lx: C + 8, ly: 108 },
  { id: 'b-c', d: `M${C},190 V238`, label: 'Send (or Return)', lx: C + 8, ly: 218 },
  { id: 'c-d', d: `M${C},300 V348`, label: 'Open your reply’s menu', lx: C + 8, ly: 328 },
  { id: 'd-e', d: `M${L + 280},380 H${R - 2}`, label: 'Delete comment', lx: 380, ly: 372, anchor: 'middle' },
  { id: 'd-f', d: `M${C},410 V468`, label: 'Edit comment', lx: C + 8, ly: 444 },
  { id: 'f-g', d: `M${C},530 V578`, label: 'Change text or photo', lx: C + 8, ly: 558, proposed: true },
  { id: 'g-h', d: `M${C},640 V698`, label: 'Save changes (or Return)', lx: C + 8, ly: 674, proposed: true },
  { id: 'g-i', d: `M${L + 280},600 H${R - 2}`, label: 'Cancel (or Esc)', lx: 380, ly: 592, anchor: 'middle', proposed: true },
  { id: 'i-g', d: `M${R},622 H${L + 282}`, label: 'Keep Editing', lx: 380, ly: 638, anchor: 'middle', proposed: true },
  { id: 'i-c', d: `M${R + 280},610 H744 V270 H${L + 282}`, label: 'Discard: back to the posted comment', lx: 756, ly: 440, anchor: 'middle', rotate: true, proposed: true },
  { id: 'f-c', d: `M${L},500 H18 V270 H${L - 2}`, label: 'Cancel or Esc with no changes', lx: 12, ly: 385, anchor: 'middle', rotate: true },
] as Array<Record<string, any>>).map((e) => ({ anchor: 'start', ...e }));

function open(node: FlowNode): void {
  if (node.story) {
    linkTo(KIND, node.story)();
  }
}
</script>

<style module lang="scss">
@use '@sass/color';

.wrapper {
  font-family: 'Open Sans', sans-serif;
  max-width: 760px;
}

.diagram {
  width: 100%;
  height: auto;
  display: block;
}

.edge {
  fill: none;
  stroke: color.$col_gray_6;
  stroke-width: 1.5;
}

.proposed-edge {
  stroke-dasharray: 5 4;
}

.arrowhead {
  fill: color.$col_gray_6;
}

.edge-label {
  font-size: 11px;
  fill: color.$col_gray_8;
}

.node {
  rect {
    stroke-width: 1.5;
  }

  &.figma rect {
    fill: color.$col_blue_pale;
    stroke: color.$col_blue;
  }

  &.proposed rect {
    fill: color.$col_white;
    stroke: color.$col_blue;
    stroke-dasharray: 6 4;
  }

  &.today rect {
    fill: color.$col_gray_light;
    stroke: color.$col_gray_2;
  }

  &.linked {
    cursor: pointer;
    outline: none;

    &:hover rect,
    &:focus rect {
      stroke-width: 3;
    }
  }
}

.node-title {
  font-size: 13px;
  font-weight: 700;
  fill: color.$col_blue_dark;
}

.node-sub {
  font-size: 11px;
  fill: color.$col_typography_body;
}

.node-tag {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  fill: color.$col_gray_6;
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 20px;
  margin-top: 12px;
  font-size: 12px;
  color: color.$col_typography_body;

  span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
}

.swatch {
  display: inline-block;
  width: 18px;
  height: 12px;
  border-radius: 3px;
  border: 1.5px solid color.$col_blue;

  &.figma {
    background: color.$col_blue_pale;
  }

  &.proposed {
    background: color.$col_white;
    border-style: dashed;
  }

  &.today {
    background: color.$col_gray_light;
    border-color: color.$col_gray_2;
  }
}
</style>
