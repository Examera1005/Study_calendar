import { fr, enUS } from "date-fns/locale";

export interface TranslationSchema {
  common: {
    add: string;
    edit: string;
    delete: string;
    save: string;
    cancel: string;
    done: string;
    close: string;
    loading: string;
    none: string;
    today: string;
    upcoming: string;
    completed: string;
    active: string;
    status: string;
    title: string;
    notes: string;
    date: string;
    saveChanges: string;
    noData: string;
    optional: string;
    error: string;
    success: string;
    uncategorized: string;
    minutesUnit: string;
    hoursUnit: string;
    coefficient: string;
    grade: string;
    remaining: string;
    send: string;
    select: string;
    resume: string;
    stop: string;
    pause: string;
    subject: string;
    dateFormatLong: string;
    dateFormatShort: string;
    dateFormatMedium: string;
  };
  sidebar: {
    dashboard: string;
    calendar: string;
    stats: string;
    pomodoro: string;
    exams: string;
    tasks: string;
    dailyLog: string;
    friends: string;
    subjects: string;
    settings: string;
    subtitle: string;
    lightMode: string;
    darkMode: string;
    signOut: string;
    copyright: string;
    expand: string;
    collapse: string;
    switchToFrench: string;
    switchToEnglish: string;
  };
  mobileHeader: {
    live: string;
    paused: string;
    openMenu: string;
  };
  dashboard: {
    title: string;
    returnToday: string;
    upcomingExams: string;
    todaysTasks: string;
    tasksOfDay: string;
    studyStreak: string;
    studyTimeToday: string;
    studyTimeDay: string;
    vsYesterday: string;
    vsPreviousDay: string;
    streakDaySingular: string;
    streakDayPlural: string;
    weeklyActivity: string;
    subjectsBreakdown: string;
    noTasksToday: string;
    noEventsToday: string;
    generalTasks: string;
    noGeneralTasks: string;
    quickOverview: string;
    noExams: string;
    noActivityThisWeek: string;
    weeklyStudySummary: string;
    vsLastWeek: string;
    hoverBarDesc: string;
    hoverColumnsDesc: string;
    todaysEvents: string;
    eventsForSelectedDay: string;
    noEventsScheduled: string;
    studyLogForSelectedDay: string;
    noStudyEntriesYetToday: string;
  };
  calendar: {
    title: string;
    prevMonth: string;
    nextMonth: string;
    dayDetails: string;
    events: string;
    logs: string;
    noLogsForDay: string;
    noEventsForDay: string;
    addEvent: string;
    editEvent: string;
    addLog: string;
    editLog: string;
    eventTime: string;
    eventTitle: string;
    confirmDeleteEvent: string;
    confirmDeleteLog: string;
    addTaskBtn: string;
    addEventBtn: string;
    addLogBtn: string;
    noTasks: string;
    noEvents: string;
    noLogs: string;
    moreItems: (count: number) => string;
    startTimeLabel: string;
    endTimeLabel: string;
  };
  exams: {
    title: string;
    addExam: string;
    createSubjectWarning: string;
    noExamsYet: string;
    passed: string;
    today: string;
    tomorrow: string;
    daysCount: (days: number) => string;
    enterGradePrompt: string;
    editExam: string;
    finalExamPlaceholder: string;
    selectSubjectPlaceholder: string;
    coeffPlaceholder: string;
    notesPlaceholder: string;
    confirmDeleteExam: string;
  };
  tasks: {
    title: string;
    addTask: string;
    prevDay: string;
    nextDay: string;
    generalTasksTab: string;
    dateSpecificTasksTab: string;
    noTasksForDay: string;
    noGeneralTasksYet: string;
    taskCompletedToast: string;
    editTask: string;
    priorityLabel: string;
    priorityLow: string;
    priorityMedium: string;
    priorityHigh: string;
    taskTitlePlaceholder: string;
    taskNotesPlaceholder: string;
    completedCount: (completed: number, total: number) => string;
    dailyTab: string;
    generalTab: string;
    doneTab: string;
    generalTasksDesc: string;
    completedTasksDesc: string;
    noCompletedTasksYet: string;
    dailyTasksCompletedGroup: string;
    generalTasksCompletedGroup: string;
    typeLabel: string;
    descriptionLabel: string;
    subjectLabelOptional: string;
    subjectLabel: string;
  };
  dailyLog: {
    title: string;
    addLog: string;
    adjustStudyTime: string;
    whatDidYouStudy: string;
    summaryPlaceholder: string;
    discard: string;
    saveLog: string;
    noLogsYet: string;
    studyTimeLabel: string;
    logStudySession: string;
    durationMinutes: string;
    entriesCount: (count: number) => string;
    studiedTime: (duration: string) => string;
    noStudyTimeLogged: string;
    logFirstSession: string;
    noStudyEntriesForDay: string;
    addEntryBtn: string;
  };
  friends: {
    title: string;
    chatTab: string;
    leaderboardTab: string;
    manageTab: string;
    inviteCode: string;
    inviteCodeCopied: string;
    copyBtn: string;
    addFriendTitle: string;
    addFriendInputLabel: string;
    addFriendPlaceholder: string;
    sendRequestBtn: string;
    pendingOutgoing: string;
    pendingIncoming: string;
    acceptBtn: string;
    declineBtn: string;
    noFriendsYet: string;
    searchFriendsPlaceholder: string;
    typingPlaceholder: string;
    leaderboardStudyTime: string;
    leaderboardRank: string;
    guildCardTitle: string;
    guildCardDesc: string;
    setupProfileTitle: string;
    setupProfileDesc: string;
    profileHandleLabel: string;
    profileHandlePlaceholder: string;
    saveProfileBtn: string;
    viewExamsBtn: string;
    friendsExamsTitle: (name: string) => string;
    noUpcomingExams: string;
    blockedUsersTab: string;
    blockUserBtn: string;
    unblockUserBtn: string;
    noBlockedUsers: string;
    emptyChatState: string;
    setupProfileError: string;
    friendRequestSent: (username: string) => string;
    confirmBlockUser: (username: string) => string;
    keysRegenerated: string;
    loggedInAs: (username: string) => string;
    onlyLettersAllowed: string;
    e2eTitle: string;
    e2eDesc: string;
    generatingKeys: string;
    leaderboardTitle: string;
    leaderboardDesc: string;
    youLabel: string;
    noSubjectsLeaderboard: string;
    preparingFor: string;
    noGuildMembers: string;
    decrypting: string;
    decryptError: string;
    conversationsHeader: string;
    noConversations: string;
    backToConversations: string;
    activeConversation: string;
    e2eLocked: string;
    e2eNotice: string;
    sayHello: string;
    searchFriendsHeader: string;
    searchFriendsDesc: string;
    sendInviteBtn: string;
    matchingHandles: string;
    pendingInvitesHeader: string;
    noIncomingRequests: string;
    noSentInvites: string;
    acceptedFriendsHeader: string;
    acceptedFriendsDesc: string;
    e2eActive: string;
    importExamsDesc: string;
    addedToast: string;
    addToCalendarBtn: string;
  };
  subjects: {
    title: string;
    addSubject: string;
    noSubjectsYet: string;
    createSubjectTitle: string;
    editSubjectTitle: string;
    subjectNameLabel: string;
    subjectNamePlaceholder: string;
    subjectIconLabel: string;
    subjectColorLabel: string;
    confirmDeleteSubject: (name: string) => string;
    subjectCreatedToast: string;
    subjectDeletedToast: string;
  };
  settings: {
    title: string;
    accountInfoTitle: string;
    accountInfoDesc: string;
    emailLabel: string;
    notSet: string;
    themeTitle: string;
    themeDesc: string;
    themeLight: string;
    themeDark: string;
    widgetTitle: string;
    widgetDesc: string;
    widgetPosition: string;
    widgetScale: string;
    widgetPreview: string;
    cornerTopLeft: string;
    cornerTopRight: string;
    cornerBottomLeft: string;
    cornerBottomRight: string;
    profileHandleTitle: string;
    profileHandleDesc: string;
    blockedUsersTitle: string;
    blockedUsersDesc: string;
    legalTitle: string;
    privacyBtn: string;
    termsBtn: string;
    privacyPolicyTitle: string;
    termsOfServiceTitle: string;
    privacyPolicyText: string[];
    termsOfServiceText: string[];
    languageTitle: string;
    languageDesc: string;
    languageLabel: string;
    blockedUsersSearchPlaceholder: string;
    blockedUsersUserNotFound: string;
    blockedUsersBlockSuccess: (username: string) => string;
    blockedUsersBlockFailed: string;
    blockedUsersUnblockFailed: string;
    blockedUsersListTitle: string;
    profileHandleMinChars: string;
    profileHandleInvalidChars: string;
    profileHandleTaken: string;
    profileHandleUpdateSuccess: string;
    profileHandleUpdateFailed: string;
    profileHandleSetupRequired: string;
    profileHandleChangeLabel: string;
    profileHandleChecking: string;
    profileHandleAvailable: string;
    profileHandleSaving: string;
    profileHandleUpdateBtn: string;
    themeAccentPrimary: string;
    themeAccentGlow: string;
    themeBgPrimary: string;
    themeBgSecondary: string;
    themeTextPrimary: string;
    themeTextSecondary: string;
    themeCustomTitle: string;
    themeCustomDesc: (mode: "light" | "dark") => string;
    themeResetBtn: string;
    themeEditingLabel: (label: string) => string;
    copyright: (year: number) => string;
  };
  pomodoro: {
    title: string;
    subtitle: string;
    readyStatus: string;
    studyState: string;
    breakState: string;
    startBtn: string;
    pauseBtn: string;
    resetBtn: string;
    stopBtn: string;
    durationSettings: string;
    studyDurationLabel: string;
    breakDurationLabel: string;
    resetMinuterPrompt: string;
    keyboardShortcutsTitle: string;
    keyboardShortcutsDesc: string;
    goalLabel: string;
    continuousLabel: string;
    durationSettingsShortcuts: string;
    timerTitle: string;
    presetClassic: string;
    presetProductive: string;
    presetSprint: string;
    presetContinuous: string;
  };
  analytics: {
    title: string;
    viewAllBtn: string;
    subjectDistributionTitle: string;
    badgesTitle: string;
    badgesDesc: string;
    progressionTitle: string;
    medianLabel: string;
    noStudyData: string;
    linkSubjectsPrompt: string;
    firstSessionTitle: string;
    firstSessionDesc: string;
    studyHoursTitle: string;
    studyHoursDesc: string;
    streak5Title: string;
    streak5Desc: string;
    explorerTitle: string;
    explorerDesc: string;
    productiveTitle: string;
    productiveDesc: string;
    kpiHours: string;
    kpiSessions: string;
    kpiTasks: string;
    kpiStreak: string;
    timeRangeDays: (days: number) => string;
    averageLabel: string;
  };
  landingPage: {
    title: string;
    tagline: string;
    ctaBtn: string;
    signInBtn: string;
    navFeatures: string;
    navInteractiveDemo: string;
    navInteractiveSandbox: string;
    heroTitleLine1: string;
    heroTitleLine2: string;
    heroTitleAccent: string;
    liveSandboxBtn: string;
    mockCalculusExam: string;
    mockChemistryExam: string;
    examDueIn: (days: string) => string;
    mockFriendStatus: string;
    mockFriendActivity: string;
    mockStreakShortUnit: string;
    mockPlannerLevel: string;
    daysUnit: string;
    featuresIntro: string;
    structuredTimetableTitle: string;
    structuredTimetableDesc: string;
    encryptedChatTitle: string;
    encryptedChatDesc: string;
    analyticsTitle: string;
    playgroundTitle: string;
    playgroundDesc: string;
    ctaTitle: string;
    ctaDesc: string;
    footerConvex: string;
    seoTitle: string;
    seoDesc: string;
    demoStreakTitle: string;
    demoStreakLabel: string;
    demoPomodoroTitle: string;
    demoPomodoroAction: string;
    demoChecklistTitle: string;
    demoChecklistDesc: string;
    checklistTasks: string[];
    checklistTag: string;
    checklistProgressLabel: string;
    pomodoroTag: string;
    pomodoroDesc: string;
    pomodoroChemistryLog: string;
    pomodoroCompletedFocusLog: string;
    pomodoroActive: string;
    pomodoroIdle: string;
    pomodoroPause: string;
    pomodoroStart: string;
    pomodoroReset: string;
    pomodoroLoggedSessions: string;
    cryptoTag: string;
    cryptoTitle: string;
    cryptoDesc: string;
    cryptoInitialMessage: string;
    cryptoSender: string;
    cryptoSenderKey: string;
    cryptoRecipient: string;
    cryptoRecipientKey: string;
    cryptoWaiting: string;
    cryptoStagePlain: string;
    cryptoStageEncrypting: string;
    cryptoStageCipher: string;
    cryptoStageTransmitting: string;
    cryptoStageDecrypting: string;
    cryptoStageDone: string;
    cryptoSend: string;
    cryptoClear: string;
    streakTag: string;
    streakTitle: string;
    streakDesc: string;
    streakStatus: string;
    streakLabel: string;
    streakBadgeUnlocked: string;
    streakNextBadge: string;
    streakLogSession: string;
    streakReset: string;
    featuresTitle: string;
    feature1Title: string;
    feature1Desc: string;
    feature2Title: string;
    feature2Desc: string;
    feature3Title: string;
    feature3Desc: string;
    feature4Title: string;
    feature4Desc: string;
    footerText: string;
  };
  auth: {
    title: string;
    desc: string;
    googleBtn: string;
    githubBtn: string;
    backBtn: string;
    invalidCredentialsError: string;
    signUpError: string;
    welcomeBackSubtitle: string;
    createAccountSubtitle: string;
    emailLabel: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    pleaseWait: string;
    signInBtn: string;
    signUpBtn: string;
    toggleSignUpPrompt: string;
    toggleSignInPrompt: string;
    copyright: string;
    forgotPasswordBtn: string;
    resetPasswordTitle: string;
    resetPasswordSubtitle: string;
    codeLabel: string;
    codePlaceholder: string;
    newPasswordLabel: string;
    newPasswordPlaceholder: string;
    sendResetCodeBtn: string;
    resetPasswordBtn: string;
    checkEmailMsg: string;
    passwordResetSuccess: string;
    backToSignIn: string;
  };
}

