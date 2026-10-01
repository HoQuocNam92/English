import { Prisma, PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const slug = 'ba-payment-requirement-case-study'
type Section = { key: string; type: 'rich_text' | 'quiz'; title: string; content: Prisma.InputJsonObject }
const reading = (key: string, title: string, text: string): Section => ({ key, type: 'rich_text', title, content: { text } })
const quiz = (key: string, title: string, question: string, answer: string): Section => ({ key, type: 'quiz', title, content: { question, answer } })
const sections: Section[] = [
  reading('brief', '1. Project brief and stakeholder goals', `Fictional workshop: you are the Business Analyst for an online learning platform. Checkout supports cards, bank transfers, and promotional codes. The Product Owner says, “Make checkout faster before our next campaign.”

Support reports that some learners press Pay again when the screen does not change. Finance wants every successful payment linked to exactly one order. Engineering needs a clear definition of “faster,” and QA needs observable outcomes.

Your task is to turn this request into a testable proposal. The examples and targets below are exercise assumptions, not measured production facts or approved requirements. Separate stakeholder statements, evidence, assumptions, and open decisions.`),
  reading('discovery', '2. Ask clarification questions', `Start with the user journey: “Which step feels slow: opening checkout, applying a promotion, submitting payment, or receiving confirmation?” Ask whether the problem affects cards, transfers, or both.

Define the measurement: “When does the timer start and stop?” “Do we include time spent entering details or completing an external challenge?” “Which devices, networks, and peak load should we test?”

Clarify the outcome: “Should the user see a confirmed result or a processing state?” “What should happen if payment status is unknown?” “Who approves the target and the exceptions?”

Avoid leading questions such as “Should we just remove validation?” A better question is “Which validation steps are required, and where do users experience delay?” Record the answer, decision owner, and any unresolved assumption.`),
  reading('evidence', '3. Build an evidence plan', `Instrument checkout opened, payment submitted, provider result received, and result displayed. Connect events using an order reference and payment-attempt reference. Do not include payment credentials in the exercise logs.

Compare the median and ninety-fifth percentile rather than reporting only an average. Break down observations by method, device, and outcome. A fast rejection is not a successful checkout.

A proposed measurement interval is from accepted Pay submission to the first clear state shown to the user. Measure final payment confirmation separately. For external authentication, report the challenge duration separately instead of silently excluding slow cases.

Ask Support for anonymized examples and Engineering for traces. Until evidence exists, label “the provider is slow” as a hypothesis, not a root cause.`),
  reading('scope', '4. Scope and user stories', `Proposed first release: clearer submission feedback, prevention of accidental duplicate payment attempts, meaningful promotion errors, and a visible pending state. Keep the existing payment methods. A provider replacement and a redesigned refund workflow are out of scope for this exercise.

Story A: As a learner, I want immediate feedback after pressing Pay so that I know my request is being processed.
Story B: As a learner, I want an unresolved payment to remain visible so that I do not accidentally pay again.
Story C: As a support agent, I want an order reference and payment state so that I can investigate without asking for sensitive credentials.

These stories describe user needs. Acceptance criteria must define the conditions, expected behavior, and observable evidence for each story.`),
  reading('states', '5. Define payment states and business rules', `Proposed states: awaiting_payment, processing, paid, and failed. A bank transfer can remain awaiting_payment until verified. A request timeout leaves the outcome unresolved; it is not proof of failure.

An order becomes paid only after the backend verifies an authoritative successful result and matches it to the expected order, amount, and currency. A browser redirect alone is not sufficient evidence in this exercise.

Repeated submission of the same intended attempt must not create another charge. A new attempt is allowed only after the previous attempt is known to have failed, or after an explicitly defined resolution process. Repeated or delayed notifications must not grant access twice or move a paid order back to processing.

Ask stakeholders how long unresolved attempts remain visible and who resolves exceptions. Do not invent a universal timeout policy.`),
  reading('criteria', '6. Write measurable acceptance criteria', `The original three-second confirmation example needs a defined measurement boundary. Treat these as proposed refinements for stakeholder review.

AC-1 — Submission feedback:
Given valid checkout details, when the learner presses Pay, then the interface shows processing and prevents repeated submission within one second in the agreed test environment.

AC-2 — Confirmed card result:
Given an authoritative successful provider result has reached the backend, when it is matched to the order, then the learner sees paid within three seconds for at least 95% of those test cases. Measure from backend receipt to visible confirmation; track total payment time separately.

AC-3 — Unknown outcome:
Given no final result is available at the request deadline, when the interface updates, then it shows an unresolved processing state and the order reference without asserting success or failure.

AC-4 — Duplicate notification:
Given an order is already paid, when the same success event arrives again, then its state and granted access remain unchanged.

Record the workload, devices, network conditions, and sample size before treating performance criteria as reproducible.`),
  reading('edge-cases', '7. Walk through edge cases', `Double click: repeated Pay clicks for one intended attempt should produce one logical payment operation. Disabling the button helps the user, but backend duplicate protection is still needed.

Expired promotion: show the reason and revised total, then require confirmation of the payable amount before payment. Do not silently charge more than the amount the learner approved.

Lost connection: reopening the order should recover its current state. Do not offer an unrestricted new payment while an earlier attempt remains unresolved.

Delayed transfer: keep the order pending until verification; define how to handle a transfer received after an order expires.

Mismatched amount or currency: do not mark paid automatically. Route the exception to the agreed review process.

For each case, specify the initial state, trigger, expected state, user message, and responsible team.`),
  reading('handoff', '8. Traceability, prioritization, and handoff', `Map each need to a requirement and test: repeated clicks → duplicate prevention → AC-4 plus a concurrent-submission test; unclear waiting → processing feedback → AC-1 and AC-3; slow confirmation → timing definition → AC-2.

Prioritize according to user impact and implementation dependencies. In this exercise, correctness of payment state and duplicate prevention are release blockers. Cosmetic changes can be discussed separately.

Create a decision log with question, proposed answer, owner, evidence, and review date. Product approves scope, Engineering checks feasibility, Finance validates reconciliation expectations, Support reviews messages, and QA validates testability.

A requirement is not agreed merely because the BA wrote it. End the workshop by listing approved decisions, unresolved questions, and the person responsible for each follow-up.`),
  reading('language', '9. BA English: vocabulary and workshop deliverable', `stakeholder — bên liên quan có nhu cầu hoặc quyền quyết định.
acceptance criterion — điều kiện có thể kiểm chứng để nghiệm thu.
assumption — giả định cần được xác nhận.
scope — phạm vi công việc.
edge case — tình huống biên cần xử lý.
reconciliation — đối chiếu giao dịch và đơn hàng.
pending — đang chờ kết quả.
traceability — khả năng liên kết yêu cầu với nguồn và kiểm thử.

Useful phrases:
“Could you clarify what you mean by faster?”
“What evidence would show that this requirement is met?”
“Is this an approved rule or an assumption?”
“What should the user see while the outcome is unknown?”

Deliverable: write five clarification questions, two user stories, three Given/When/Then criteria, and a decision note. Include one unresolved issue and its owner. Use English for the deliverable and Vietnamese to explain one ambiguity you removed.`),
  quiz('q-clarify', 'Clarify an ambiguous request', 'Give two questions that make “checkout faster” testable.', 'Examples: Which payment method and step are affected? From which event to which event should time be measured? Also agree on workload, device conditions, and the target percentile.'),
  quiz('q-timeout', 'Interpret a timeout', 'A payment request times out. Should the order immediately become failed?', 'No. The provider may have completed the payment. Keep the outcome unresolved, recover authoritative status, and avoid creating another attempt until the previous one is resolved.'),
  quiz('q-criterion', 'Improve an acceptance criterion', 'What is missing from “95% of payments complete within three seconds”?', 'The start and end events, meaning of complete, payment methods, treatment of external challenges, workload, environment, and sample. Without these, teams can measure different things.'),
  quiz('q-duplicate', 'Review duplicate protection', 'Is disabling the Pay button sufficient to prevent duplicate charges?', 'No. Retries, concurrent requests, or another device can still submit. The backend must enforce duplicate protection for the same intended attempt, and notifications must be handled idempotently.'),
  quiz('q-promo', 'Handle a changed total', 'A promotional code expires just before submission. What should the learner see?', 'A clear explanation and revised total, with confirmation of the payable amount before payment. The system must not silently charge a higher amount.'),
  quiz('q-handoff', 'Write a decision note', 'Write a short note separating an agreed scope item from an unresolved question.', 'Example: Proposed scope: show processing feedback and prevent duplicate attempts. Open question: how long should unresolved transfers remain visible? Product and Finance must agree on the rule before acceptance criteria are finalized.'),
]

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const result = await prisma.$transaction(async tx => {
    const lesson = await tx.lesson.findUnique({ where: { slug }, include: { sections: true } })
    if (!lesson) throw new Error('Missing lesson ' + slug + '; no data changed.')
    let order = Math.max(0, ...lesson.sections.map(section => section.order))
    let added = 0
    for (const section of sections) {
      const seedKey = 'ba-payment-v1:' + section.key
      if (lesson.sections.some(existing => (existing.content as Record<string, unknown>)?.seedKey === seedKey)) continue
      if (!dryRun) await tx.lessonSection.create({ data: {
        lessonId: lesson.id, order: ++order, type: section.type, title: section.title,
        content: { ...section.content, seedKey },
      } })
      added++
    }
    return { dryRun, lessonId: lesson.id, existingSections: lesson.sections.length, addedSections: added, totalSections: lesson.sections.length + (dryRun ? 0 : added) }
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: 15000 })
  console.log(JSON.stringify(result))
}

main().catch(error => { console.error(error); process.exitCode = 1 }).finally(() => prisma.$disconnect())

