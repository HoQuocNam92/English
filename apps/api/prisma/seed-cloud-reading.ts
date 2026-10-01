import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()
const slug = 'reading-cloud-architecture-document'
const sections: Array<{ key: string; type: 'rich_text' | 'quiz'; title: string; content: Prisma.InputJsonObject }> = [
  { key: 'requirements', type: 'rich_text', title: '1. Requirements and architecture overview', content: {
    sourceLabel: 'Practice architecture note', readingGoal: 'Xác định mục tiêu hệ thống và trách nhiệm của từng thành phần.',
    text: 'An online learning platform serves students during the day and experiences a traffic peak before evening classes. The team wants the application to remain available when an individual compute instance fails. The design also needs enough capacity to handle the loss of one Availability Zone.\n\nIn this example, application instances run in two Availability Zones within one AWS Region. An Application Load Balancer receives incoming web requests and forwards them to healthy targets. The application tier is stateless: a student’s session is not stored only in the memory of one instance. This allows another instance to handle the next request without requiring the student to sign in again.\n\nThe architecture separates traffic distribution, capacity management, and data storage. These responsibilities are related, but they are not interchangeable. Read the following sections to identify which component performs each responsibility.'
  } },
  { key: 'traffic', type: 'rich_text', title: '2. Traffic distribution and capacity', content: {
    readingGoal: 'Phân biệt distributes, detects, replaces và scales.',
    text: 'The load balancer checks whether application targets can respond successfully. When a target becomes unhealthy, it stops receiving new requests from the load balancer. Removing a target from the traffic path does not, by itself, create a replacement instance.\n\nThe Auto Scaling group maintains the desired number of instances. In this design, load balancer health checks are enabled for the group, so an instance reported as unhealthy can be replaced. During a traffic peak, a scaling policy can increase capacity. When demand falls, the group can reduce capacity within its configured limits.\n\nScaling is not instantaneous. New instances need time to start and pass health checks before they can serve requests. The team therefore keeps spare capacity and tests whether the remaining zone can support the expected workload during an outage. A design diagram alone is not evidence that the application can survive every failure.'
  } },
  { key: 'database', type: 'rich_text', title: '3. Database availability and recovery', content: {
    readingGoal: 'Tìm bằng chứng giải thích vì sao failover không thay thế backup.',
    text: 'For this scenario, the team selects an RDS Multi-AZ DB instance deployment with a primary database and a synchronous standby in another Availability Zone. Applications use the database endpoint rather than a hard-coded server address. If the primary becomes unavailable, the service can fail over to the standby.\n\nConnections may be interrupted during failover. The application must reconnect and handle temporary errors. Requests that change data need careful retry behavior to avoid creating duplicate records. In this deployment, the standby supports availability; it is not a separate read endpoint for normal application queries.\n\nHigh availability does not replace backups. An accidental deletion can affect the live database even when its infrastructure is healthy. The operations team therefore keeps backups and rehearses restoration. A recovery time objective describes the target time to restore service. A recovery point objective describes the acceptable amount of data loss measured in time.'
  } },
  { key: 'operations', type: 'rich_text', title: '4. Security, monitoring, and trade-offs', content: {
    readingGoal: 'Đọc các từ nối however, therefore và rather than để hiểu lập luận.',
    text: 'Only the public entry point accepts traffic from the internet. Application and database access is restricted to the connections required by the design. The application uses a role with only the permissions it needs, and credentials are not embedded in source code.\n\nThe team monitors request latency, error rate, healthy target count, and database connections. A successful infrastructure health check does not prove that a student can complete a lesson, so the team also checks a representative user journey. Alerts should help an operator identify a user-visible problem and the affected component.\n\nRunning capacity across two zones costs more than running a single small instance. However, the additional capacity reduces dependence on one failure location. The final decision balances availability requirements, operating cost, and the team’s ability to test recovery. The proposal addresses failures within one Region; it does not claim to provide recovery from a complete regional outage.'
  } },
  { key: 'vocabulary', type: 'rich_text', title: '5. Vocabulary in context', content: {
    text: 'workload — khối lượng công việc hoặc ứng dụng cần vận hành. “The workload experiences an evening traffic peak.”\nhealthy target — đích xử lý vượt qua kiểm tra tình trạng. “Requests are forwarded to healthy targets.”\nreplace — thay thế. “The group replaces an unhealthy instance.”\nspare capacity — năng lực xử lý dự phòng. “Spare capacity helps during an outage.”\nstateless — không giữ trạng thái phiên chỉ ở một máy xử lý. “A stateless tier can serve requests through different instances.”\nfailover — chuyển sang thành phần dự phòng. “Connections may be interrupted during failover.”\nrestore — khôi phục từ bản sao lưu. “The team rehearses how to restore the database.”\ntrade-off — sự đánh đổi giữa các mục tiêu. “The design makes a trade-off between cost and availability.”\n\nLanguage focus: “while” can contrast two responsibilities; “therefore” introduces a result; “however” introduces a limitation. Find one example of each relationship in the passage and explain it in Vietnamese.'
  } },
  { key: 'q-roles', type: 'quiz', title: 'Traffic versus capacity', content: { question: 'How do the load balancer and Auto Scaling group differ in this design?', answer: 'The load balancer distributes requests to healthy targets. The Auto Scaling group maintains capacity and replaces unhealthy instances, with load balancer health checks enabled in this scenario.' } },
  { key: 'q-state', type: 'quiz', title: 'Explain the design', content: { question: 'Why does the application avoid storing a session only in one instance’s memory?', answer: 'Another instance must be able to handle the student’s next request if traffic moves or the original instance fails.' } },
  { key: 'q-backup', type: 'quiz', title: 'Find supporting evidence', content: { question: 'Why are backups still required when the database has a standby?', answer: 'A standby supports availability, but accidental deletion can still affect live data. Backups and tested restoration address recovery from that kind of data loss.' } },
  { key: 'q-scope', type: 'quiz', title: 'Identify a limitation', content: { question: 'Does this proposal guarantee recovery from a complete regional outage? Cite the scope of the design.', answer: 'No. Both Availability Zones are in one Region, and the proposal explicitly addresses failures within that Region.' } },
  { key: 'q-summary', type: 'quiz', title: 'Write a technical summary', content: { question: 'Summarize the architecture in two English sentences and name one trade-off.', answer: 'Example: The platform distributes traffic across stateless application instances in two Availability Zones and uses Auto Scaling to maintain capacity. A Multi-AZ database supports failover, while backups support data recovery; the additional infrastructure improves availability at a higher operating cost.' } },
]

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  await prisma.$transaction(async tx => {
    const lesson = await tx.lesson.findUnique({ where: { slug }, include: { sections: true } })
    if (!lesson) throw new Error(`Lesson ${slug} not found; no data changed.`)
    let order = Math.max(0, ...lesson.sections.map(section => section.order))
    let added = 0
    for (const section of sections) {
      const seedKey = `cloud-reading-v1:${section.key}`
      if (lesson.sections.some(existing => (existing.content as Record<string, unknown>)?.seedKey === seedKey)) continue
      if (!dryRun) await tx.lessonSection.create({ data: {
        lessonId: lesson.id, order: ++order, type: section.type, title: section.title,
        content: { ...section.content, seedKey },
      } })
      added++
    }
    console.log(JSON.stringify({ dryRun, lessonId: lesson.id, existingSections: lesson.sections.length, addedSections: added, totalSections: lesson.sections.length + (dryRun ? 0 : added) }))
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable })
}

main().catch(error => { console.error(error); process.exitCode = 1 }).finally(() => prisma.$disconnect())
