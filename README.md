# Edit Comments

A Storybook mock for editing a posted comment in the SketchUp Comments panel
(RTC - GO 2026 Figma section "Edit Comments").

- A reply's kebab menu gains **Edit comment**; the reply turns into an in-place
  editor with its photo and text plus **Cancel** / **Save changes**, and the
  new-comment box hides while editing.
- Proposed beyond Figma: Save changes stays disabled until something changes, a
  **Discard Changes?** prompt on Cancel after edits, and an **Edited** label
  after saving.
- Stories start the same working panel at each step, and a **Flow Diagram**
  story maps the steps and links each one to its story.

## Running it

The mock uses real components from the `sketchup_web` (Vue 2.7) repo. By
default it looks for that repo four folders up (`../../../../sketchup_web` from
`.storybook/`); point `SKETCHUP_WEB_PATH` at your checkout to override.

```bash
npm install
SKETCHUP_WEB_PATH=/path/to/sketchup_web npm run storybook   # http://localhost:6030
```
