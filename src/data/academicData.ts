import { AcademicTelemetry, ClassAttendanceRecord, AssignmentRecord, CheckIn, AnomalySeverity } from '../types';

/**
 * Objective Academic Telemetry for CampusPulse Students
 * 
 * Captures real-world institutional signals (RFID turnstile scans, 
 * classroom Bluetooth beacons, and Canvas LMS submission logs)
 * to catch academic collapse and detect survey masking (when students
 * falsely report that they are fine).
 */

export const STUDENT_ACADEMIC_TELEMETRY: Record<string, AcademicTelemetry> = {
  // 1. PRIYA NAMBIAR - CRITICAL LAB CLIFF & UNEXCUSED ABSENCES
  'usr_student_priya': {
    classesAttended: 10,
    totalClassesScheduled: 24,
    attendanceRate: 41.7,
    consecutiveClassesMissed: 4,
    attendanceTrend: 'severely_dropped',
    assignmentsSubmitted: 2,
    totalAssignmentsDue: 7,
    assignmentCompletionRate: 28.6,
    missingAssignmentsCount: 4,
    lateSubmissionsCount: 1,
    objectiveAcademicRisk: 'critical',
    isMaskingSuspected: false, // Priya self-reported severe distress
    maskingConfidence: 0,
    recentClasses: [
      {
        id: 'cls_priya_1',
        courseCode: 'BIOE 310',
        courseName: 'Bio-thermodynamics Lab Practicum',
        date: 'Today, 10:00 AM',
        status: 'absent',
        verificationMethod: 'rfid_turnstile',
        room: 'Lab Pavilion 204'
      },
      {
        id: 'cls_priya_2',
        courseCode: 'NEUR 201',
        courseName: 'Cellular Neurobiology Seminar',
        date: 'Yesterday, 02:00 PM',
        status: 'absent',
        verificationMethod: 'ble_beacon',
        room: 'Hall B'
      },
      {
        id: 'cls_priya_3',
        courseCode: 'BIOE 310',
        courseName: 'Bio-thermodynamics Lecture',
        date: '2 days ago, 11:00 AM',
        status: 'absent',
        verificationMethod: 'seat_sensor',
        room: 'Auditorium 1'
      },
      {
        id: 'cls_priya_4',
        courseCode: 'MATH 240',
        courseName: 'Differential Equations',
        date: '3 days ago, 09:00 AM',
        status: 'absent',
        verificationMethod: 'rfid_turnstile',
        room: 'Hall 102'
      },
      {
        id: 'cls_priya_5',
        courseCode: 'BIOE 280',
        courseName: 'Biomaterials Instrumentation',
        date: '5 days ago, 01:30 PM',
        status: 'present',
        verificationMethod: 'rfid_turnstile',
        room: 'Engineering Lab 4'
      }
    ],
    recentAssignments: [
      {
        id: 'asg_priya_1',
        courseCode: 'BIOE 310',
        title: 'Bioreactor Fluid Dynamics Milestone III',
        dueDate: 'Yesterday, 11:59 PM',
        status: 'overdue_missing',
        grade: '0 / 100 (Unsubmitted)'
      },
      {
        id: 'asg_priya_2',
        courseCode: 'NEUR 201',
        title: 'Synaptic Action Potential Problem Set 4',
        dueDate: '3 days ago, 05:00 PM',
        status: 'overdue_missing',
        grade: '0 / 50 (Unsubmitted)'
      },
      {
        id: 'asg_priya_3',
        courseCode: 'MATH 240',
        title: 'Laplace Transforms Problem Set 6',
        dueDate: '4 days ago, 11:59 PM',
        status: 'overdue_missing',
        grade: '0 / 40 (Unsubmitted)'
      },
      {
        id: 'asg_priya_4',
        courseCode: 'BIOE 310',
        title: 'Lab Report 2: Enzyme Kinetics',
        dueDate: 'Last week',
        submittedAt: 'Last week, 04:15 AM',
        status: 'submitted_late',
        submissionHour: '04:15 AM',
        grade: '62 / 100'
      }
    ]
  },

  // 2. ALEX RIVERA - CS WEED-OUT CRUNCH & NOCTURNAL LATE SUBMISSIONS
  'usr_student_alex': {
    classesAttended: 14,
    totalClassesScheduled: 22,
    attendanceRate: 63.6,
    consecutiveClassesMissed: 2,
    attendanceTrend: 'declining',
    assignmentsSubmitted: 3,
    totalAssignmentsDue: 5,
    assignmentCompletionRate: 60.0,
    missingAssignmentsCount: 2,
    lateSubmissionsCount: 1,
    objectiveAcademicRisk: 'critical',
    isMaskingSuspected: false,
    maskingConfidence: 0,
    recentClasses: [
      {
        id: 'cls_alex_1',
        courseCode: 'CS 180',
        courseName: 'Discrete Mathematics & Logic',
        date: 'Today, 09:00 AM',
        status: 'absent',
        verificationMethod: 'rfid_turnstile',
        room: 'Lecture Hall 1'
      },
      {
        id: 'cls_alex_2',
        courseCode: 'CS 210',
        courseName: 'Computer Systems Architecture',
        date: 'Yesterday, 11:00 AM',
        status: 'late',
        verificationMethod: 'ble_beacon',
        room: 'Turing Hall'
      },
      {
        id: 'cls_alex_3',
        courseCode: 'CS 180',
        courseName: 'Discrete Mathematics Discussion',
        date: '2 days ago, 10:00 AM',
        status: 'absent',
        verificationMethod: 'seat_sensor',
        room: 'Hall 3B'
      },
      {
        id: 'cls_alex_4',
        courseCode: 'ENGL 110',
        courseName: 'Technical Communication in Tech',
        date: '3 days ago, 02:00 PM',
        status: 'present',
        verificationMethod: 'faculty_roster',
        room: 'Liberal Arts 104'
      }
    ],
    recentAssignments: [
      {
        id: 'asg_alex_1',
        courseCode: 'CS 180',
        title: 'Proof Methods & Set Theory Problem Set 5',
        dueDate: 'Yesterday, 11:59 PM',
        status: 'overdue_missing',
        grade: '0 / 100'
      },
      {
        id: 'asg_alex_2',
        courseCode: 'CS 210',
        title: 'C Memory Allocator Kernel Project',
        dueDate: '2 days ago, 11:59 PM',
        status: 'overdue_missing',
        grade: '0 / 100'
      },
      {
        id: 'asg_alex_3',
        courseCode: 'CS 180',
        title: 'Induction & Graph Theory Lab 4',
        dueDate: '4 days ago',
        submittedAt: '4 days ago, 03:45 AM',
        status: 'submitted_late',
        submissionHour: '03:45 AM',
        grade: '78 / 100'
      },
      {
        id: 'asg_alex_4',
        courseCode: 'ENGL 110',
        title: 'Engineering Ethics Memo',
        dueDate: 'Last week',
        submittedAt: 'Last week, 10:15 PM',
        status: 'submitted_on_time',
        grade: '92 / 100'
      }
    ]
  },

  // 3. LIAM VANCE - ARCHITECTURE STUDIO DISENGAGEMENT
  'usr_student_liam': {
    classesAttended: 9,
    totalClassesScheduled: 20,
    attendanceRate: 45.0,
    consecutiveClassesMissed: 3,
    attendanceTrend: 'severely_dropped',
    assignmentsSubmitted: 1,
    totalAssignmentsDue: 4,
    assignmentCompletionRate: 25.0,
    missingAssignmentsCount: 3,
    lateSubmissionsCount: 1,
    objectiveAcademicRisk: 'critical',
    isMaskingSuspected: false,
    maskingConfidence: 0,
    recentClasses: [
      {
        id: 'cls_liam_1',
        courseCode: 'ARCH 201',
        courseName: 'Design Studio IV - In-Person Critiques',
        date: 'Today, 01:00 PM',
        status: 'absent',
        verificationMethod: 'rfid_turnstile',
        room: 'Studio Atrium B'
      },
      {
        id: 'cls_liam_2',
        courseCode: 'ARCH 201',
        courseName: 'Design Studio IV - Fabrication Workshop',
        date: 'Yesterday, 09:00 AM',
        status: 'absent',
        verificationMethod: 'rfid_turnstile',
        room: 'Model Lab 1'
      },
      {
        id: 'cls_liam_3',
        courseCode: 'ENVD 220',
        courseName: 'Environmental Systems in Architecture',
        date: '2 days ago, 03:00 PM',
        status: 'absent',
        verificationMethod: 'ble_beacon',
        room: 'Hall 201'
      }
    ],
    recentAssignments: [
      {
        id: 'asg_liam_1',
        courseCode: 'ARCH 201',
        title: 'Mid-term Parametric Pavilion Model',
        dueDate: 'Yesterday, 05:00 PM',
        status: 'overdue_missing',
        grade: '0 / 150 (Critique Missed)'
      },
      {
        id: 'asg_liam_2',
        courseCode: 'ENVD 220',
        title: 'Solar Insolation Climate Study',
        dueDate: '3 days ago, 11:59 PM',
        status: 'overdue_missing',
        grade: '0 / 100'
      },
      {
        id: 'asg_liam_3',
        courseCode: 'ARCH 201',
        title: 'Site Analysis & Section Drawings',
        dueDate: '5 days ago',
        submittedAt: '5 days ago, 04:38 AM',
        status: 'submitted_late',
        submissionHour: '04:38 AM',
        grade: '70 / 100'
      }
    ]
  },

  // 4. TAYLOR REED - PRE-MED EXAM PANIC & RECURRENT MIDNIGHT CRAMS
  'usr_student_taylor': {
    classesAttended: 16,
    totalClassesScheduled: 22,
    attendanceRate: 72.7,
    consecutiveClassesMissed: 2,
    attendanceTrend: 'declining',
    assignmentsSubmitted: 5,
    totalAssignmentsDue: 6,
    assignmentCompletionRate: 83.3,
    missingAssignmentsCount: 1,
    lateSubmissionsCount: 2,
    objectiveAcademicRisk: 'high',
    isMaskingSuspected: false,
    maskingConfidence: 0,
    recentClasses: [
      {
        id: 'cls_taylor_1',
        courseCode: 'CHEM 230',
        courseName: 'Organic Chemistry II Lecture',
        date: 'Today, 08:30 AM',
        status: 'absent',
        verificationMethod: 'rfid_turnstile',
        room: 'Chemistry Hall 101'
      },
      {
        id: 'cls_taylor_2',
        courseCode: 'BIOL 215',
        courseName: 'Genetics & Genomics',
        date: 'Yesterday, 10:00 AM',
        status: 'absent',
        verificationMethod: 'seat_sensor',
        room: 'Auditorium 2'
      },
      {
        id: 'cls_taylor_3',
        courseCode: 'CHEM 231',
        courseName: 'Organic Chemistry Lab Practicum',
        date: '2 days ago, 01:00 PM',
        status: 'present',
        verificationMethod: 'faculty_roster',
        room: 'Organic Chem Lab'
      }
    ],
    recentAssignments: [
      {
        id: 'asg_taylor_1',
        courseCode: 'CHEM 230',
        title: 'Stereochemistry & NMR Spectroscopy Problem Set 6',
        dueDate: 'Yesterday, 11:59 PM',
        status: 'overdue_missing',
        grade: '0 / 100'
      },
      {
        id: 'asg_taylor_2',
        courseCode: 'BIOL 215',
        title: 'Mendelian Recombination Case Study',
        dueDate: '3 days ago',
        submittedAt: '3 days ago, 04:12 AM',
        status: 'submitted_late',
        submissionHour: '04:12 AM',
        grade: '88 / 100'
      },
      {
        id: 'asg_taylor_3',
        courseCode: 'CHEM 231',
        title: 'Grignard Reaction Formal Lab Writeup',
        dueDate: 'Last week',
        submittedAt: 'Last week, 03:55 AM',
        status: 'submitted_late',
        submissionHour: '03:55 AM',
        grade: '85 / 100'
      }
    ]
  },

  // 5. DEVON BROOKS - DATA SCIENCE CYCLIC LMS REFRESHES & MISSING WORK
  'usr_student_devon': {
    classesAttended: 12,
    totalClassesScheduled: 20,
    attendanceRate: 60.0,
    consecutiveClassesMissed: 3,
    attendanceTrend: 'severely_dropped',
    assignmentsSubmitted: 2,
    totalAssignmentsDue: 5,
    assignmentCompletionRate: 40.0,
    missingAssignmentsCount: 3,
    lateSubmissionsCount: 1,
    objectiveAcademicRisk: 'critical',
    isMaskingSuspected: false,
    maskingConfidence: 0,
    recentClasses: [
      {
        id: 'cls_devon_1',
        courseCode: 'STAT 200',
        courseName: 'Applied Probability & Statistics',
        date: 'Today, 10:00 AM',
        status: 'absent',
        verificationMethod: 'rfid_turnstile',
        room: 'Math & Stats Hall'
      },
      {
        id: 'cls_devon_2',
        courseCode: 'CS 106',
        courseName: 'Data Structures with Python',
        date: 'Yesterday, 02:00 PM',
        status: 'absent',
        verificationMethod: 'ble_beacon',
        room: 'Lab 103'
      },
      {
        id: 'cls_devon_3',
        courseCode: 'STAT 200',
        courseName: 'R Programming Discussion',
        date: '2 days ago, 09:00 AM',
        status: 'absent',
        verificationMethod: 'seat_sensor',
        room: 'Hall C'
      }
    ],
    recentAssignments: [
      {
        id: 'asg_devon_1',
        courseCode: 'STAT 200',
        title: 'Hypothesis Testing & ANOVA Notebook',
        dueDate: 'Yesterday, 11:59 PM',
        status: 'overdue_missing',
        grade: '0 / 100'
      },
      {
        id: 'asg_devon_2',
        courseCode: 'CS 106',
        title: 'Binary Search Trees & Hash Maps Project',
        dueDate: '3 days ago, 11:59 PM',
        status: 'overdue_missing',
        grade: '0 / 100'
      },
      {
        id: 'asg_devon_3',
        courseCode: 'MATH 115',
        title: 'Linear Algebra Matrix Factorization',
        dueDate: '5 days ago, 05:00 PM',
        status: 'overdue_missing',
        grade: '0 / 50'
      }
    ]
  },

  // 6. JORDAN HAYES - ISOLATION & ACCUMULATING UNEXCUSED ABSENCES
  'usr_student_jordan': {
    classesAttended: 13,
    totalClassesScheduled: 22,
    attendanceRate: 59.1,
    consecutiveClassesMissed: 3,
    attendanceTrend: 'declining',
    assignmentsSubmitted: 3,
    totalAssignmentsDue: 6,
    assignmentCompletionRate: 50.0,
    missingAssignmentsCount: 2,
    lateSubmissionsCount: 1,
    objectiveAcademicRisk: 'high',
    isMaskingSuspected: false,
    maskingConfidence: 0,
    recentClasses: [
      {
        id: 'cls_jordan_1',
        courseCode: 'ECON 202',
        courseName: 'Microeconomic Theory II',
        date: 'Yesterday, 09:00 AM',
        status: 'absent',
        verificationMethod: 'rfid_turnstile',
        room: 'Social Sciences Hall'
      },
      {
        id: 'cls_jordan_2',
        courseCode: 'POLI 150',
        courseName: 'Public Policy Analysis',
        date: '2 days ago, 11:30 AM',
        status: 'absent',
        verificationMethod: 'ble_beacon',
        room: 'Hall 3'
      },
      {
        id: 'cls_jordan_3',
        courseCode: 'ECON 202',
        courseName: 'Microeconomic Problem Session',
        date: '3 days ago, 08:30 AM',
        status: 'absent',
        verificationMethod: 'seat_sensor',
        room: 'Hall 1B'
      }
    ],
    recentAssignments: [
      {
        id: 'asg_jordan_1',
        courseCode: 'ECON 202',
        title: 'Utility Maximization & Elasticity Essay',
        dueDate: '2 days ago, 11:59 PM',
        status: 'overdue_missing',
        grade: '0 / 100'
      },
      {
        id: 'asg_jordan_2',
        courseCode: 'POLI 150',
        title: 'Policy Brief: Municipal Transit Funding',
        dueDate: '4 days ago, 05:00 PM',
        status: 'overdue_missing',
        grade: '0 / 75'
      }
    ]
  },

  // 7. SAMIRA PATEL - CIRCADIAN INVERSION (MORNING CLASS CASUALTY)
  'usr_student_samira': {
    classesAttended: 14,
    totalClassesScheduled: 22,
    attendanceRate: 63.6,
    consecutiveClassesMissed: 2,
    attendanceTrend: 'declining',
    assignmentsSubmitted: 4,
    totalAssignmentsDue: 6,
    assignmentCompletionRate: 66.7,
    missingAssignmentsCount: 2,
    lateSubmissionsCount: 1,
    objectiveAcademicRisk: 'moderate',
    isMaskingSuspected: false,
    maskingConfidence: 0,
    recentClasses: [
      {
        id: 'cls_samira_1',
        courseCode: 'ECON 101',
        courseName: 'Principles of Economics (08:30 AM)',
        date: '2 days ago, 08:30 AM',
        status: 'absent',
        verificationMethod: 'rfid_turnstile',
        room: 'Main Quad Auditorium'
      },
      {
        id: 'cls_samira_2',
        courseCode: 'ECON 101',
        courseName: 'Principles of Economics (08:30 AM)',
        date: '4 days ago, 08:30 AM',
        status: 'absent',
        verificationMethod: 'rfid_turnstile',
        room: 'Main Quad Auditorium'
      },
      {
        id: 'cls_samira_3',
        courseCode: 'DATA 101',
        courseName: 'Introduction to Data Analytics (02:00 PM)',
        date: 'Yesterday, 02:00 PM',
        status: 'present',
        verificationMethod: 'ble_beacon',
        room: 'Analytics Lab 1'
      }
    ],
    recentAssignments: [
      {
        id: 'asg_samira_1',
        courseCode: 'ECON 101',
        title: 'Early Morning In-Class Quiz #4',
        dueDate: '2 days ago, 09:00 AM',
        status: 'overdue_missing',
        grade: '0 / 25'
      },
      {
        id: 'asg_samira_2',
        courseCode: 'DATA 101',
        title: 'Tableau Visualization Exercise 3',
        dueDate: '3 days ago, 11:59 PM',
        status: 'overdue_missing',
        grade: '0 / 50'
      }
    ]
  },

  // 8. ZOE MARTINEZ - THE PREMIER "MASKING & FEIGNED WELLNESS" SHOWCASE!
  // Student submitted a 8.5/10 mood check-in ("Doing wonderful, feeling great!"),
  // but objective sensors caught 36.4% attendance and 3 missing assignments!
  'usr_student_zoe': {
    classesAttended: 8,
    totalClassesScheduled: 22,
    attendanceRate: 36.4,
    consecutiveClassesMissed: 5,
    attendanceTrend: 'severely_dropped',
    assignmentsSubmitted: 1,
    totalAssignmentsDue: 5,
    assignmentCompletionRate: 20.0,
    missingAssignmentsCount: 3,
    lateSubmissionsCount: 1,
    objectiveAcademicRisk: 'critical',
    isMaskingSuspected: true, // TRIGGERED: High mood vs objective failure
    maskingConfidence: 96,
    maskingReason: 'SURVEY MASKING DETECTED: Student reported 8.5/10 mood ("everything great"), but objective university telemetry records 36.4% class attendance (5 consecutive missed lectures) and 3 overdue assignments. Immediate clinical welfare review recommended.',
    recentClasses: [
      {
        id: 'cls_zoe_1',
        courseCode: 'POLI 210',
        courseName: 'Comparative Political Institutions',
        date: 'Today, 10:00 AM',
        status: 'absent',
        verificationMethod: 'rfid_turnstile',
        room: 'Social Sciences 104'
      },
      {
        id: 'cls_zoe_2',
        courseCode: 'ECON 201',
        courseName: 'Macroeconomic Analysis',
        date: 'Yesterday, 01:30 PM',
        status: 'absent',
        verificationMethod: 'ble_beacon',
        room: 'Hall 2A'
      },
      {
        id: 'cls_zoe_3',
        courseCode: 'POLI 240',
        courseName: 'International Law Seminar',
        date: '2 days ago, 11:00 AM',
        status: 'absent',
        verificationMethod: 'seat_sensor',
        room: 'Law Center 12'
      },
      {
        id: 'cls_zoe_4',
        courseCode: 'ECON 201',
        courseName: 'Macroeconomic Discussion Group',
        date: '3 days ago, 03:00 PM',
        status: 'absent',
        verificationMethod: 'rfid_turnstile',
        room: 'Hall 2A'
      },
      {
        id: 'cls_zoe_5',
        courseCode: 'POLI 210',
        courseName: 'Comparative Political Institutions',
        date: '4 days ago, 10:00 AM',
        status: 'absent',
        verificationMethod: 'rfid_turnstile',
        room: 'Social Sciences 104'
      }
    ],
    recentAssignments: [
      {
        id: 'asg_zoe_1',
        courseCode: 'POLI 210',
        title: 'Democratic Backsliding Research Essay',
        dueDate: 'Yesterday, 11:59 PM',
        status: 'overdue_missing',
        grade: '0 / 100'
      },
      {
        id: 'asg_zoe_2',
        courseCode: 'ECON 201',
        title: 'Monetary Policy & Inflation Modeling Set',
        dueDate: '3 days ago, 05:00 PM',
        status: 'overdue_missing',
        grade: '0 / 75'
      },
      {
        id: 'asg_zoe_3',
        courseCode: 'POLI 240',
        title: 'Treaty Interpretation Brief #2',
        dueDate: '5 days ago, 11:59 PM',
        status: 'overdue_missing',
        grade: '0 / 50'
      },
      {
        id: 'asg_zoe_4',
        courseCode: 'HIST 120',
        title: 'Early Modern European History Essay',
        dueDate: 'Last week',
        submittedAt: 'Last week, 11:45 PM',
        status: 'submitted_on_time',
        grade: '82 / 100'
      }
    ]
  },

  // 9. MARCUS CHEN - STABLE BENCHMARK
  'usr_student_marcus': {
    classesAttended: 23,
    totalClassesScheduled: 24,
    attendanceRate: 95.8,
    consecutiveClassesMissed: 0,
    attendanceTrend: 'stable',
    assignmentsSubmitted: 7,
    totalAssignmentsDue: 7,
    assignmentCompletionRate: 100.0,
    missingAssignmentsCount: 0,
    lateSubmissionsCount: 0,
    objectiveAcademicRisk: 'low',
    isMaskingSuspected: false,
    maskingConfidence: 0,
    recentClasses: [
      {
        id: 'cls_marcus_1',
        courseCode: 'ME 250',
        courseName: 'Machine Design & Kinematics',
        date: 'Today, 09:00 AM',
        status: 'present',
        verificationMethod: 'rfid_turnstile',
        room: 'Engineering Hall 301'
      },
      {
        id: 'cls_marcus_2',
        courseCode: 'ME 270',
        courseName: 'Fluid Mechanics & Thermodynamics',
        date: 'Yesterday, 11:00 AM',
        status: 'present',
        verificationMethod: 'ble_beacon',
        room: 'Lecture Hall A'
      }
    ],
    recentAssignments: [
      {
        id: 'asg_marcus_1',
        courseCode: 'ME 250',
        title: 'Gear Train & Cam Profile Design Project',
        dueDate: 'Yesterday, 11:59 PM',
        submittedAt: 'Yesterday, 07:30 PM',
        status: 'submitted_on_time',
        grade: '98 / 100'
      },
      {
        id: 'asg_marcus_2',
        courseCode: 'ME 270',
        title: 'Navier-Stokes Computational Problem Set',
        dueDate: '3 days ago, 05:00 PM',
        submittedAt: '3 days ago, 04:15 PM',
        status: 'submitted_on_time',
        grade: '94 / 100'
      }
    ]
  },

  // 10. CHLOE BENNET - SENIOR THESIS PACING STABLE
  'usr_student_chloe': {
    classesAttended: 20,
    totalClassesScheduled: 22,
    attendanceRate: 90.9,
    consecutiveClassesMissed: 0,
    attendanceTrend: 'stable',
    assignmentsSubmitted: 6,
    totalAssignmentsDue: 6,
    assignmentCompletionRate: 100.0,
    missingAssignmentsCount: 0,
    lateSubmissionsCount: 0,
    objectiveAcademicRisk: 'low',
    isMaskingSuspected: false,
    maskingConfidence: 0,
    recentClasses: [
      {
        id: 'cls_chloe_1',
        courseCode: 'LIT 401',
        courseName: 'Senior Capstone Colloquium',
        date: 'Yesterday, 02:00 PM',
        status: 'present',
        verificationMethod: 'faculty_roster',
        room: 'Humanities 204'
      },
      {
        id: 'cls_chloe_2',
        courseCode: 'LIT 380',
        courseName: 'Postcolonial Narratives Seminar',
        date: '3 days ago, 10:00 AM',
        status: 'present',
        verificationMethod: 'ble_beacon',
        room: 'Hall 4B'
      }
    ],
    recentAssignments: [
      {
        id: 'asg_chloe_1',
        courseCode: 'LIT 401',
        title: 'Senior Thesis Annotated Bibliography & Chapter 1 Draft',
        dueDate: '2 days ago, 11:59 PM',
        submittedAt: '2 days ago, 08:45 PM',
        status: 'submitted_on_time',
        grade: '95 / 100'
      }
    ]
  }
};

