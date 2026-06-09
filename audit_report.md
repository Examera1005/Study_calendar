# QA Audit Report: Study Calendar

This report documents the results of a comprehensive QA audit on the active git changes in the Study Calendar workspace, verifying React hook dependencies, localization centralization, CSS syntax, and custom helper function logic.

---

## 📊 Summary of Automated Health Checks

1. **TypeScript Type Safety**: 
   - Command: `npx tsc --noEmit`
   - Status: **PASS (100% Success)**. The codebase is free of type errors.
2. **React Static Analysis**: 
   - Command: `npx react-doctor -y --verbose`
   - Status: **PASS (Score: 100/100)**. React Doctor scanned 52 files and found no React-specific architectural violations.

---

## 🔎 Detailed Audit Findings & Recommendations

### 1. Exhaustive React Hook Dependencies (Bug & Warning Prevention)

We audited every new and modified hook callback and its dependency array. Here are the findings:

#### ⚠️ Issue A: Non-stabilized local functions called within `useEffect`
- **File**: `src/components/auth/landing/CryptoDemo.tsx` (Lines 29, 32, 48)
- **Problem**: The function `clearCryptoTimers` is defined inside the component as a regular function and recreated on every render. However, it is called in:
  - The language-change `useEffect` dependency cleanup.
  - The component unmount cleanup `useEffect` (with dependency `[]`).
  While it only mutates references (`scrambleIntervalRef.current` and `cryptoTimeoutsRef.current`), standard React design rules dictate that any helper called inside a hook should either be wrapped in `useCallback` or inlined to avoid potential closure bugs or React warnings in environments using strict dependency linting.
- **Fix Recommendation**: Wrap `clearCryptoTimers` in `useCallback`:
  ```typescript
  const clearCryptoTimers = useCallback(() => {
    if (scrambleIntervalRef.current) {
      clearInterval(scrambleIntervalRef.current);
      scrambleIntervalRef.current = null;
    }
    cryptoTimeoutsRef.current.forEach((id) => clearTimeout(id));
    cryptoTimeoutsRef.current = [];
  }, []);
  ```

#### ⚠️ Issue B: Unstable local callback used in `useEffect` without being declared in dependencies
- **File**: [ProfileHandleCard.tsx](file:///home/thelio/Github/Study_calendar/src/components/settings/ProfileHandleCard.tsx#L21) (Lines 21, 75)
- **Problem**: The callback `updateUsernameCheckState` is recreated on every render. It is called inside the debounced username check `useEffect` (line 34). The dependency array includes `[usernameInput, profile, language, t]` but leaves out `updateUsernameCheckState`. Declaring it would cause an infinite render loop unless the callback is memoized, but not declaring it violates standard React dependency rules.
- **Fix Recommendation**: Inline the call to `setCheckState` directly inside the `useEffect` to eliminate the helper function dependency entirely:
  ```typescript
  // Replace:
  updateUsernameCheckState({ isChecking: true, isAvailable: null, error: "" });
  // With direct state setter:
  setCheckState(prev => ({ ...prev, isChecking: true, isAvailable: null, error: "" }));
  ```

---

### 2. Bilingual Localization Consistency & Integrity

#### 🔴 Issue C: Hardcoded inline translation ternaries in the landing page and demos
- **Files**:
  - [LandingPage.tsx](file:///home/thelio/Github/Study_calendar/src/components/auth/LandingPage.tsx) (approx. 50 occurrences)
  - [ChecklistDemo.tsx](file:///home/thelio/Github/Study_calendar/src/components/auth/landing/ChecklistDemo.tsx)
  - [PomodoroDemo.tsx](file:///home/thelio/Github/Study_calendar/src/components/auth/landing/PomodoroDemo.tsx)
  - [CryptoDemo.tsx](file:///home/thelio/Github/Study_calendar/src/components/auth/landing/CryptoDemo.tsx)
  - [StreakDemo.tsx](file:///home/thelio/Github/Study_calendar/src/components/auth/landing/StreakDemo.tsx)
- **Problem**: The rule states: *"Verify that all newly introduced user-facing texts are fully centralized in translations.ts. Ensure there are no remaining inline translation ternaries like `language === 'en' ? 'Text A' : 'Text B'` for UI strings."*
  However, these components define dozens of texts using the local `isEn` ternary constraint.
- **Fix Recommendation**: Move all mock dashboard/playground and landing features strings to the `landingPage` section inside `translations.ts`, and replace them in the components with `t.landingPage.[key]`.

#### 🔴 Issue D: Inline translation logic passed as parameter
- **File**: [ThemeSettingsCard.tsx](file:///home/thelio/Github/Study_calendar/src/components/settings/ThemeSettingsCard.tsx#L150) (Line 150)
- **Problem**: The component invokes the translation function `themeCustomDesc` like so:
  `t.settings.themeCustomDesc(theme === "dark" ? (language === "en" ? "Dark" : "Sombre") : (language === "en" ? "Light" : "Clair"))`
  This mixes UI configuration concerns with state checks in the markup.
- **Fix Recommendation**: Simplify the translation schema function so it takes the theme directly as an argument, and determine the language-specific label ("Dark"/"Sombre" and "Light"/"Clair") inside `translations.ts`:
  - **In translation definitions (`translations.ts`)**:
    - **`en`**: `themeCustomDesc: (mode) => \`Fine-tune colors for \${mode === "dark" ? "Dark" : "Light"} Mode. Changes apply instantly.\`,`
    - **`fr`**: `themeCustomDesc: (mode) => \`Ajustez les couleurs du mode \${mode === "dark" ? "Sombre" : "Clair"}. Appliqué instantanément.\`,`
  - **In calling component (`ThemeSettingsCard.tsx`)**:
    - Call it simply as `{t.settings.themeCustomDesc(theme)}`.

#### ⚠️ Issue E: Missing decryption error localization
- **File**: [ChatTab.tsx](file:///home/thelio/Github/Study_calendar/src/components/friends/ChatTab.tsx#L26) (Line 26)
- **Problem**: In the E2E E message row decryptor fallback, if message decryption fails, it prints `"❌ Error decrypting"` as a hardcoded string.
- **Fix Recommendation**: Add `decryptError` to `TranslationSchema.friends` (e.g., `"❌ Error decrypting"` for English, and `"❌ Échec du déchiffrement"` for French) and load it dynamically using `t.friends.decryptError`.

---

### 3. Styling & Syntax Verification

We inspected all modified styling sheets (`index.css`) and inline React style properties.
- **Result**: **Clean**. 
- The transitions in `toggle-btn` were correctly refactored:
  `transition: background var(--transition-fast), color var(--transition-fast), box-shadow var(--transition-fast);`
- No syntax typos, commas inside string values, or invalid unit values were detected.

---

### 4. Logical Consistency & Refactoring Regressions

1. **Pomodoro Presets (`getPresetLabel`)**:
   - Verification: The refactored `PomodoroView.tsx` correctly extracts presets list into keys `classic`, `productive`, `sprint`, and `continuous`. The helper function `getPresetLabel` is clean and correctly maps keys to the schema definitions `t.pomodoro.[presetName]`.
2. **Achievements List Localization (`statsUtils.ts`)**:
   - Verification: Passing `t` to `getAchievements` and using type `TranslationSchema` is correct. The returned badge properties properly map to the localized schema entries `t.analytics.[firstSessionTitle, studyHoursTitle, etc.]`.
3. **Array/List Optional Chaining**:
   - Verification: Coalescing filters like `allLogs || []` and optional query handling are correctly implemented in pages such as `AnalyticsView.tsx` and `ExamsView.tsx` to handle loading/undefined states safely.
