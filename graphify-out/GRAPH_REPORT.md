# Graph Report - .  (2026-06-04)

## Corpus Check
- 124 files · ~71,030 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 555 nodes · 776 edges · 57 communities (40 shown, 17 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 19 edges (avg confidence: 0.76)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Application Core|Application Core]]
- [[_COMMUNITY_Chart Data Building|Chart Data Building]]
- [[_COMMUNITY_Skill Hashing & Lock|Skill Hashing & Lock]]
- [[_COMMUNITY_Theme Customization|Theme Customization]]
- [[_COMMUNITY_Chat & Leaderboard Tabs|Chat & Leaderboard Tabs]]
- [[_COMMUNITY_Package Dependencies|Package Dependencies]]
- [[_COMMUNITY_Calendar UI Grid|Calendar UI Grid]]
- [[_COMMUNITY_TypeScript Config|TypeScript Config]]
- [[_COMMUNITY_Auth Provider Plugins|Auth Provider Plugins]]
- [[_COMMUNITY_User Profile & Friends|User Profile & Friends]]
- [[_COMMUNITY_Stats & Badge Cards|Stats & Badge Cards]]
- [[_COMMUNITY_Auth Domain Concepts|Auth Domain Concepts]]
- [[_COMMUNITY_TS Config (App)|TS Config (App)]]
- [[_COMMUNITY_Landing Page Demos|Landing Page Demos]]
- [[_COMMUNITY_TS Config (Node)|TS Config (Node)]]
- [[_COMMUNITY_Border Glow Animation|Border Glow Animation]]
- [[_COMMUNITY_Timer Hooks & Mobile Header|Timer Hooks & Mobile Header]]
- [[_COMMUNITY_Convex Component Patterns|Convex Component Patterns]]
- [[_COMMUNITY_Subject CRUD|Subject CRUD]]
- [[_COMMUNITY_Task CRUD|Task CRUD]]
- [[_COMMUNITY_Pomodoro State Reducer|Pomodoro State Reducer]]
- [[_COMMUNITY_State Transitions|State Transitions]]
- [[_COMMUNITY_Habit CRUD|Habit CRUD]]
- [[_COMMUNITY_Stopwatch State Reducer|Stopwatch State Reducer]]
- [[_COMMUNITY_Background Task State|Background Task State]]
- [[_COMMUNITY_Event CRUD|Event CRUD]]
- [[_COMMUNITY_Exam CRUD|Exam CRUD]]
- [[_COMMUNITY_Convex Data Schema|Convex Data Schema]]
- [[_COMMUNITY_Convex Server Types|Convex Server Types]]
- [[_COMMUNITY_Subject Distribution Chart|Subject Distribution Chart]]
- [[_COMMUNITY_Skill Icon Set|Skill Icon Set]]
- [[_COMMUNITY_AI Files Sync State|AI Files Sync State]]
- [[_COMMUNITY_Auth Client API|Auth Client API]]
- [[_COMMUNITY_Pomodoro View|Pomodoro View]]
- [[_COMMUNITY_Brand Identity & Logo|Brand Identity & Logo]]
- [[_COMMUNITY_User ID Migration|User ID Migration]]
- [[_COMMUNITY_Convex Guidelines & README|Convex Guidelines & README]]
- [[_COMMUNITY_Floating Timer Widget|Floating Timer Widget]]
- [[_COMMUNITY_Convex Config|Convex Config]]
- [[_COMMUNITY_Convex Internal|Convex Internal]]
- [[_COMMUNITY_Convex Internal Query|Convex Internal Query]]
- [[_COMMUNITY_Convex Action|Convex Action]]
- [[_COMMUNITY_Convex Internal Action|Convex Internal Action]]
- [[_COMMUNITY_Convex HTTP Action|Convex HTTP Action]]
- [[_COMMUNITY_Vite React Plugin|Vite React Plugin]]
- [[_COMMUNITY_Generated Data Model|Generated Data Model]]
- [[_COMMUNITY_Main App Entry|Main App Entry]]
- [[_COMMUNITY_Vite Env Declaration|Vite Env Declaration]]
- [[_COMMUNITY_Crypto Utilities|Crypto Utilities]]
- [[_COMMUNITY_Convex AI Guidelines|Convex AI Guidelines]]
- [[_COMMUNITY_Convex Audit OpenAI Config|Convex Audit OpenAI Config]]
- [[_COMMUNITY_Convex Routing Skill|Convex Routing Skill]]
- [[_COMMUNITY_Public Robots|Public Robots]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 18 edges
2. `api` - 18 edges
3. `compilerOptions` - 16 edges
4. `formatDuration()` - 14 edges
5. `compilerOptions` - 13 edges
6. `Modal()` - 12 edges
7. `Study Calendar App` - 9 edges
8. `skills` - 7 edges
9. `playSynthSound()` - 7 edges
10. `SubjectBadge()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `Convex AI Coding Directive` --references--> `Convex Backend`  [EXTRACTED]
  CLAUDE.md → convex/http.ts
- `pnpm Workspace Config` --references--> `Convex Backend`  [EXTRACTED]
  pnpm-workspace.yaml → convex/http.ts
- `Study Calendar Brand Logo` --implements--> `Study Calendar Brand Identity`  [INFERRED]
  public/logo.png → README.md
- `Study Calendar Brand Logo` --conceptually_related_to--> `Landing page brand text "📚 Study Calendar"`  [INFERRED]
  public/logo.png → src/components/auth/LandingPage.tsx
- `Study Calendar App` --references--> `Convex Backend`  [EXTRACTED]
  README.md → convex/http.ts

## Hyperedges (group relationships)
- **Study Calendar Backend Stack** — convex_backend, convex_auth_config [INFERRED 0.78]
- **Generated Convex Surface** — generated_api, generated_server, generated_data_model [INFERRED 0.70]
- **Performance Audit Reference Cluster** — convex_performance_audit_skill, subscription_cost, hot_path_rules, function_budget, occ_conflicts [EXTRACTED 1.00]
- **Migration Helper Reference Cluster** — convex_migration_helper_skill, migrations_component_ref, migration_patterns_ref [EXTRACTED 1.00]
- **Auth Provider Options Cluster** — convex_setup_auth_skill, convex_auth_ref, clerk_ref, workos_authkit_ref, auth0_ref [EXTRACTED 1.00]
- **Convex Component Design Skill Set** — convex_create_component_agent, advanced_component_patterns, packaged_components_doc, hybrid_components_doc [INFERRED 0.90]
- **Convex + React + TypeScript + Vite + E2E Crypto** — convex_backend, react_frontend, end_to_end_encryption, web_crypto_api, theme_system, pnpm_workspace_config [EXTRACTED 1.00]
- **Study Calendar public brand assets** — public_logo_png, index_html_favicon_link, sidebar_logo_img, brand_study_calendar, brand_landing_text [INFERRED 0.90]

## Communities (57 total, 17 thin omitted)

### Community 0 - "Application Core"
Cohesion: 0.07
Nodes (30): SignIn(), api, components, ExamsView(), SettingsView(), SubjectsView(), TasksView(), TaskTab (+22 more)

### Community 1 - "Chart Data Building"
Cohesion: 0.09
Nodes (25): buildChartData(), ChartElements, formatLocalDate(), Log, MONTH_LABELS, Point, ProgressionChart(), DayPanel() (+17 more)

### Community 2 - "Skill Hashing & Lock"
Cohesion: 0.06
Nodes (32): computedHash, computedHash, skillPath, source, sourceType, computedHash, skillPath, source (+24 more)

### Community 3 - "Theme Customization"
Cohesion: 0.14
Nodes (25): COLOR_VARIABLES, getPresetsForVariable(), ThemeSettingsCard(), ThemeSettingsCardProps, ColorPicker(), ColorPickerProps, DEFAULT_PRESETS, adjustColorLightness() (+17 more)

### Community 4 - "Chat & Leaderboard Tabs"
Cohesion: 0.11
Nodes (19): ChatTab(), ChatTabProps, LeaderboardTab(), LeaderboardTabProps, ManageFriendsTab(), ManageFriendsTabProps, ProfileSetup(), ProfileSetupProps (+11 more)

### Community 5 - "Package Dependencies"
Cohesion: 0.08
Nodes (25): dependencies, @auth/core, convex, @convex-dev/auth, date-fns, react, react-doctor, react-dom (+17 more)

### Community 6 - "Calendar UI Grid"
Cohesion: 0.12
Nodes (17): CalendarDay(), CalendarGrid(), DAY_NAMES, DayData, Props, AddEventModal(), AddLogModal(), AddTaskModal() (+9 more)

### Community 7 - "TypeScript Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleDetection, moduleResolution (+11 more)

### Community 8 - "Auth Provider Plugins"
Cohesion: 0.15
Nodes (19): Auth0, Clerk, Convex Auth, Convex Create Component, Convex Migration Helper, Convex Performance Audit, Convex Quickstart OpenAI Config, Convex Quickstart (+11 more)

### Community 9 - "User Profile & Friends"
Cohesion: 0.11
Nodes (18): assertIsFriends(), blockUser, checkUsernameAvailable, createOrUpdateProfile, getBlockedUsers, getFriendExams, getFriendships, getFriendsLeaderboard (+10 more)

### Community 10 - "Stats & Badge Cards"
Cohesion: 0.15
Nodes (15): BadgeCard(), KpiCards(), Props, Stats, Tab, TimeRangeToggle(), AnalyticsView(), Log (+7 more)

### Community 11 - "Auth Domain Concepts"
Cohesion: 0.11
Nodes (19): Auth Provider Domain, Calendar View, Convex AI Coding Directive, Convex AI Guidelines (referenced), Convex Auth Config, Convex Backend, Dashboard View, End-to-End Encrypted Messaging (RSA-OAEP 2048-bit) (+11 more)

### Community 12 - "TS Config (App)"
Cohesion: 0.11
Nodes (18): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+10 more)

### Community 13 - "Landing Page Demos"
Cohesion: 0.21
Nodes (11): LandingPage(), ChecklistDemo(), CryptoDemo(), PomoAction, PomodoroDemo(), pomoReducer(), PomoState, playSynthSound() (+3 more)

### Community 14 - "TS Config (Node)"
Cohesion: 0.12
Nodes (15): compilerOptions, allowJs, allowSyntheticDefaultImports, forceConsistentCasingInFileNames, isolatedModules, jsx, lib, module (+7 more)

### Community 15 - "Border Glow Animation"
Cohesion: 0.16
Nodes (11): AnimateOpts, BorderGlow(), BorderGlowProps, buildGlowVars(), buildGradientVars(), COLOR_MAP, DEFAULT_COLORS, DEFAULT_STYLE (+3 more)

### Community 16 - "Timer Hooks & Mobile Header"
Cohesion: 0.19
Nodes (10): usePomodoro(), useStopwatch(), MobileHeader(), Props, TITLES, NAV_ITEMS, Sidebar(), App() (+2 more)

### Community 17 - "Convex Component Patterns"
Cohesion: 0.20
Nodes (10): Advanced Component Patterns, Class-based Client Wrappers, Convex Create Component Agent, Convex Migration Helper Agent, Function Handles for Callbacks, Static Configuration with Globals Table, Hybrid Convex Components, Packaged Convex Components (+2 more)

### Community 18 - "Subject CRUD"
Cohesion: 0.22
Nodes (8): create, list, remove, update, get, update, mutation, query

### Community 19 - "Task CRUD"
Cohesion: 0.22
Nodes (8): create, getByDate, listAll, listGeneral, listIncomplete, remove, toggleComplete, update

### Community 20 - "Pomodoro State Reducer"
Cohesion: 0.25
Nodes (5): Action, Mode, PomodoroApi, State, Status

### Community 21 - "State Transitions"
Cohesion: 0.25
Nodes (7): reason, state, updatedAt, sessionID, sources, background-task, updatedAt

### Community 22 - "Habit CRUD"
Cohesion: 0.29
Nodes (6): create, getByDate, getByDateRange, list, remove, update

### Community 23 - "Stopwatch State Reducer"
Cohesion: 0.29
Nodes (4): Action, Status, StopwatchApi, StopwatchState

### Community 24 - "Background Task State"
Cohesion: 0.29
Nodes (6): state, updatedAt, sessionID, sources, background-task, updatedAt

### Community 25 - "Event CRUD"
Cohesion: 0.33
Nodes (5): create, getByDate, getByDateRange, remove, update

### Community 26 - "Exam CRUD"
Cohesion: 0.33
Nodes (5): create, list, remove, upcoming, update

### Community 27 - "Convex Data Schema"
Cohesion: 0.33
Nodes (4): DataModel, Doc, Id, TableNames

### Community 28 - "Convex Server Types"
Cohesion: 0.33
Nodes (5): ActionCtx, DatabaseReader, DatabaseWriter, MutationCtx, QueryCtx

### Community 29 - "Subject Distribution Chart"
Cohesion: 0.33
Nodes (4): DistributionItem, Log, Subject, SubjectDistribution()

### Community 30 - "Skill Icon Set"
Cohesion: 0.40
Nodes (5): Convex Create Component Icon, Convex Migration Helper Icon, Convex Performance Audit Icon, Convex Quickstart Icon, Convex Setup Auth Icon

### Community 31 - "AI Files Sync State"
Cohesion: 0.40
Nodes (4): agentSkillsSha, agentsMdSectionHash, claudeMdHash, guidelinesHash

### Community 33 - "Pomodoro View"
Cohesion: 0.50
Nodes (4): formatSeconds(), PomodoroView(), PomodoroViewProps, PRESETS

### Community 34 - "Brand Identity & Logo"
Cohesion: 0.60
Nodes (5): Landing page brand text "📚 Study Calendar", Study Calendar Brand Identity, Favicon link in index.html, Study Calendar Brand Logo, Sidebar logo image element

### Community 36 - "Convex Guidelines & README"
Cohesion: 0.67
Nodes (4): Convex Guidelines, Convex README Docs, Generated Convex API, Generated Convex Server Types

### Community 37 - "Floating Timer Widget"
Cohesion: 0.67
Nodes (3): FloatingTimerWidget(), formatElapsed(), Props

## Knowledge Gaps
- **292 isolated node(s):** `tsBuildInfoFile`, `target`, `useDefineForClassFields`, `lib`, `module` (+287 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `api` connect `Application Core` to `Chart Data Building`, `Theme Customization`, `Chat & Leaderboard Tabs`, `Calendar UI Grid`, `Stats & Badge Cards`, `Timer Hooks & Mobile Header`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Why does `Modal()` connect `Application Core` to `Chart Data Building`, `Chat & Leaderboard Tabs`, `Landing Page Demos`, `Calendar UI Grid`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **Why does `formatDuration()` connect `Chart Data Building` to `Chat & Leaderboard Tabs`, `Calendar UI Grid`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **What connects `tsBuildInfoFile`, `target`, `useDefineForClassFields` to the rest of the system?**
  _292 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Application Core` be split into smaller, more focused modules?**
  _Cohesion score 0.06914893617021277 - nodes in this community are weakly interconnected._
- **Should `Chart Data Building` be split into smaller, more focused modules?**
  _Cohesion score 0.08961593172119488 - nodes in this community are weakly interconnected._
- **Should `Skill Hashing & Lock` be split into smaller, more focused modules?**
  _Cohesion score 0.06060606060606061 - nodes in this community are weakly interconnected._