/**
 * Intelligent Objective Flagging & Masking Detection Engine
 * 
 * Compares subjective self-reported surveys against hard campus telemetry.
 * If a student reports feeling "Fine / Great" while failing classes or missing 
 * work, this flags them for counselor review despite their survey response.
 */
export function evaluateAcademicTelemetryAndMasking(
  checkin: CheckIn,
  telemetry: AcademicTelemetry
): {
  isMaskingSuspected: boolean;
  maskingConfidence: number;
  maskingReason?: string;
  objectiveAcademicRisk: AnomalySeverity;
  computedAnomalyScore: number;
} {
  const attendanceRate = telemetry.attendanceRate;
  const missedConsecutive = telemetry.consecutiveClassesMissed;
  const missingAssignments = telemetry.missingAssignmentsCount;
  const moodScore = checkin.moodScore;
  const reportedPressure = checkin.academicPressure;

  // 1. Calculate Objective Academic Risk
  let objectiveRisk: AnomalySeverity = 'low';
  if (missedConsecutive >= 4 || attendanceRate < 50 || missingAssignments >= 3) {
    objectiveRisk = 'critical';
  } else if (missedConsecutive >= 2 || attendanceRate < 70 || missingAssignments >= 2) {
    objectiveRisk = 'high';
  } else if (attendanceRate < 80 || missingAssignments >= 1 || telemetry.lateSubmissionsCount >= 2) {
    objectiveRisk = 'moderate';
  }

  // 2. Evaluate Survey Masking / Feigned Wellness
  // Student claims positive or neutral state, yet objective data is crashing
  const claimsWellness = moodScore >= 6.0 && reportedPressure <= 5.5;
  const hasObjectiveCrisis = objectiveRisk === 'critical' || objectiveRisk === 'high';

  let isMasking = false;
  let maskingConfidence = 0;
  let maskingReason: string | undefined;

  if (claimsWellness && hasObjectiveCrisis) {
    isMasking = true;
    maskingConfidence = Math.min(98, Math.round(75 + (missingAssignments * 5) + (missedConsecutive * 4)));
    maskingReason = `SURVEY MASKING DETECTED: Student reported positive wellbeing (Mood ${moodScore.toFixed(1)}/10, Pressure ${reportedPressure.toFixed(1)}/10), but university telemetry records ${attendanceRate.toFixed(0)}% attendance (${missedConsecutive} consecutive missed lectures) and ${missingAssignments} overdue assignments. High probability of concealed distress.`;
  }

  // 3. Calculate Composite Anomaly Score including Objective Weight
  let baseScore = 20;
  if (objectiveRisk === 'critical') baseScore = 85;
  else if (objectiveRisk === 'high') baseScore = 70;
  else if (objectiveRisk === 'moderate') baseScore = 50;

  if (isMasking) {
    baseScore = Math.max(baseScore, 91);
  }

  return {
    isMaskingSuspected: isMasking,
    maskingConfidence,
    maskingReason,
    objectiveAcademicRisk: objectiveRisk,
    computedAnomalyScore: baseScore
  };
}
