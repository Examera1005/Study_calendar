# Graph Report - .  (2026-05-30)

## Corpus Check
- Corpus is ~40,017 words - fits in a single context window. You may not need a graph.

## Summary
- 329 nodes · 426 edges · 32 communities (22 shown, 10 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 35 edges (avg confidence: 0.75)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Backend Data Operations|Backend Data Operations]]
- [[_COMMUNITY_UI Components & Pages|UI Components & Pages]]
- [[_COMMUNITY_Convex Agent Skills|Convex Agent Skills]]
- [[_COMMUNITY_Project Dependencies|Project Dependencies]]
- [[_COMMUNITY_Data Model & Schema|Data Model & Schema]]
- [[_COMMUNITY_App TypeScript Config|App TypeScript Config]]
- [[_COMMUNITY_Convex Skill References|Convex Skill References]]
- [[_COMMUNITY_Root TypeScript Config|Root TypeScript Config]]
- [[_COMMUNITY_Friend System|Friend System]]
- [[_COMMUNITY_React App Core|React App Core]]
- [[_COMMUNITY_Convex TSConfig|Convex TSConfig]]
- [[_COMMUNITY_Project Metadata|Project Metadata]]
- [[_COMMUNITY_Session Management|Session Management]]
- [[_COMMUNITY_DataModel Types|DataModel Types]]
- [[_COMMUNITY_Convex Server Ctx|Convex Server Ctx]]
- [[_COMMUNITY_Cryptography Utils|Cryptography Utils]]
- [[_COMMUNITY_AI State Tracking|AI State Tracking]]
- [[_COMMUNITY_Skill Icons|Skill Icons]]
- [[_COMMUNITY_Generated APIServer|Generated API/Server]]
- [[_COMMUNITY_App Entrypoint|App Entrypoint]]
- [[_COMMUNITY_Internal Routing|Internal Routing]]
- [[_COMMUNITY_Internal Query|Internal Query]]
- [[_COMMUNITY_Internal Mutation|Internal Mutation]]
- [[_COMMUNITY_Action Handler|Action Handler]]
- [[_COMMUNITY_Internal Action|Internal Action]]
- [[_COMMUNITY_HTTP Action|HTTP Action]]
- [[_COMMUNITY_Vite Env Types Docs|Vite Env Types Docs]]
- [[_COMMUNITY_Performance AI Config|Performance AI Config]]
- [[_COMMUNITY_Convex Routing Skill|Convex Routing Skill]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 18 edges
2. `compilerOptions` - 16 edges
3. `compilerOptions` - 13 edges
4. `App` - 12 edges
5. `subjects` - 11 edges
6. `Modal()` - 9 edges
7. `api` - 9 edges
8. `Convex Schema` - 9 edges
9. `Modal` - 9 edges
10. `SubjectsView` - 8 edges

## Surprising Connections (you probably didn't know these)
- `Convex AI Guidelines` --conceptually_related_to--> `Convex Schema`  [EXTRACTED]
  AGENTS.md → convex/schema.ts
- `Study Calendar Description` --references--> `Study Calendar`  [EXTRACTED]
  index.html → package.json
- `Sitemap Reference` --references--> `Study Calendar`  [EXTRACTED]
  public/robots.txt → package.json
- `Vite React Plugin` --conceptually_related_to--> `Study Calendar`  [INFERRED]
  vite.config.ts → package.json
- `SubjectBadge` --semantically_similar_to--> `ColorPicker`  [INFERRED] [semantically similar]
  src/components/ui/SubjectBadge.tsx → src/components/ui/ColorPicker.tsx

## Hyperedges (group relationships)
- **Study Calendar Backend Stack** — convex_backend, convex_auth_config, convex_schema, auth_tables [INFERRED 0.78]
- **Study Calendar Domain Model** — subjects_table, exams_table, dailylogs_table, tasks_table, events_table, userprofiles_table, friendships_table [EXTRACTED 1.00]
- **Study Planning Data Layer** — dailylogs_module, subjects_module, exams_module, events_module, tasks_module [INFERRED 0.82]
- **Social Identity Layer** — auth_module, friends_module, user_profiles_table, friendships_table, blocks_table [INFERRED 0.78]
- **Generated Convex Surface** — generated_api, generated_server, generated_data_model [INFERRED 0.70]
- **Study app navigation shell** — app, sidebar, dashboard, calendarview, examsview, tasksview, dailylogview, settingsview, subjectsview, friendsview [INFERRED 0.84]
- **Shared study data pages** — dashboard, calendarview, tasksview, dailylogview, examsview, subjectsview [INFERRED 0.80]
- **Secure friend messaging stack** — friendsview, crypto_utils, settingsview [INFERRED 0.86]
- **Performance Audit Reference Cluster** — convex_performance_audit_skill, subscription_cost, hot_path_rules, function_budget, occ_conflicts [EXTRACTED 1.00]
- **Migration Helper Reference Cluster** — convex_migration_helper_skill, migrations_component_ref, migration_patterns_ref [EXTRACTED 1.00]
- **Auth Provider Options Cluster** — convex_setup_auth_skill, convex_auth_ref, clerk_ref, workos_authkit_ref, auth0_ref [EXTRACTED 1.00]

## Communities (32 total, 10 thin omitted)

### Community 0 - "Backend Data Operations"
Cohesion: 0.07
Nodes (31): { auth, signIn, signOut, store, isAuthenticated }, create, getByDate, getByDateRange, list, remove, update, create (+23 more)

### Community 1 - "UI Components & Pages"
Cohesion: 0.14
Nodes (19): SignIn(), api, components, NAV_ITEMS, Sidebar(), CalendarView(), DailyLogView(), Dashboard() (+11 more)

### Community 2 - "Convex Agent Skills"
Cohesion: 0.06
Nodes (32): computedHash, computedHash, skillPath, source, sourceType, computedHash, skillPath, source (+24 more)

### Community 3 - "Project Dependencies"
Cohesion: 0.08
Nodes (25): dependencies, @auth/core, convex, @convex-dev/auth, date-fns, react, react-dom, devDependencies (+17 more)

### Community 4 - "Data Model & Schema"
Cohesion: 0.16
Nodes (22): Auth Module, Auth Tables, Blocks Table, Convex Auth Service, Convex AI Guidelines, Convex Schema, Daily Logs Module, dailyLogs (+14 more)

### Community 5 - "App TypeScript Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleDetection, moduleResolution (+11 more)

### Community 6 - "Convex Skill References"
Cohesion: 0.15
Nodes (19): Auth0, Clerk, Convex Auth, Convex Create Component, Convex Migration Helper, Convex Performance Audit, Convex Quickstart OpenAI Config, Convex Quickstart (+11 more)

### Community 7 - "Root TypeScript Config"
Cohesion: 0.11
Nodes (18): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+10 more)

