// CAPTURE BUILDS ONLY, never shipped: lets a script on the Mac put the app into
// an exact state (match, language, theme, open dialog) for design screenshots.
// It polls a local server that only exists while a capture run is going. It is
// on only when the bundle was built with EXPO_PUBLIC_CAPTURE=1; store builds
// never set that variable, so the effect returns immediately.
import { useEffect, useRef } from 'react';
import { Dimensions, InteractionManager, Keyboard, ScrollView } from 'react-native';
import type { LanguageCode } from '../i18n/types';
import type { ThemeId } from '../theme/themes';
import type { MatchState } from '../types';

export type CaptureOverlay =
  | 'none'
  | 'settings'
  | 'keypadA'
  | 'keypadB'
  | 'confirmReset'
  | 'removeRound'
  | 'pro';

export type CaptureSpec = {
  seq: number;
  lang?: LanguageCode;
  theme?: ThemeId;
  pro?: boolean;
  adsRemoved?: boolean;
  match?: MatchState;
  overlay?: CaptureOverlay;
  settingsScroll?: 'top' | 'end';
  keypadDigits?: string;
  editTarget?: boolean;
  settleMs?: number;
};

export type CaptureControls = {
  setLang: (l: LanguageCode) => void;
  setThemeId: (id: ThemeId) => void;
  setProUnlocked: (v: boolean) => void;
  setAdsRemoved: (v: boolean) => void;
  replaceMatch: (s: MatchState) => void;
  setOverlay: (o: CaptureOverlay) => void;
};

// Components register handles here so a capture can show states that need a
// tap: the lower half of the settings sheet, typed keypad digits, and the
// target pill in edit mode.
export const devRefs: {
  settingsScroll: ScrollView | null;
  setKeypadEntry?: (digits: string) => void;
  editTarget?: () => void;
} = { settingsScroll: null };

export const CAPTURE_BUILD = process.env.EXPO_PUBLIC_CAPTURE === '1';
const SERVER = 'http://localhost:8099';
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
// Resolve only after pending interactions finish and two frames have been
// drawn, so an ack means the new state is on screen, not just in React state.
const painted = () =>
  new Promise<void>((resolve) => {
    InteractionManager.runAfterInteractions(() => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
  });

export function useCaptureHarness(controls: CaptureControls) {
  const ref = useRef(controls);
  ref.current = controls;

  useEffect(() => {
    if (!CAPTURE_BUILD) return;
    let seq = -1;
    let busy = false;
    const timer = setInterval(async () => {
      if (busy) return;
      busy = true;
      try {
        const res = await fetch(`${SERVER}/state.json?t=${Date.now()}`);
        if (!res.ok) return;
        const spec = (await res.json()) as CaptureSpec;
        if (spec.seq === seq) return;
        seq = spec.seq;
        // Close every dialog and the keyboard first, so a native modal never
        // stacks on another and an open target edit ends.
        Keyboard.dismiss();
        ref.current.setOverlay('none');
        await wait(450);
        ref.current.setProUnlocked(spec.pro ?? false);
        ref.current.setAdsRemoved(spec.adsRemoved ?? false);
        ref.current.setLang(spec.lang ?? 'en');
        if (spec.match) ref.current.replaceMatch(spec.match);
        await wait(300);
        // A second step: setThemeId resolves locked themes against the Pro
        // flag, so it must run after the re-render that applied that flag.
        ref.current.setThemeId(spec.theme ?? 'classic');
        await wait(300);
        ref.current.setOverlay(spec.overlay ?? 'none');
        await wait(700);
        if (spec.overlay === 'settings' && spec.settingsScroll === 'end') {
          devRefs.settingsScroll?.scrollToEnd({ animated: false });
          await wait(300);
        }
        if (spec.keypadDigits) devRefs.setKeypadEntry?.(spec.keypadDigits);
        if (spec.editTarget) {
          devRefs.editTarget?.();
          // The keyboard and its Done bar slide in.
          await wait(900);
        }
        await wait(spec.settleMs ?? 700);
        await painted();
        const { width, height } = Dimensions.get('window');
        await fetch(`${SERVER}/ack?seq=${spec.seq}&dev=${Math.round(width)}x${Math.round(height)}`);
      } catch {
        // No capture server running: stay idle.
      } finally {
        busy = false;
      }
    }, 300);
    return () => clearInterval(timer);
  }, []);
}
