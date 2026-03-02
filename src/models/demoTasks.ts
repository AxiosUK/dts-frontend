import type Task from "./task";

function daysFrom(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

function hoursFrom(base: Date, hours: number): Date {
  const d = new Date(base);
  d.setHours(d.getHours() + hours);
  return d;
}

/**
 * Generates a realistic set of demo tasks for a case worker-style workflow.
 *
 * Note: `Task` uses `Date` fields (not ISO strings), so this data is intended
 * to be used in-memory on the frontend.
 */
export function createDemoTasks(baseDate: Date = new Date()): Task[] {
  // Make the demo dates stable within a given run.
  const now = new Date(baseDate);

  return [
    {
      _id: "demo-001",
      title: "Review new referral and triage priority",
      description:
        "Read referral notes, identify urgent safeguarding indicators, and assign an initial priority level.",
      status: "in progress",
      dueDate: daysFrom(now, 1),
      createdAt: daysFrom(now, -3),
      modifiedAt: daysFrom(now, -1),
    },
    {
      _id: "demo-002",
      title: "Contact parent/guardian for consent",
      description:
        "Phone call + follow-up email to confirm consent for information sharing and appointments.",
      status: "pending",
      dueDate: daysFrom(now, 2),
      createdAt: daysFrom(now, -2),
      modifiedAt: daysFrom(now, -2),
    },
    {
      _id: "demo-003",
      title: "Schedule initial meeting with student",
      description:
        "Book a 30-minute check-in during pastoral time; confirm room availability and notify tutor.",
      status: "pending",
      dueDate: daysFrom(now, 3),
      createdAt: daysFrom(now, -2),
      modifiedAt: daysFrom(now, -2),
    },
    {
      _id: "demo-004",
      title: "Request and log supporting documents",
      description:
        "Gather attendance summary, behaviour points, and recent assessment results; attach to case record.",
      status: "in progress",
      dueDate: daysFrom(now, 4),
      createdAt: daysFrom(now, -6),
      modifiedAt: daysFrom(now, -1),
    },
    {
      _id: "demo-005",
      title: "Update safety/risk assessment",
      description:
        "Complete the risk checklist based on referral details and any disclosures; escalate if required.",
      status: "pending",
      dueDate: daysFrom(now, 1),
      createdAt: daysFrom(now, -1),
      modifiedAt: daysFrom(now, -1),
    },
    {
      _id: "demo-006",
      title: "Write case note from initial contact",
      description:
        "Record date/time, summary of conversation, actions agreed, and next steps.",
      status: "completed",
      dueDate: daysFrom(now, -1),
      createdAt: daysFrom(now, -7),
      modifiedAt: daysFrom(now, -5),
    },
    {
      _id: "demo-007",
      title: "Develop draft support plan",
      description:
        "Create a short-term plan with goals, strategies, responsible staff, and review date.",
      status: "pending",
      dueDate: daysFrom(now, 7),
      createdAt: daysFrom(now, -1),
      modifiedAt: daysFrom(now, -1),
    },
    {
      _id: "demo-008",
      title: "Coordinate external agency referral",
      description:
        "Prepare referral summary and send to appropriate service; track acknowledgement and appointment details.",
      status: "pending",
      dueDate: daysFrom(now, 10),
      createdAt: daysFrom(now, -1),
      modifiedAt: daysFrom(now, -1),
    },
    {
      _id: "demo-009",
      title: "Prepare agenda for multi-agency meeting",
      description:
        "Draft agenda items, compile key updates, and circulate to attendees 24 hours beforehand.",
      status: "in progress",
      dueDate: daysFrom(now, 5),
      createdAt: daysFrom(now, -4),
      modifiedAt: hoursFrom(now, -6),
    },
    {
      _id: "demo-010",
      title: "Follow up after appointment",
      description:
        "Check outcomes, update case record, and confirm next actions with the student and guardian.",
      status: "pending",
      dueDate: daysFrom(now, 14),
      createdAt: daysFrom(now, 0),
      modifiedAt: daysFrom(now, 0),
    },
  ];
}

export const demoTasks: Task[] = createDemoTasks(new Date());
