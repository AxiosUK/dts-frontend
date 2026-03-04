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
 * Generates a realistic set of demo tasks for an HMCTS-style administrative workflow.
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
      title: "Validate new online submission (case initiation)",
      description:
        "Check mandatory fields, party details, and attached documents; return to applicant if information is missing.",
      status: "in progress",
      dueDate: hoursFrom(now, 6),
      createdAt: daysFrom(now, -2),
      modifiedAt: hoursFrom(now, -2),
    },
    {
      _id: "demo-002",
      title: "Check fee payment / remission evidence",
      description:
        "Confirm payment reference or fee remission evidence is present and readable; record outcome in the case file.",
      status: "pending",
      dueDate: daysFrom(now, 1),
      createdAt: daysFrom(now, -1),
      modifiedAt: daysFrom(now, -1),
    },
    {
      _id: "demo-003",
      title: "Create hearing listing request",
      description:
        "Request suitable listing slot, courtroom/venue (or remote hearing), and estimate time needed; include interpreter needs if provided.",
      status: "pending",
      dueDate: daysFrom(now, 3),
      createdAt: daysFrom(now, -2),
      modifiedAt: daysFrom(now, -2),
    },
    {
      _id: "demo-004",
      title: "Check service/contact details for all parties",
      description:
        "Verify email/postal addresses and representation details; flag any missing information for follow-up to support timely notifications.",
      status: "in progress",
      dueDate: daysFrom(now, 2),
      createdAt: daysFrom(now, -5),
      modifiedAt: hoursFrom(now, -5),
    },
    {
      _id: "demo-005",
      title: "Upload and label documents in digital case file",
      description:
        "Ensure documents are correctly categorised (application, evidence, correspondence) and are OCR/readable; add short descriptions for accessibility.",
      status: "pending",
      dueDate: daysFrom(now, 2),
      createdAt: daysFrom(now, -1),
      modifiedAt: daysFrom(now, -1),
    },
    {
      _id: "demo-006",
      title: "Send hearing notice to parties",
      description:
        "Generate and send hearing notice via the chosen channel; record delivery attempt and any bounce-backs.",
      status: "completed",
      dueDate: daysFrom(now, -2),
      createdAt: daysFrom(now, -6),
      modifiedAt: daysFrom(now, -2),
    },
    {
      _id: "demo-007",
      title: "Prepare digital hearing bundle (draft)",
      description:
        "Collate key documents into the bundle order and check pagination; note any missing items for follow-up.",
      status: "pending",
      dueDate: daysFrom(now, 5),
      createdAt: daysFrom(now, -3),
      modifiedAt: daysFrom(now, -3),
    },
    {
      _id: "demo-008",
      title: "Handle reasonable adjustment / accessibility request",
      description:
        "Record requested adjustments (e.g., hearing loop, step-free access, communication support) and notify listing/admin teams.",
      status: "pending",
      dueDate: daysFrom(now, 4),
      createdAt: daysFrom(now, -1),
      modifiedAt: daysFrom(now, -1),
    },
    {
      _id: "demo-009",
      title: "Respond to inbound query (status update request)",
      description:
        "Reply to party/representative via digital channel with an administrative update and signposting; avoid comment on judicial decision-making.",
      status: "in progress",
      dueDate: hoursFrom(now, 3),
      createdAt: daysFrom(now, -3),
      modifiedAt: hoursFrom(now, -1),
    },
    {
      _id: "demo-010",
      title: "Chase missing document after deadline",
      description:
        "Follow up with the relevant party to request the outstanding document; record action and set reminder.",
      status: "pending",
      dueDate: daysFrom(now, -1),
      createdAt: daysFrom(now, -4),
      modifiedAt: daysFrom(now, -2),
    },
    {
      _id: "demo-011",
      title: "Verify remote hearing link distribution",
      description:
        "Confirm video hearing link was shared with all parties and interpreters (if applicable); re-send and log where necessary.",
      status: "in progress",
      dueDate: hoursFrom(now, 8),
      createdAt: daysFrom(now, -2),
      modifiedAt: hoursFrom(now, -4),
    },
    {
      _id: "demo-012",
      title: "Close administrative task after outcome recorded",
      description:
        "Once the outcome is recorded in the case management system, update admin checklist, ensure documents are filed, and mark task complete.",
      status: "completed",
      dueDate: daysFrom(now, -3),
      createdAt: daysFrom(now, -8),
      modifiedAt: daysFrom(now, -3),
    },
  ];
}

export const demoTasks: Task[] = createDemoTasks(new Date());
