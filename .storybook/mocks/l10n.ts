// The source mock's $t ignores {VARS} and its $tSplit returns a string, but
// PermissionSelector.vue maps over $tSplit's segments and the share dialog
// interpolates names. Same template/delineate logic as src/l10n/l10n.ts.
export * from '@mock/l10n.ts';

type Variables = Record<string, string>;
type Delimited = Array<{ text: string; name?: string }>;

const FIND_VARS = /{\s*([^#}\s]+)\s*}/g;
const FIND_DELIMITER = /{\/[^}]+}|{#([^}]+)}/g;

function template(text: string, vars?: Variables): string {
  return vars == null ? text : text.replace(FIND_VARS, (_m, name) => vars[name] || '');
}

function delineate(text: string): Delimited {
  const parts = [undefined, ...text.split(FIND_DELIMITER)];
  const segments: Delimited = [];
  for (let index = 0; index < parts.length; index += 2) {
    segments.push({ text: parts[index + 1] as string, name: parts[index] });
  }
  return segments.filter((seg) => seg.text !== '' || seg.name != null);
}

export function $t(text: string, vars?: Variables): string {
  return template(text, vars);
}

export function $tSplit(text: string, vars?: Variables): Delimited {
  return delineate(template(text, vars));
}