### Community 8 - "Friend System"
Cohesion: 0.12
Nodes (17): assertIsFriends(), blockUser, checkUsernameAvailable, createOrUpdateProfile, getBlockedUsers, getFriendExams, getFriendships, getFriendsLeaderboard (+9 more)

### Community 9 - "React App Core"
Cohesion: 0.33
Nodes (16): App, CalendarView, ColorPicker, crypto utilities, DailyLogView, Dashboard, ExamsView, FriendsView (+8 more)

### Community 10 - "Convex TSConfig"
Cohesion: 0.12
Nodes (15): compilerOptions, allowJs, allowSyntheticDefaultImports, forceConsistentCasingInFileNames, isolatedModules, jsx, lib, module (+7 more)

### Community 11 - "Project Metadata"
Cohesion: 0.22
Nodes (9): Auth Provider Domain, Convex Auth Config, Convex Backend, HTTP Router, Build Script, Sitemap Reference, Study Calendar Description, Study Calendar (+1 more)

### Community 12 - "Session Management"
Cohesion: 0.25
Nodes (7): reason, state, updatedAt, sessionID, sources, background-task, updatedAt

### Community 13 - "DataModel Types"
Cohesion: 0.33
Nodes (4): DataModel, Doc, Id, TableNames

### Community 14 - "Convex Server Ctx"
Cohesion: 0.33
Nodes (5): ActionCtx, DatabaseReader, DatabaseWriter, MutationCtx, QueryCtx

### Community 15 - "Cryptography Utils"
Cohesion: 0.60
Nodes (5): arrayBufferToBase64(), base64ToArrayBuffer(), decryptWithPrivateKey(), encryptWithPublicKey(), generateAndSaveKeys()

### Community 16 - "AI State Tracking"
Cohesion: 0.40
Nodes (4): agentSkillsSha, agentsMdSectionHash, claudeMdHash, guidelinesHash

### Community 17 - "Skill Icons"
Cohesion: 0.40
Nodes (5): Convex Create Component Icon, Convex Migration Helper Icon, Convex Performance Audit Icon, Convex Quickstart Icon, Convex Setup Auth Icon

### Community 18 - "Generated API/Server"
Cohesion: 0.67
Nodes (4): Convex Guidelines, Convex README Docs, Generated Convex API, Generated Convex Server Types

## Knowledge Gaps
- **191 isolated node(s):** `tsBuildInfoFile`, `target`, `useDefineForClassFields`, `lib`, `module` (+186 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `query` connect `Backend Data Operations` to `Friend System`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **Why does `mutation` connect `Backend Data Operations` to `Friend System`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `App` (e.g. with `SignIn` and `Sidebar`) actually correct?**
  _`App` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `tsBuildInfoFile`, `target`, `useDefineForClassFields` to the rest of the system?**
  _191 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Backend Data Operations` be split into smaller, more focused modules?**
  _Cohesion score 0.06666666666666667 - nodes in this community are weakly interconnected._
- **Should `UI Components & Pages` be split into smaller, more focused modules?**
  _Cohesion score 0.14126984126984127 - nodes in this community are weakly interconnected._
- **Should `Convex Agent Skills` be split into smaller, more focused modules?**
  _Cohesion score 0.06060606060606061 - nodes in this community are weakly interconnected._