export const translations: Record<"en" | "fr", TranslationSchema> = {
  en: {
    common: {
      add: "Add",
      edit: "Edit",
      delete: "Delete",
      save: "Save",
      cancel: "Cancel",
      done: "Done",
      close: "Close",
      loading: "Loading...",
      none: "None",
      today: "Today",
      upcoming: "Upcoming",
      completed: "Completed",
      active: "Active",
      status: "Status",
      title: "Title",
      notes: "Notes",
      date: "Date",
      saveChanges: "Save Changes",
      noData: "No data available",
      optional: "optional",
      error: "Error",
      success: "Success",
      uncategorized: "Uncategorized",
      minutesUnit: "min",
      hoursUnit: "h",
      coefficient: "Coefficient",
      grade: "Grade",
      remaining: "remaining",
      send: "Send",
      select: "Select",
      resume: "Resume",
      stop: "Stop",
      pause: "Pause",
      subject: "Subject",
      dateFormatLong: "EEEE, MMMM d, yyyy",
      dateFormatShort: "MMM d",
      dateFormatMedium: "EEEE, MMM d",
    },
    sidebar: {
      dashboard: "Dashboard",
      calendar: "Calendar",
      stats: "Stats & Badges",
      pomodoro: "Pomodoro",
      exams: "Exams",
      tasks: "Tasks",
      dailyLog: "Daily Log",
      friends: "Friends",
      subjects: "Subjects",
      settings: "Settings",
      subtitle: "Stay organized, ace your exams",
      lightMode: "Light Mode",
      darkMode: "Dark Mode",
      signOut: "Sign Out",
      copyright: "Study Calendar",
      expand: "Expand sidebar",
      collapse: "Collapse sidebar",
      switchToFrench: "Passer en Français",
      switchToEnglish: "Switch to English",
    },
    mobileHeader: {
      live: "LIVE",
      paused: "PAUSED",
      openMenu: "Open navigation menu",
    },
    dashboard: {
      title: "Dashboard",
      returnToday: "Back to Today",
      upcomingExams: "Upcoming Exams",
      todaysTasks: "Today's Tasks",
      tasksOfDay: "Tasks of the Day",
      studyStreak: "Study Streak",
      studyTimeToday: "Study Time Today",
      studyTimeDay: "Study Time for Day",
      vsYesterday: "VS Yesterday",
      vsPreviousDay: "VS Previous Day",
      streakDaySingular: "Day",
      streakDayPlural: "Days",
      weeklyActivity: "Weekly Activity",
      subjectsBreakdown: "Subject Breakdown",
      noTasksToday: "No tasks for today",
      noEventsToday: "No events for today",
      generalTasks: "General Tasks",
      noGeneralTasks: "No general tasks pending",
      quickOverview: "Quick Overview",
      noExams: "No upcoming exams",
      noActivityThisWeek: "No study activity logged this week",
      weeklyStudySummary: "Weekly Study Summary",
      vsLastWeek: "vs last week",
      hoverBarDesc: "Hover over a bar to inspect daily study details.",
      hoverColumnsDesc: "Hover over columns to view specific days.",
      todaysEvents: "Today's Events",
      eventsForSelectedDay: "Events for Selected Day",
      noEventsScheduled: "No events scheduled",
      studyLogForSelectedDay: "Study Log for Selected Day",
      noStudyEntriesYetToday: "No study entries yet today",
    },
    calendar: {
      title: "Calendar",
      prevMonth: "Previous Month",
      nextMonth: "Next Month",
      dayDetails: "Day Details",
      events: "Events",
      logs: "Study Logs",
      noLogsForDay: "No study logs for this day.",
      noEventsForDay: "No events scheduled for this day.",
      addEvent: "Add Event",
      editEvent: "Edit Event",
      addLog: "Log Study Session",
      editLog: "Edit Study Log",
      eventTime: "Time",
      eventTitle: "Event Title",
      confirmDeleteEvent: "Are you sure you want to delete this event?",
      confirmDeleteLog: "Are you sure you want to delete this study log?",
      addTaskBtn: "+ Task",
      addEventBtn: "+ Event",
      addLogBtn: "+ Log",
      noTasks: "No tasks",
      noEvents: "No events",
      noLogs: "No study logs",
      moreItems: (count) => `+${count} more`,
      startTimeLabel: "Start Time",
      endTimeLabel: "End Time",
    },
    exams: {
      title: "Exams",
      addExam: "Add Exam",
      createSubjectWarning: "⚠️ Create a subject first in Settings before adding exams.",
      noExamsYet: "No exams yet. Add your first exam above!",
      passed: "Passed",
      today: "Today",
      tomorrow: "Tomorrow",
      daysCount: (days) => `${days} days`,
      enterGradePrompt: "Enter your grade:",
      editExam: "Edit Exam",
      finalExamPlaceholder: "Final Exam",
      selectSubjectPlaceholder: "Select a subject",
      coeffPlaceholder: "Coefficient",
      notesPlaceholder: "Chapters to review...",
      confirmDeleteExam: "Are you sure you want to delete this exam?",
    },
    tasks: {
      title: "Tasks",
      addTask: "Add Task",
      prevDay: "Prev Day",
      nextDay: "Next Day",
      generalTasksTab: "General Tasks",
      dateSpecificTasksTab: "Date-specific Tasks",
      noTasksForDay: "No tasks for this day.",
      noGeneralTasksYet: "No general tasks yet.",
      taskCompletedToast: "Task state toggled successfully",
      editTask: "Edit Task",
      priorityLabel: "Priority",
      priorityLow: "Low",
      priorityMedium: "Medium",
      priorityHigh: "High",
      taskTitlePlaceholder: "Read chapter 4",
      taskNotesPlaceholder: "Add context or descriptions...",
      completedCount: (completed, total) => `${completed}/${total} completed`,
      dailyTab: "Daily",
      generalTab: "General",
      doneTab: "Done",
      generalTasksDesc: "These tasks aren't tied to any specific day: your ongoing to-do list.",
      completedTasksDesc: "Your completed tasks for the selected day and ongoing general backlog.",
      noCompletedTasksYet: "No completed tasks yet",
      dailyTasksCompletedGroup: "📅 Daily Tasks Completed",
      generalTasksCompletedGroup: "📋 General Tasks Completed",
      typeLabel: "Type",
      descriptionLabel: "Description",
      subjectLabelOptional: "Subject (optional)",
      subjectLabel: "Subject",
    },
    dailyLog: {
      title: "Daily Log",
      addLog: "Log Session",
      adjustStudyTime: "Adjust Study Time (minutes)",
      whatDidYouStudy: "What did you study?",
      summaryPlaceholder: "Summarize your study session progress...",
      discard: "Discard",
      saveLog: "Save Log",
      noLogsYet: "No study logs recorded for this day.",
      studyTimeLabel: "Study Time",
      logStudySession: "Log Study Session",
      durationMinutes: "Duration (minutes)",
      entriesCount: (count) => `${count} ${count === 1 ? "entry" : "entries"}`,
      studiedTime: (duration) => `${duration} studied`,
      noStudyTimeLogged: "No study time logged",
      logFirstSession: "Log your first session",
      noStudyEntriesForDay: "No study entries for this day",
      addEntryBtn: "+ Add Entry",
    },
    friends: {
      title: "Friends & Leaderboard",
      chatTab: "💬 Chat",
      leaderboardTab: "🏆 Leaderboard",
      manageTab: "⚙️ Add & Requests",
      inviteCode: "Your invite code:",
      inviteCodeCopied: "Invite code copied to clipboard!",
      copyBtn: "Copy",
      addFriendTitle: "Add Friend by Code",
      addFriendInputLabel: "Friend's Code",
      addFriendPlaceholder: "Enter code...",
      sendRequestBtn: "Send Request",
      pendingOutgoing: "Pending Outgoing Requests",
      pendingIncoming: "Pending Incoming Requests",
      acceptBtn: "Accept",
      declineBtn: "Decline",
      noFriendsYet: "No friends yet. Share your code above!",
      searchFriendsPlaceholder: "Search friends...",
      typingPlaceholder: "Type a message...",
      leaderboardRank: "Rank",
      leaderboardStudyTime: "Study Time (This Week)",
      guildCardTitle: "Academic Guild",
      guildCardDesc: "Study together, share tips, and motivate each other to succeed.",
      setupProfileTitle: "Setup Friends Profile",
      setupProfileDesc: "Choose a handle to enable chat, leaderboard, and study circles.",
      profileHandleLabel: "Choose Username (Handle)",
      profileHandlePlaceholder: "e.g. alex_studying",
      saveProfileBtn: "Activate Profile",
      viewExamsBtn: "View Exams",
      friendsExamsTitle: (name) => `${name}'s Upcoming Exams`,
      noUpcomingExams: "No upcoming exams.",
      blockedUsersTab: "🚫 Blocked Users",
      blockUserBtn: "Block",
      unblockUserBtn: "Unblock",
      noBlockedUsers: "No blocked users.",
      emptyChatState: "Select a friend to start chatting!",
      setupProfileError: "Failed to create profile. Choose a unique username.",
      friendRequestSent: (username) => `Friend request sent to ${username}!`,
      confirmBlockUser: (username) => `Are you sure you want to block ${username}?`,
      keysRegenerated: "Encryption keys regenerated. Messages from previous sessions may not be decryptable.",
      loggedInAs: (username) => `Logged in as ${username}`,
      onlyLettersAllowed: "Only letters, numbers, and underscores allowed. We will automatically prepend '@'.",
      e2eTitle: "🔒 End-to-End Encrypted Messaging",
      e2eDesc: "Creating a profile generates a secure 2048-bit RSA key pair in your browser. All chat messages are cryptographically sealed locally before sending.",
      generatingKeys: "Generating Cryptographic Keys...",
      leaderboardTitle: "Weekly Study Leaderboard",
      leaderboardDesc: "Ranking is based on total study hours logged in the past 7 days.",
      youLabel: "You",
      noSubjectsLeaderboard: "No subjects studied yet this week",
      preparingFor: "Preparing for:",
      noGuildMembers: "No guild members found. Add friends to start competing!",
      decrypting: "🔒 Decrypting...",
      decryptError: "❌ Error decrypting",
      conversationsHeader: "Conversations",
      noConversations: "No accepted friends to message.",
      backToConversations: "Back to conversations list",
      activeConversation: "Active Conversation",
      e2eLocked: "E2EE Locked",
      e2eNotice: "🔒 Messages are encrypted end-to-end.",
      sayHello: "Say hello to start the secure conversation!",
      searchFriendsHeader: "🔍 Search & Add Friends",
      searchFriendsDesc: "Search for other users by typing their username handle.",
      sendInviteBtn: "Send Invite",
      matchingHandles: "Matching handles:",
      pendingInvitesHeader: "✉️ Pending Invites",
      noIncomingRequests: "No incoming requests.",
      noSentInvites: "No sent invites pending.",
      acceptedFriendsHeader: "👥 Accepted Friends",
      acceptedFriendsDesc: "Your friends can compete with you on the leaderboard, send secure chats, and let you import their exam schedules.",
      e2eActive: "🔒 End-to-End Cryptography Active",
      importExamsDesc: "If you share these exams or want to remember when they happen, click 'Add to My Calendar' to copy them directly into your exam list.",
      addedToast: "✓ Added!",
      addToCalendarBtn: "+ Add to My Calendar",
    },
    subjects: {
      title: "Subjects",
      addSubject: "Create Subject",
      noSubjectsYet: "No subjects created yet. Setup subjects to tag your exams, tasks and study logs.",
      createSubjectTitle: "Create Subject",
      editSubjectTitle: "Edit Subject",
      subjectNameLabel: "Subject Name",
      subjectNamePlaceholder: "e.g. Physics II",
      subjectIconLabel: "Subject Icon",
      subjectColorLabel: "Theme Color",
      confirmDeleteSubject: (name) => `Are you sure you want to delete "${name}"? All related study logs, exams, and tasks will lose their subject link.`,
      subjectCreatedToast: "Subject created successfully",
      subjectDeletedToast: "Subject deleted successfully",
    },
    settings: {
      title: "Settings",
      accountInfoTitle: "👤 Account Information",
      accountInfoDesc: "Details associated with your active Study Calendar session.",
      emailLabel: "Email Address",
      notSet: "Not set",
      themeTitle: "🎨 Application Theme",
      themeDesc: "Switch between light and dark themes to optimize viewing comfort.",
      themeLight: "Light Mode",
      themeDark: "Dark Mode",
      widgetTitle: "⏱️ Float Timer Widget",
      widgetDesc: "Configure screen position and scaling for the persistent stopwatch widget.",
      widgetPosition: "Screen Position",
      widgetScale: "Widget Scale",
      widgetPreview: "Preview",
      cornerTopLeft: "Top Left",
      cornerTopRight: "Top Right",
      cornerBottomLeft: "Bottom Left",
      cornerBottomRight: "Bottom Right",
      profileHandleTitle: "🏷️ Friends Profile Handle",
      profileHandleDesc: "Update your public handle to customize how friends see you.",
      blockedUsersTitle: "🚫 Blocked Users Management",
      blockedUsersDesc: "Manage users you have blocked from messaging or adding you.",
      legalTitle: "⚖️ Legal & Compliance",
      privacyBtn: "Privacy Policy",
      termsBtn: "Terms of Service",
      privacyPolicyTitle: "Privacy Policy",
      termsOfServiceTitle: "Terms of Service",
      privacyPolicyText: [
        "Effective Date: June 9, 2026",
        "Your privacy is important to us. This Privacy Policy details how we handle information in the Study Calendar application.",
        "1. Data We Collect: We collect and store your email address (for authentication purposes), and study logs, task lists, calendar events, and academic exams you record.",
        "2. How We Use Data: Your data is processed strictly to display dashboards, track deadlines, aggregate study statistics, and provide core planning utilities.",
        "3. Security & Database: All data is hosted securely within Convex databases. We use secure modern cryptographical methods to ensure user account and token integrity.",
        "4. Deletion Rights: You can request to purge all associated entries, logs, and account records by contacting our support team or deleting them inside settings."
      ],
      termsOfServiceText: [
        "Effective Date: June 9, 2026",
        "Welcome to Study Calendar. By signing up, you agree to these Terms of Service.",
        "1. User License: We grant you a non-commercial, personal, revocable license to plan academic schedules and record study activity.",
        "2. Disclaimer of Warranties: Study Calendar is provided \"as is\" and \"as available\". We do not guarantee that the tool will prevent exam failures or maintain 100% database uptime.",
        "3. Account Termination: We reserve the right to suspend or block access to accounts that violate normal usage patterns or threaten application database stability."
      ],
      languageTitle: "🌐 Language Preference",
      languageDesc: "Choose your preferred interface language.",
      languageLabel: "Application Language",
      blockedUsersSearchPlaceholder: "Block user by @username...",
      blockedUsersUserNotFound: "User not found with this handle.",
      blockedUsersBlockSuccess: (username) => `Successfully blocked ${username}`,
      blockedUsersBlockFailed: "Failed to block user.",
      blockedUsersUnblockFailed: "Failed to unblock: ",
      blockedUsersListTitle: "Blocked List",
      profileHandleMinChars: "Username must be at least 3 characters.",
      profileHandleInvalidChars: "Only letters, numbers, and underscores allowed.",
      profileHandleTaken: "Handle is already taken.",
      profileHandleUpdateSuccess: "Profile handle updated successfully!",
      profileHandleUpdateFailed: "Failed to update profile.",
      profileHandleSetupRequired: "Please set up your profile in the Friends tab to configure your handle.",
      profileHandleChangeLabel: "Change @username",
      profileHandleChecking: "Checking availability…",
      profileHandleAvailable: "Handle is available",
      profileHandleSaving: "Saving...",
      profileHandleUpdateBtn: "Update Handle",
      themeAccentPrimary: "Primary Accent",
      themeAccentGlow: "Button Glow Shadow",
      themeBgPrimary: "App Background",
      themeBgSecondary: "Sidebar & Card Background",
      themeTextPrimary: "Primary Text",
      themeTextSecondary: "Secondary Text",
      themeCustomTitle: "✨ Custom Theme Colors",
      themeCustomDesc: (mode) => `Fine-tune colors for ${mode === "dark" ? "Dark" : "Light"} Mode. Changes apply instantly.`,
      themeResetBtn: "Reset Theme Overrides",
      themeEditingLabel: (label) => `EDITING: ${label}`,
      copyright: (year) => `© ${year} Study Calendar. All rights reserved.`,
    },
    pomodoro: {
      title: "Pomodoro",
      subtitle: "Focus, break, repeat. Optimize your session intervals.",
      readyStatus: "Ready",
      studyState: "💻 Study",
      breakState: "☕ Break",
      startBtn: "▶️ Start Focus",
      pauseBtn: "⏸️ Pause",
      resetBtn: "🔄 Reset",
      stopBtn: "⏹️ Stop & Log",
      durationSettings: "⚙️ Duration Adjustments",
      studyDurationLabel: "💻 Study Duration (Work)",
      breakDurationLabel: "☕ Break Duration (Rest)",
      resetMinuterPrompt: "Would you like to reset the current timer to apply this shortcut?",
      keyboardShortcutsTitle: "💡 Tips",
      keyboardShortcutsDesc: "Use intervals like 25/5 or 50/10 to train focus endurance. If you stop the Work timer, you can log the logged minutes directly into your Daily Log!",
      goalLabel: "Goal",
      continuousLabel: "None (Continuous)",
      durationSettingsShortcuts: "Configuration Presets",
      timerTitle: "Pomodoro Timer",
      presetClassic: "Classic",
      presetProductive: "Productive",
      presetSprint: "Sprint",
      presetContinuous: "Continuous",
    },
    analytics: {
      title: "Stats & Badges",
      viewAllBtn: "✕ View All",
      subjectDistributionTitle: "Subject Distribution",
      badgesTitle: "Badges & Trophies",
      badgesDesc: "Earn badges by completing tasks and logging study sessions.",
      progressionTitle: "Study Time Progression",
      medianLabel: "Median (active days)",
      noStudyData: "No study activity logged yet.",
      linkSubjectsPrompt: "Please tag your study sessions with subjects to see detailed distributions.",
      firstSessionTitle: "First Steps",
      firstSessionDesc: "Log your first study session",
      studyHoursTitle: "Scholar",
      studyHoursDesc: "Accumulate 10 hours of study (600 minutes)",
      streak5Title: "Consistency",
      streak5Desc: "Reach a study streak of 5 consecutive days",
      explorerTitle: "Explorer",
      explorerDesc: "Study 3 different subjects",
      productiveTitle: "Productive",
      productiveDesc: "Complete 10 learning tasks",
      kpiHours: "Study Hours",
      kpiSessions: "Logged Sessions",
      kpiTasks: "Tasks Completed",
      kpiStreak: "Study Streak",
      timeRangeDays: (days) => `${days} Days`,
      averageLabel: "Average",
    },
    landingPage: {
      title: "Study Calendar",
      tagline: "Stay organized, track your study habits, and ace your exams with your friends.",
      ctaBtn: "Get Started Now",
      signInBtn: "Sign In",
      navFeatures: "Features",
      navInteractiveDemo: "Interactive Demo",
      navInteractiveSandbox: "Interactive Sandbox",
      heroTitleLine1: "The tactile study planner,",
      heroTitleLine2: "built for ",
      heroTitleAccent: "digital minds.",
      liveSandboxBtn: "Try Live Sandbox",
      mockCalculusExam: "Calculus II",
      mockChemistryExam: "Organic Chemistry",
      examDueIn: (days) => `In ${days}`,
      mockFriendStatus: "Online",
      mockFriendActivity: "Studying Database Systems",
      mockStreakShortUnit: "d",
      mockPlannerLevel: "Level 4 Planner",
      daysUnit: "Days",
      featuresIntro: "Ditch cluttered text docs and chaotic timers. Keep all aspects of your academic routine in one clean dashboard.",
      structuredTimetableTitle: "Structured Timetable",
      structuredTimetableDesc: "Block out lectures, review blocks, and exam dates on a real-time calendar that syncs instantly across devices.",
      encryptedChatTitle: "End-to-End Encrypted Chat",
      encryptedChatDesc: "Message study partners with military-grade client-side encryption. Server never sees your text; keys are stored locally.",
      analyticsTitle: "Academic Analytics",
      playgroundTitle: "Test-drive the core planner engine",
      playgroundDesc: "Interact with these fully functional mock blocks to see how Study Calendar keeps you on track, directly from the landing page.",
      ctaTitle: "Take Control of Your Semester",
      ctaDesc: "Join students using Study Calendar to structure review sessions, track grades, collaborate safely, and build daily habits.",
      footerConvex: "Real-time database powered by Convex",
      seoTitle: "Study Calendar — The Premium Planner & Productivity Toolkit",
      seoDesc: "A premium study productivity app. Track exams, calendar schedules, tasks, and daily logs, with Pomodoro timers, statistics, and client-side encrypted friend messaging.",
      demoStreakTitle: "Study Streak",
      demoStreakLabel: "Active study streak",
      demoPomodoroTitle: "Pomodoro & Logging Simulator",
      demoPomodoroAction: "Start work session",
      demoChecklistTitle: "Interactive Task Checklist",
      demoChecklistDesc: "Mark off tasks to update your daily progress bar. Satisfaction guaranteed with subtle micro-animations.",
      checklistTasks: [
        "Revise Math formula sheet",
        "Design slide deck draft",
        "Prepare Physics workbook exercise 4",
        "Review SQL database schemas",
      ],
      checklistTag: "Task Checklist",
      checklistProgressLabel: "Daily Completion:",
      pomodoroTag: "Focus Engine",
      pomodoroDesc: "Start the focus session. The 25-minute countdown is accelerated to complete in exactly 25 seconds (1 minute per second) to show the log sync.",
      pomodoroChemistryLog: "Completed Chemistry prep (25m)",
      pomodoroCompletedFocusLog: "Mock Log: Completed Focus Session (25m)",
      pomodoroActive: "🔥 Focus Active (Simulated)",
      pomodoroIdle: "⏱️ Session Idle",
      pomodoroPause: "⏸️ Pause",
      pomodoroStart: "▶️ Start",
      pomodoroReset: "Reset",
      pomodoroLoggedSessions: "Logged Sessions:",
      cryptoTag: "Encryption Block",
      cryptoTitle: "E2E Message Encryptor",
      cryptoDesc: "We use local 2048-bit RSA keys. Test encryption on the browser; watch client text scramble and descramble at recipient side.",
      cryptoInitialMessage: "Let's review the calculus answers together!",
      cryptoSender: "Alice (You)",
      cryptoSenderKey: "RSA Public",
      cryptoRecipient: "Bob (Friend)",
      cryptoRecipientKey: "Bob's Private",
      cryptoWaiting: "Waiting for encryption...",
      cryptoStagePlain: "Pre-encryption",
      cryptoStageEncrypting: "Encrypting RSA-2048 Client-Side...",
      cryptoStageCipher: "Payload Scrambled",
      cryptoStageTransmitting: "Transmitting over Convex SSL...",
      cryptoStageDecrypting: "Decrypting Private Key...",
      cryptoStageDone: "Secure Match Achieved",
      cryptoSend: "Encrypt & Send",
      cryptoClear: "Clear Demo",
      streakTag: "Achievements",
      streakTitle: "Streak & Badge Tracker",
      streakDesc: "Streaks build academic discipline. Test log session to increment your calendar streak and unlock badges.",
      streakStatus: "Streaks status",
      streakLabel: "Streak:",
      streakBadgeUnlocked: "🏆 Unlocked: Academic Champion (5d)",
      streakNextBadge: "Log 1 more session to unlock next badge",
      streakLogSession: "📝 Log Mock Session",
      streakReset: "Reset",
      featuresTitle: "Everything you need to succeed",
      feature1Title: "Smart Planner",
      feature1Desc: "Log study sessions and set tasks linked directly to your exam calendars.",
      feature2Title: "Focus Timers",
      feature2Desc: "Use stopwatches and customized Pomodoro cycles to train focus endurance.",
      feature3Title: "Social Motivation",
      feature3Desc: "Share study leaderboards, chat with peers, and compare schedules.",
      feature4Title: "Analytics & Badges",
      feature4Desc: "Earn trophies as you reach study milestones and monitor subject distributions.",
      footerText: "Designed to make academic scheduling intuitive and rewarding.",
    },
    auth: {
      title: "Get Started",
      desc: "Sign in to Study Calendar using OAuth to begin tracking and studying.",
      googleBtn: "Continue with Google",
      githubBtn: "Continue with GitHub",
      backBtn: "Back to Home",
      invalidCredentialsError: "Invalid email or password.",
      signUpError: "Could not create account. Try a different email.",
      welcomeBackSubtitle: "Welcome back — sign in to continue",
      createAccountSubtitle: "Create your account to get started",
      emailLabel: "Email",
      passwordLabel: "Password",
      passwordPlaceholder: "Min. 8 characters",
      pleaseWait: "Please wait…",
      signInBtn: "Sign In",
      signUpBtn: "Create Account",
      toggleSignUpPrompt: "Don't have an account? Sign up",
      toggleSignInPrompt: "Already have an account? Sign in",
      copyright: "Study Calendar",
      forgotPasswordBtn: "Forgot password?",
      resetPasswordTitle: "Reset Password",
      resetPasswordSubtitle: "Enter your email to request a reset code",
      codeLabel: "Verification Code",
      codePlaceholder: "12345678",
      newPasswordLabel: "New Password",
      newPasswordPlaceholder: "Min. 8 characters",
      sendResetCodeBtn: "Send Reset Code",
      resetPasswordBtn: "Update Password",
      checkEmailMsg: "A verification code has been sent to your email.",
      passwordResetSuccess: "Password reset successfully! You can now sign in.",
      backToSignIn: "Back to Sign In",
    },
  },
  fr: {
    common: {
      add: "Ajouter",
      edit: "Modifier",
      delete: "Supprimer",
      save: "Enregistrer",
      cancel: "Annuler",
      done: "Terminé",
      close: "Fermer",
      loading: "Chargement...",
      none: "Aucune",
      today: "Aujourd'hui",
      upcoming: "À venir",
      completed: "Complété",
      active: "Actif",
      status: "Statut",
      title: "Titre",
      notes: "Remarques",
      date: "Date",
      saveChanges: "Enregistrer les modifications",
      noData: "Aucune donnée disponible",
      optional: "facultatif",
      error: "Erreur",
      success: "Succès",
      uncategorized: "Sans Matière",
      minutesUnit: "min",
      hoursUnit: "h",
      coefficient: "Coefficient",
      grade: "Note",
      remaining: "restantes",
      send: "Envoyer",
      select: "Sélectionner",
      resume: "Reprendre",
      stop: "Arrêter",
      pause: "Pause",
      subject: "Matière",
      dateFormatLong: "EEEE d MMMM yyyy",
      dateFormatShort: "d MMM",
      dateFormatMedium: "EEEE d MMM",
    },
    sidebar: {
      dashboard: "Tableau de bord",
      calendar: "Calendrier",
      stats: "Stats & Badges",
      pomodoro: "Pomodoro",
      exams: "Examens",
      tasks: "Tâches",
      dailyLog: "Journal quotidien",
      friends: "Amis",
      subjects: "Matières",
      settings: "Paramètres",
      subtitle: "Restez organisé, réussissez vos examens",
      lightMode: "Mode Clair",
      darkMode: "Mode Sombre",
      signOut: "Se déconnecter",
      copyright: "Study Calendar",
      expand: "Agrandir la barre latérale",
      collapse: "Réduire la barre latérale",
      switchToFrench: "Passer en Français",
      switchToEnglish: "Switch to English",
    },
    mobileHeader: {
      live: "EN DIRECT",
      paused: "EN PAUSE",
      openMenu: "Ouvrir le menu de navigation",
    },
    dashboard: {
      title: "Tableau de bord",
      returnToday: "Retour à Aujourd'hui",
      upcomingExams: "Examens à venir",
      todaysTasks: "Tâches d'aujourd'hui",
      tasksOfDay: "Tâches du jour",
      studyStreak: "Série d'Études",
      studyTimeToday: "Temps d'étude aujourd'hui",
      studyTimeDay: "Temps d'étude du jour",
      vsYesterday: "VS Hier",
      vsPreviousDay: "VS Jour Précédent",
      streakDaySingular: "Jour",
      streakDayPlural: "Jours",
      weeklyActivity: "Activité Hebdomadaire",
      subjectsBreakdown: "Répartition par Matière",
      noTasksToday: "Aucune tâche pour aujourd'hui",
      noEventsToday: "Aucun événement pour aujourd'hui",
      generalTasks: "Tâches Générales",
      noGeneralTasks: "Aucune tâche générale en attente",
      quickOverview: "Aperçu rapide",
      noExams: "Aucun examen à venir",
      noActivityThisWeek: "Aucune activité d'étude enregistrée cette semaine",
      weeklyStudySummary: "Résumé hebdomadaire d'études",
      vsLastWeek: "vs la semaine dernière",
      hoverBarDesc: "Survolez une barre pour inspecter les détails du jour.",
      hoverColumnsDesc: "Survolez les colonnes pour voir des jours spécifiques.",
      todaysEvents: "Événements d'aujourd'hui",
      eventsForSelectedDay: "Événements du jour",
      noEventsScheduled: "Aucun événement prévu",
      studyLogForSelectedDay: "Journal d'étude du jour",
      noStudyEntriesYetToday: "Aucune session d'étude aujourd'hui",
    },
    calendar: {
      title: "Calendrier",
      prevMonth: "Mois Précédent",
      nextMonth: "Mois Suivant",
      dayDetails: "Détails du Jour",
      events: "Événements",
      logs: "Sessions d'étude",
      noLogsForDay: "Aucune session d'étude pour ce jour.",
      noEventsForDay: "Aucun événement prévu pour ce jour.",
      addEvent: "Ajouter un événement",
      editEvent: "Modifier l'événement",
      addLog: "Enregistrer une session",
      editLog: "Modifier la session",
      eventTime: "Heure",
      eventTitle: "Titre de l'événement",
      confirmDeleteEvent: "Êtes-vous sûr de vouloir supprimer cet événement ?",
      confirmDeleteLog: "Êtes-vous sûr de vouloir supprimer cette session d'étude ?",
      addTaskBtn: "+ Tâche",
      addEventBtn: "+ Événement",
      addLogBtn: "+ Session",
      noTasks: "Aucune tâche",
      noEvents: "Aucun événement",
      noLogs: "Aucune session d'étude",
      moreItems: (count) => `+${count} de plus`,
      startTimeLabel: "Heure de début",
      endTimeLabel: "Heure de fin",
    },
    exams: {
      title: "Examens",
      addExam: "Ajouter un examen",
      createSubjectWarning: "⚠️ Créez d'abord une matière dans les Paramètres avant d'ajouter des examens.",
      noExamsYet: "Pas encore d'examens. Ajoutez votre premier examen ci-dessus !",
      passed: "Passé",
      today: "Aujourd'hui",
      tomorrow: "Demain",
      daysCount: (days) => `${days} jours`,
      enterGradePrompt: "Entrez votre note :",
      editExam: "Modifier l'examen",
      finalExamPlaceholder: "Examen final",
      selectSubjectPlaceholder: "Sélectionnez une matière",
      coeffPlaceholder: "Coefficient",
      notesPlaceholder: "Chapitres à réviser...",
      confirmDeleteExam: "Êtes-vous sûr de vouloir supprimer cet examen ?",
    },
    tasks: {
      title: "Tâches",
      addTask: "Ajouter une tâche",
      prevDay: "Jour Préc.",
      nextDay: "Jour Suiv.",
      generalTasksTab: "Tâches Générales",
      dateSpecificTasksTab: "Tâches par Date",
      noTasksForDay: "Aucune tâche pour ce jour.",
      noGeneralTasksYet: "Aucune tâche générale pour le moment.",
      taskCompletedToast: "État de la tâche mis à jour",
      editTask: "Modifier la tâche",
      priorityLabel: "Priorité",
      priorityLow: "Basse",
      priorityMedium: "Moyenne",
      priorityHigh: "Haute",
      taskTitlePlaceholder: "Lire le chapitre 4",
      taskNotesPlaceholder: "Ajouter du contexte ou des descriptions...",
      completedCount: (completed, total) => `${completed}/${total} complétée(s)`,
      dailyTab: "Quotidien",
      generalTab: "Général",
      doneTab: "Terminé",
      generalTasksDesc: "Ces tâches ne sont pas liées à un jour spécifique : votre liste de choses à faire en cours.",
      completedTasksDesc: "Vos tâches complétées pour le jour sélectionné et le carnet général en cours.",
      noCompletedTasksYet: "Aucune tâche complétée pour le moment",
      dailyTasksCompletedGroup: "📅 Tâches quotidiennes complétées",
      generalTasksCompletedGroup: "📋 Tâches générales complétées",
      typeLabel: "Type",
      descriptionLabel: "Description",
      subjectLabelOptional: "Matière (facultative)",
      subjectLabel: "Matière",
    },
    dailyLog: {
      title: "Journal quotidien",
      addLog: "Loguer Session",
      adjustStudyTime: "Ajuster le temps d'étude (minutes)",
      whatDidYouStudy: "Qu'avez-vous étudié ?",
      summaryPlaceholder: "Résumez les progrès de votre session d'étude...",
      discard: "Abandonner",
      saveLog: "Sauvegarder",
      noLogsYet: "Aucune session d'étude enregistrée pour ce jour.",
      studyTimeLabel: "Temps d'étude",
      logStudySession: "Loguer une session d'étude",
      durationMinutes: "Durée (minutes)",
      entriesCount: (count) => `${count} ${count === 1 ? "session" : "sessions"}`,
      studiedTime: (duration) => `${duration} d'étude`,
      noStudyTimeLogged: "Aucun temps d'étude enregistré",
      logFirstSession: "Loguez votre première session",
      noStudyEntriesForDay: "Aucune session d'étude pour ce jour",
      addEntryBtn: "+ Ajouter une session",
    },
    friends: {
      title: "Amis & Classement",
      chatTab: "💬 Discussion",
      leaderboardTab: "🏆 Classement",
      manageTab: "⚙️ Ajouter & Demandes",
      inviteCode: "Votre code d'invitation :",
      inviteCodeCopied: "Code d'invitation copié dans le presse-papiers !",
      copyBtn: "Copier",
      addFriendTitle: "Ajouter un ami par code",
      addFriendInputLabel: "Code de l'ami",
      addFriendPlaceholder: "Entrez le code...",
      sendRequestBtn: "Envoyer la demande",
      pendingOutgoing: "Demandes envoyées en attente",
      pendingIncoming: "Demandes reçues en attente",
      acceptBtn: "Accepter",
      declineBtn: "Refuser",
      noFriendsYet: "Pas encore d'amis. Partagez votre code ci-dessus !",
      searchFriendsPlaceholder: "Rechercher des amis...",
      typingPlaceholder: "Tapez un message...",
      leaderboardRank: "Rang",
      leaderboardStudyTime: "Temps d'étude (Cette semaine)",
      guildCardTitle: "Guilde Académique",
      guildCardDesc: "Étudiez ensemble, partagez vos conseils et motivez-vous les uns les autres.",
      setupProfileTitle: "Activer le profil d'Amis",
      setupProfileDesc: "Choisissez un nom d'utilisateur pour activer le chat, le classement et les cercles d'études.",
      profileHandleLabel: "Nom d'utilisateur (Handle)",
      profileHandlePlaceholder: "ex: alex_etudes",
      saveProfileBtn: "Activer le profil",
      viewExamsBtn: "Voir les examens",
      friendsExamsTitle: (name) => `Examens à venir de ${name}`,
      noUpcomingExams: "Aucun examen à venir.",
      blockedUsersTab: "🚫 Utilisateurs bloqués",
      blockUserBtn: "Bloquer",
      unblockUserBtn: "Débloquer",
      noBlockedUsers: "Aucun utilisateur bloqué.",
      emptyChatState: "Sélectionnez un ami pour commencer à discuter !",
      setupProfileError: "Impossible de créer le profil. Choisissez un nom d'utilisateur unique.",
      friendRequestSent: (username) => `Demande d'ami envoyée à ${username} !`,
      confirmBlockUser: (username) => `Êtes-vous sûr de vouloir bloquer ${username} ?`,
      keysRegenerated: "Clés de chiffrement régénérées. Les messages des sessions précédentes peuvent ne pas être déchiffrables.",
      loggedInAs: (username) => `Connecté en tant que ${username}`,
      onlyLettersAllowed: "Seuls les lettres, chiffres et underscores sont autorisés. Nous préfixerons automatiquement avec '@'.",
      e2eTitle: "🔒 Messagerie chiffrée de bout en bout",
      e2eDesc: "La création d'un profil génère une paire de clés RSA 2048 bits sécurisée dans votre navigateur. Tous les messages de discussion sont scellés cryptographiquement localement avant d'être envoyés.",
      generatingKeys: "Génération des clés de chiffrement...",
      leaderboardTitle: "Classement hebdomadaire d'études",
      leaderboardDesc: "Le classement est basé sur le total des heures d'étude enregistrées au cours des 7 derniers jours.",
      youLabel: "Vous",
      noSubjectsLeaderboard: "Aucune matière étudiée cette semaine",
      preparingFor: "Prépare :",
      noGuildMembers: "Aucun membre de guilde trouvé. Ajoutez des amis pour commencer à comparer !",
      decrypting: "🔒 Déchiffrement...",
      decryptError: "❌ Échec du déchiffrement",
      conversationsHeader: "Discussions",
      noConversations: "Aucun ami accepté avec qui discuter.",
      backToConversations: "Retour à la liste des discussions",
      activeConversation: "Discussion active",
      e2eLocked: "Chiffré de bout en bout",
      e2eNotice: "🔒 Les messages sont chiffrés de bout en bout.",
      sayHello: "Dites bonjour pour démarrer la discussion sécurisée !",
      searchFriendsHeader: "🔍 Rechercher & ajouter des amis",
      searchFriendsDesc: "Recherchez d'autres utilisateurs en tapant leur nom d'utilisateur.",
      sendInviteBtn: "Envoyer l'invitation",
      matchingHandles: "Noms correspondants :",
      pendingInvitesHeader: "✉️ Invitations en attente",
      noIncomingRequests: "Aucune demande reçue.",
      noSentInvites: "Aucune invitation envoyée en attente.",
      acceptedFriendsHeader: "👥 Amis acceptés",
      acceptedFriendsDesc: "Vos amis peuvent comparer leurs sessions avec vous sur le classement, envoyer des messages sécurisés et vous permettre d'importer leurs examens.",
      e2eActive: "🔒 Chiffrement de bout en bout activé",
      importExamsDesc: "Si vous partagez ces examens ou si vous voulez vous rappeler quand ils ont lieu, cliquez sur 'Ajouter à mon calendrier' pour les copier directement dans votre liste d'examens.",
      addedToast: "✓ Ajouté !",
      addToCalendarBtn: "+ Ajouter à mon calendrier",
    },
    subjects: {
      title: "Matières",
      addSubject: "Créer une matière",
      noSubjectsYet: "Aucune matière créée pour le moment. Configurez des matières pour organiser vos examens, tâches et sessions d'étude.",
      createSubjectTitle: "Créer une matière",
      editSubjectTitle: "Modifier la matière",
      subjectNameLabel: "Nom de la matière",
      subjectNamePlaceholder: "ex: Physique II",
      subjectIconLabel: "Icône de la matière",
      subjectColorLabel: "Couleur du thème",
      confirmDeleteSubject: (name) => `Êtes-vous sûr de vouloir supprimer la matière "${name}" ? Toutes les sessions d'étude, tâches et examens liés perdront leur association.`,
      subjectCreatedToast: "Matière créée avec succès",
      subjectDeletedToast: "Matière supprimée avec succès",
    },
    settings: {
      title: "Paramètres",
      accountInfoTitle: "👤 Informations du compte",
      accountInfoDesc: "Détails associés à votre session Study Calendar active.",
      emailLabel: "Adresse e-mail",
      notSet: "Non définie",
      themeTitle: "🎨 Thème de l'application",
      themeDesc: "Basculez entre le mode clair et sombre pour optimiser le confort visuel.",
      themeLight: "Mode Clair",
      themeDark: "Mode Sombre",
      widgetTitle: "⏱️ Widget de minuteur flottant",
      widgetDesc: "Configurez la position à l'écran et la taille du chronomètre persistant.",
      widgetPosition: "Position à l'écran",
      widgetScale: "Taille du widget",
      widgetPreview: "Aperçu",
      cornerTopLeft: "Haut Gauche",
      cornerTopRight: "Haut Droite",
      cornerBottomLeft: "Bas Gauche",
      cornerBottomRight: "Bas Droite",
      profileHandleTitle: "🏷️ Nom d'utilisateur Amis",
      profileHandleDesc: "Mettez à jour votre nom public pour personnaliser l'affichage auprès de vos amis.",
      blockedUsersTitle: "🚫 Gestion des utilisateurs bloqués",
      blockedUsersDesc: "Gérez les utilisateurs que vous avez bloqués de votre messagerie.",
      legalTitle: "⚖️ Mentions légales",
      privacyBtn: "Politique de confidentialité",
      termsBtn: "Conditions d'utilisation",
      privacyPolicyTitle: "Politique de confidentialité",
      termsOfServiceTitle: "Conditions d'utilisation",
      privacyPolicyText: [
        "Date d'effet : 9 juin 2026",
        "Votre vie privée est importante pour nous. Cette politique détaille la gestion de vos informations dans Study Calendar.",
        "1. Données collectées : Nous stockons votre adresse e-mail (pour l'authentification) ainsi que vos sessions d'étude, tâches, événements et examens.",
        "2. Utilisation : Vos données servent exclusivement à afficher vos statistiques, gérer vos échéances et proposer les fonctionnalités d'organisation.",
        "3. Sécurité : Toutes vos données sont hébergées de manière sécurisée dans les bases de données Convex.",
        "4. Droit de suppression : Vous pouvez demander la suppression complète de vos données et comptes en nous contactant ou via l'application."
      ],
      termsOfServiceText: [
        "Date d'effet : 9 juin 2026",
        "Bienvenue dans Study Calendar. En créant un compte, vous acceptez ces conditions d'utilisation.",
        "1. Licence utilisateur : Nous vous accordons une licence personnelle, non commerciale et révocable pour planifier vos études.",
        "2. Exclusion de garanties : L'application est fournie \"en l'état\". Nous ne garantissons pas de réussite aux examens ni une disponibilité permanente à 100%.",
        "3. Clôture de compte : Nous nous réservons le droit de suspendre les comptes ne respectant pas les règles d'utilisation courante."
      ],
      languageTitle: "🌐 Préférence de langue",
      languageDesc: "Choisissez la langue de l'interface utilisateur.",
      languageLabel: "Langue de l'application",
      blockedUsersSearchPlaceholder: "Bloquer par @username...",
      blockedUsersUserNotFound: "Utilisateur introuvable avec ce nom.",
      blockedUsersBlockSuccess: (username) => `Utilisateur ${username} bloqué.`,
      blockedUsersBlockFailed: "Échec du blocage de l'utilisateur.",
      blockedUsersUnblockFailed: "Échec du déblocage : ",
      blockedUsersListTitle: "Liste des bloqués",
      profileHandleMinChars: "Le nom d'utilisateur doit faire au moins 3 caractères.",
      profileHandleInvalidChars: "Seuls les lettres, chiffres et underscores (_) sont autorisés.",
      profileHandleTaken: "Ce nom d'utilisateur est déjà pris.",
      profileHandleUpdateSuccess: "Nom d'utilisateur mis à jour avec succès !",
      profileHandleUpdateFailed: "Échec de la mise à jour du profil.",
      profileHandleSetupRequired: "Veuillez activer votre profil dans l'onglet Amis pour configurer votre nom d'utilisateur.",
      profileHandleChangeLabel: "Modifier le nom d'utilisateur @",
      profileHandleChecking: "Vérification...",
      profileHandleAvailable: "Le nom d'utilisateur est disponible",
      profileHandleSaving: "Enregistrement...",
      profileHandleUpdateBtn: "Mettre à jour",
      themeAccentPrimary: "Accentuation principale",
      themeAccentGlow: "Ombre brillante des boutons",
      themeBgPrimary: "Arrière-plan de l'application",
      themeBgSecondary: "Arrière-plan des cartes & menus",
      themeTextPrimary: "Texte principal",
      themeTextSecondary: "Texte secondaire",
      themeCustomTitle: "✨ Personnaliser les couleurs",
      themeCustomDesc: (mode) => `Ajustez les couleurs du mode ${mode === "dark" ? "Sombre" : "Clair"}. Appliqué instantanément.`,
      themeResetBtn: "Réinitialiser les couleurs",
      themeEditingLabel: (label) => `MODIFICATION : ${label}`,
      copyright: (year) => `© ${year} Study Calendar. Tous droits réservés.`,
    },
    pomodoro: {
      title: "Pomodoro",
      subtitle: "Concentration, pause, répétez. Optimisez vos intervalles de travail.",
      readyStatus: "Prêt",
      studyState: "💻 Étude",
      breakState: "☕ Pause",
      startBtn: "▶️ Commencer",
      pauseBtn: "⏸️ Pause",
      resetBtn: "🔄 Réinitialiser",
      stopBtn: "⏹️ Arrêter & Enregistrer",
      durationSettings: "⚙️ Réglages des Durées",
      studyDurationLabel: "💻 Temps d'Étude (Travail)",
      breakDurationLabel: "☕ Temps de Pause (Repos)",
      resetMinuterPrompt: "Voulez-vous réinitialiser le minuteur actuel pour appliquer ce raccourci ?",
      keyboardShortcutsTitle: "💡 Conseils",
      keyboardShortcutsDesc: "Utilisez des intervalles de 25/5 ou 50/10 pour entraîner votre endurance de concentration. Lorsque vous arrêtez le minuteur d'Étude, vous pouvez enregistrer directement le temps accumulé dans votre Journal quotidien !",
      goalLabel: "Objectif",
      continuousLabel: "Aucune (Continu)",
      durationSettingsShortcuts: "Raccourcis de Configuration",
      timerTitle: "Minuteur Pomodoro",
      presetClassic: "Classique",
      presetProductive: "Productif",
      presetSprint: "Sprint",
      presetContinuous: "Continu",
    },
    analytics: {
      title: "Statistiques & Badges",
      viewAllBtn: "✕ Voir tout",
      subjectDistributionTitle: "Répartition par Matière",
      badgesTitle: "Badges & Trophées",
      badgesDesc: "Gagnez des badges en complétant vos tâches et en restant régulier dans vos études.",
      progressionTitle: "Progression du Temps d'Étude",
      medianLabel: "Médiane (jours actifs)",
      noStudyData: "Aucune donnée d'étude enregistrée.",
      linkSubjectsPrompt: "Veuillez lier des matières à vos sessions d'études pour voir les détails par matière.",
      firstSessionTitle: "Premier Pas",
      firstSessionDesc: "Loggez votre première session d'étude",
      studyHoursTitle: "Érudit",
      studyHoursDesc: "Cumulez 10 heures d'étude (600 minutes)",
      streak5Title: "Régularité",
      streak5Desc: "Atteignez une série d'étude de 5 jours consécutifs",
      explorerTitle: "Explorateur",
      explorerDesc: "Étudiez 3 matières différentes",
      productiveTitle: "Productif",
      productiveDesc: "Complétez 10 tâches d'apprentissage",
      kpiHours: "Heures d'étude",
      kpiSessions: "Sessions loggées",
      kpiTasks: "Tâches complétées",
      kpiStreak: "Série d'études",
      timeRangeDays: (days) => `${days} Jours`,
      averageLabel: "Moyenne",
    },
    landingPage: {
      title: "Study Calendar",
      tagline: "Restez organisé, suivez vos habitudes d'étude et réussissez vos examens avec vos amis.",
      ctaBtn: "Commencer maintenant",
      signInBtn: "Se connecter",
      navFeatures: "Fonctionnalités",
      navInteractiveDemo: "Démo Interactive",
      navInteractiveSandbox: "Sandbox Interactif",
      heroTitleLine1: "Le planificateur d'études tactile,",
      heroTitleLine2: "conçu pour ",
      heroTitleAccent: "les esprits numériques.",
      liveSandboxBtn: "Tester le Sandbox",
      mockCalculusExam: "Analyse II",
      mockChemistryExam: "Chimie Organique",
      examDueIn: (days) => `Dans ${days}`,
      mockFriendStatus: "En ligne",
      mockFriendActivity: "Étudie les bases de données",
      mockStreakShortUnit: "j",
      mockPlannerLevel: "Planificateur Niveau 4",
      daysUnit: "Jours",
      featuresIntro: "Oubliez les documents désorganisés et les minuteurs chaotiques. Regroupez votre routine académique dans un tableau de bord épuré.",
      structuredTimetableTitle: "Emploi du temps structuré",
      structuredTimetableDesc: "Bloquez les cours, révisions et examens sur un calendrier en temps réel synchronisé instantanément.",
      encryptedChatTitle: "Discussion chiffrée de bout en bout",
      encryptedChatDesc: "Échangez avec vos partenaires d'études avec un chiffrement de bout en bout. Le serveur ne voit jamais vos messages.",
      analyticsTitle: "Analyses Académiques",
      playgroundTitle: "Testez le moteur du planificateur",
      playgroundDesc: "Interagissez avec ces blocs de démonstration fonctionnels pour voir comment Study Calendar vous aide à rester sur la bonne voie.",
      ctaTitle: "Prenez le contrôle de votre semestre",
      ctaDesc: "Rejoignez les étudiants qui utilisent Study Calendar pour organiser leurs révisions, suivre leurs notes et collaborer en toute sécurité.",
      footerConvex: "Base de données en temps réel propulsée par Convex",
      seoTitle: "Study Calendar — Le planificateur d'études premium & boîte à outils de productivité",
      seoDesc: "Une application d'organisation d'études premium. Suivez les examens, les plannings du calendrier, les tâches et les sessions, avec minuteurs Pomodoro, statistiques et messagerie chiffrée.",
      demoStreakTitle: "Série d'études",
      demoStreakLabel: "Jours consécutifs d'études",
      demoPomodoroTitle: "Simulateur Pomodoro",
      demoPomodoroAction: "Lancer la session",
      demoChecklistTitle: "Liste de tâches interactive",
      demoChecklistDesc: "Cochez des tâches pour mettre à jour votre barre de progression. Satisfaction garantie avec des micro-animations subtiles.",
      checklistTasks: [
        "Réviser la fiche de formules mathématiques",
        "Concevoir le brouillon de présentation",
        "Préparer l'exercice 4 de physique",
        "Revoir les schémas de base de données SQL",
      ],
      checklistTag: "Liste de tâches",
      checklistProgressLabel: "Progression journalière :",
      pomodoroTag: "Moteur de Focus",
      pomodoroDesc: "Démarrez la session de focus. Le compte à rebours de 25 minutes est accéléré pour se terminer en 25 secondes pour simuler la synchronisation.",
      pomodoroChemistryLog: "Préparation Chimie terminée (25m)",
      pomodoroCompletedFocusLog: "Session simulée : Focus terminé (25m)",
      pomodoroActive: "🔥 Focus Actif (Simulé)",
      pomodoroIdle: "⏱️ Session inactive",
      pomodoroPause: "⏸️ Pause",
      pomodoroStart: "▶️ Lancer",
      pomodoroReset: "Réinitialiser",
      pomodoroLoggedSessions: "Sessions enregistrées :",
      cryptoTag: "Bloc de chiffrement",
      cryptoTitle: "Chiffrement de message E2E",
      cryptoDesc: "Nous utilisons des clés RSA 2048 bits locales. Testez le chiffrement dans le navigateur ; regardez le texte se brouiller et se déchiffrer.",
      cryptoInitialMessage: "Revoyons les réponses de calcul ensemble !",
      cryptoSender: "Alice (Vous)",
      cryptoSenderKey: "RSA Publique",
      cryptoRecipient: "Bob (Ami)",
      cryptoRecipientKey: "Clé Privée Bob",
      cryptoWaiting: "En attente de chiffrement...",
      cryptoStagePlain: "Pré-chiffrement",
      cryptoStageEncrypting: "Chiffrement RSA-2048 côté client...",
      cryptoStageCipher: "Contenu brouillé",
      cryptoStageTransmitting: "Transmission via Convex SSL...",
      cryptoStageDecrypting: "Déchiffrement clé privée...",
      cryptoStageDone: "Connexion sécurisée établie",
      cryptoSend: "Chiffrer & Envoyer",
      cryptoClear: "Réinitialiser",
      streakTag: "Succès",
      streakTitle: "Suivi de séries & badges",
      streakDesc: "Les séries renforcent la discipline. Testez l'enregistrement d'une session pour incrémenter votre série et déverrouiller des badges.",
      streakStatus: "Statut des Séries",
      streakLabel: "Série :",
      streakBadgeUnlocked: "🏆 Déverrouillé : Champion Académique (5j)",
      streakNextBadge: "Loguez 1 session de plus pour déverrouiller le prochain badge",
      streakLogSession: "📝 Loguer une session simulée",
      streakReset: "Réinitialiser",
      featuresTitle: "Tout ce dont vous avez besoin pour réussir",
      feature1Title: "Planificateur intelligent",
      feature1Desc: "Enregistrez vos sessions d'étude et liez vos tâches directement au calendrier de vos examens.",
      feature2Title: "Minuteurs de concentration",
      feature2Desc: "Utilisez des chronomètres et des cycles Pomodoro pour augmenter votre endurance intellectuelle.",
      feature3Title: "Motivation sociale",
      feature3Desc: "Partagez vos statistiques dans un classement d'amis et discutez en direct.",
      feature4Title: "Statistiques & Badges",
      feature4Desc: "Remportez des trophées à chaque étape franchie et visualisez votre répartition de travail.",
      footerText: "Conçu pour rendre l'organisation académique intuitive et gratifiante.",
    },
    auth: {
      title: "Commencer",
      desc: "Connectez-vous à Study Calendar avec OAuth pour commencer à vous organiser.",
      googleBtn: "Continuer avec Google",
      githubBtn: "Continuer avec GitHub",
      backBtn: "Retour à l'accueil",
      invalidCredentialsError: "E-mail ou mot de passe incorrect.",
      signUpError: "Impossible de créer le compte. Essayez un autre e-mail.",
      welcomeBackSubtitle: "Bon retour — connectez-vous pour continuer",
      createAccountSubtitle: "Créez votre compte pour commencer",
      emailLabel: "E-mail",
      passwordLabel: "Mot de passe",
      passwordPlaceholder: "Min. 8 caractères",
      pleaseWait: "Veuillez patienter…",
      signInBtn: "Se connecter",
      signUpBtn: "Créer un compte",
      toggleSignUpPrompt: "Pas encore de compte ? S'inscrire",
      toggleSignInPrompt: "Déjà un compte ? Se connecter",
      copyright: "Study Calendar",
      forgotPasswordBtn: "Mot de passe oublié ?",
      resetPasswordTitle: "Réinitialiser le mot de passe",
      resetPasswordSubtitle: "Entrez votre e-mail pour demander un code de réinitialisation",
      codeLabel: "Code de vérification",
      codePlaceholder: "12345678",
      newPasswordLabel: "Nouveau mot de passe",
      newPasswordPlaceholder: "Min. 8 caractères",
      sendResetCodeBtn: "Envoyer le code",
      resetPasswordBtn: "Mettre à jour le mot de passe",
      checkEmailMsg: "Un code de vérification a été envoyé à votre e-mail.",
      passwordResetSuccess: "Mot de passe réinitialisé ! Vous pouvez maintenant vous connecter.",
      backToSignIn: "Retour à la connexion",
    },
  },
};
