// src/App.ts parses the user agent through the private sketchup-shared-ts
// package. CommentTextArea only needs isMacOS (for the ⌘ vs Ctrl hint).
export function isMacOS(): boolean {
  return navigator.platform.toUpperCase().includes('MAC');
}
