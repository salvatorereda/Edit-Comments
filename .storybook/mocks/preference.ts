import { ref } from 'vue';

type PreferenceValue<T> = {
  value: T;
  ensureAtCorrectLevel?: () => void;
};

const makePref = <T>(defaultValue: T): PreferenceValue<T> => ({
  value: defaultValue,
  ensureAtCorrectLevel: () => undefined,
});

export const SELECTED_DIFFUSION_TEXT_PRESET = ref('auto');
export const SELECTED_DIFFUSION_PAINT_PRESET = ref('auto');
export const SELECTED_DIFFUSION_SKETCH_PRESET = ref('auto');

export const ACCEPTED_FREE_EULA = makePref(0);
export const ACCEPTED_SHOP_EULA = makePref(0);
export const HIDE_SAVE_BEFORE_SHARE_WARNINGS = makePref(false);
export const HIDE_IMAGE_EXPORT_WARNINGS = makePref(false);
export const HIDE_PRINT_PDF_WARNINGS = makePref(false);
export const HIDE_LARGE_COMPONENT_WARNINGS = makePref(false);
export const HIDE_FILE_CONVERSION_NOTIFICATIONS = makePref(false);
export const ONBOARDING_COMPLETED = makePref(false);
export const FREE_EXPERIMENT_BUCKET = makePref('');
export const DISMISSED_SHOW_NEW_GRAPHICS_ENGINE_DIALOGS = makePref(false);
export const ENABLE_NEW_GRAPHICS_ENGINE = makePref(false);
export const AUTO_ENHANCE_MATERIALS = makePref(false);
export const AUTO_ENHANCE_MATERIALS_METALNESS_ENABLED = makePref(false);
export const AUTO_ENHANCE_MATERIALS_ROUGHNESS_ENABLED = makePref(false);
export const AUTO_ENHANCE_MATERIALS_METALNESS_FACTOR = makePref(0);
export const AUTO_ENHANCE_MATERIALS_ROUGHNESS_FACTOR = makePref(0);
export const CONNECT_RECENT_FILES = makePref(false);
export const CONNECT_WEB_RECENT_FILES = makePref(false);
export const GOOGLE_RECENT_FILES = makePref(false);
export const MICROSOFT_RECENT_FILES = makePref(false);
export const DEFAULT_TEMPLATE = makePref('');
export const IS_FIRST_BRAVO_USER_ACCESS = makePref(false);
export const BRAVO_USER_FILE_REMOTE_ID = makePref('');
export const PURGE_MODE = makePref(false);
export const CLICK_STYLE = makePref('');
export const SKORE_ROTATION_GRIPS_ENABLED = makePref(false);
export const HIDE_AUTOENABLE_ENVIRONMENT_DIALOG = makePref(false);
export const AUTOENABLE_ENVIRONMENT = makePref(false);
export const ACKNOLEDGED_HIDDEN_SKETCHY_EDGES = makePref(false);
export const AI_SURVEY_TAKEN_10_2025 = makePref(false);
export const NAVIGATION_DEVICE = makePref('');
export const TRACKPAD_DRAG_BEHAVIOR = makePref('');
export const MOUSE_WHEEL_DELTA = makePref(0);
export const TRACKPAD_CAMERA_ZOOM_DELTA = makePref(0);
export const CAMERA_ORBIT_SPEED = makePref(0);
export const CAMERA_PAN_SPEED = makePref(0);
export const DISMISSED_TOOLBAR_TUTORIAL = makePref(false);
export const DISMISSED_TOOLBAR_TUTORIAL_PART_1 = makePref(false);
export const DISMISSED_TOOLBAR_TUTORIAL_PART_2 = makePref(false);

export const Preference = makePref;
export const ShareLevel = {};

export type Preference = PreferenceValue<unknown>;
export type PrefOptions = Record<string, unknown>;
