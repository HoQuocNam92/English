import { Prisma, PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
type Section = { key: string; type: 'rich_text' | 'code' | 'quiz'; title: string; content: Prisma.InputJsonObject }
const reading = (key: string, title: string, text: string): Section => ({ key, type: 'rich_text', title, content: { text } })
const quiz = (key: string, title: string, question: string, answer: string): Section => ({ key, type: 'quiz', title, content: { question, answer } })
const lessons: Array<{ slug: string; sections: Section[] }> = [
  { slug: 'reading-rest-api-documentation', sections: [
    reading('contract', '1. Read the contract before writing code', `Practice specification: the following rules belong to a fictional order API used in this lesson.

POST /v1/orders creates an order for the authenticated customer. Creating an order reserves stock; it does not charge a payment card. Payment processing is outside this endpoint.

“Required” means a field must be present. “Optional” means it may be omitted. “Must” expresses a requirement, while “may” describes permitted behavior. Distinguish guaranteed behavior from example values.

Before implementation, identify the method, path, authentication, request fields, success response, and documented errors. Do not assume another endpoint follows identical rules.`),
    reading('fields', '2. Request fields and validation', `productId: required string identifying an existing product, such as p-101. Treat identifiers as opaque values; do not infer price or category from their format.

quantity: required integer from 1 to 20. A string such as "2", a fraction, zero, or a negative value is invalid in this practice contract.

The server obtains the customer identity from the token and calculates prices from its catalogue. Clients must not send customerId or unitPrice to override those values. Unknown fields are rejected in this example.

Validation happens before reservation. An unknown product or insufficient stock creates no order. Read whether failed operations can have side effects rather than inferring this from the status code alone.`),
    reading('auth', '3. Headers and authorization', `Send Content-Type: application/json and Authorization: Bearer <access-token>. Use HTTPS. The examples use placeholders, not real credentials.

In this contract, 401 Unauthorized means authentication is missing or invalid. A valid identity without permission receives 403 Forbidden. Refreshing an expired token may resolve expiration, but it does not grant a missing permission.

Authentication answers “Who is calling?” Authorization answers “May this caller perform this action?” When reporting a failure, include its request ID, but never include the access token.`),
    reading('response', '4. Interpret the successful response', `Creation returns 201 Created. The Location header identifies the new resource, for example /v1/orders/ord-demo-a. The body contains id, productId, quantity, status, and createdAt. A newly created order has status pending_payment.

Store the returned ID and display the server-confirmed state. Order creation does not mean payment succeeded. Example identifiers and timestamps are not fixed values to hard-code.

GET /v1/orders/{id} reads an order owned by the caller. This fictional endpoint returns 200 OK when found and 404 Not Found when the resource is absent or unavailable to that caller.`),
    { key: 'response-example', type: 'code', title: 'Example creation response', content: { language: 'json', status: '201', code: JSON.stringify({ id: 'ord-demo-a', productId: 'p-101', quantity: 2, status: 'pending_payment', createdAt: '2026-09-29T10:00:00Z' }, null, 2) } },
    reading('errors', '5. Error handling and retry decisions', `Errors contain code, message, and requestId. Validation errors may include field. Use the machine-readable code for logic and requestId for investigation.

400 Bad Request: malformed JSON or invalid fields; fix the request.
401 Unauthorized: missing or invalid authentication.
403 Forbidden: insufficient permission.
404 Not Found: unavailable product or readable order.
409 Conflict: insufficient stock or an idempotency key reused with different data.
429 Too Many Requests: follow the documented Retry-After header.
503 Service Unavailable: temporary service failure; retry only under the documented policy.

A timeout does not prove creation failed. The server may have committed the order before the response was lost. Repeating a request blindly can create duplicates.`),
    reading('idempotency', '6. Idempotency in this practice API', `This fictional endpoint accepts Idempotency-Key. Generate one key per intended order. Retry with the same key and identical body after a timeout; a different intended order uses a new key.

The server retains completed results for one day, scoped to customer and endpoint. A matching retry within that period returns the original result rather than reserving stock again. Reusing the key with different data returns 409 Conflict.

These are explicit exercise rules, not guarantees of every POST endpoint. When duplicate prevention or retention is undocumented, clarify the contract before enabling automatic retries.`),
    reading('language', '7. Vocabulary and handoff practice', `payload — dữ liệu gửi trong request.
constraint — điều kiện dữ liệu phải đáp ứng.
opaque identifier — mã không nên suy diễn cấu trúc nghiệp vụ.
reserve stock — giữ hàng cho đơn đặt hàng.
side effect — thay đổi trạng thái do thao tác gây ra.
retry — gửi lại thao tác.

Complete: “To create an order, send ___ to ___. Provide ___. A successful response means ___, but does not mean ___. After a timeout, ___.”

Prepare three test cases: valid order, invalid quantity, and an identical retry after a lost response. State the expected response and whether a new order should exist in each case.`),
    quiz('q-fields', 'Validate the payload', 'Why is quantity: "2" invalid here?', 'The contract requires a JSON integer. "2" is a string; this API rejects it rather than converting it.'),
    quiz('q-payment', 'Understand success', 'Does 201 Created confirm payment?', 'No. The order is pending_payment. Creation reserves stock; payment is a separate workflow.'),
    quiz('q-retry', 'Handle a timeout', 'How should the client retry the same order within the retention period?', 'Reuse the same Idempotency-Key and identical payload for the same customer and endpoint. A new key can create another order.'),
    quiz('q-auth', 'Distinguish access errors', 'Should a client repeatedly refresh a valid token after 403?', 'No. Refreshing does not grant permission. Investigate the access required for the operation.'),
  ] },
  { slug: 'system-design-scalable-service', sections: [
    reading('requirements', '1. Clarify requirements', `Exercise: design a learning service for one million daily active users. Learners browse the catalogue, open lessons, and save progress. Editing and payments are outside scope.

Proposed targets: catalogue reads complete within half a second at the ninety-fifth percentile under agreed peak load; acknowledged progress writes survive an application process restart. These are targets to test, not measured results.

Catalogue updates may appear after a short delay. Learners should see saved progress on the next read. Identify freshness requirements before choosing caches. Daily active users alone do not define concurrency or request rate.`),
    reading('capacity', '2. Estimate traffic with assumptions', `Assume twenty catalogue reads and two progress writes per user per day. One million daily users produce twenty million reads and two million writes daily.

Divide by 86,400 seconds: approximately 231 reads and 23 writes per second on average. With an assumed peak multiplier of ten, begin load testing around 2,310 reads and 230 writes per second.

This does not determine a server count. Measure request cost, response size, database latency, cache hit ratio, and burst patterns. Video delivery needs a separate bandwidth estimate and is excluded from these API calculations.`),
    reading('flow', '3. Trace reads and writes', `A load balancer routes requests to healthy stateless application instances. The application authenticates and authorizes the caller before returning private data.

For a catalogue read, check the distributed cache. On a hit, return the cached representation. On a miss, read the database and populate the cache with an expiry. The database remains the source of truth.

For a progress write, validate the learner and lesson, commit the change to durable storage, then acknowledge it. Queue non-critical analytics for later processing. A queue acknowledgement is not automatically proof that data reached its final store; define precisely what success means.`),
    reading('cache', '4. Cache behavior and consistency', `Separate public catalogue caching from learner-specific progress. Private cache keys must include the appropriate identity and context to prevent serving another learner’s data.

Use short expiry and invalidate affected catalogue keys after edits. Expiry limits staleness but does not remove races: an older read can populate stale data after invalidation.

In this exercise, read freshly saved progress from the authoritative store. Coalesce concurrent cache misses and stagger expiry to reduce stampedes. During a cache outage, bound database fallback traffic so the database is not overwhelmed.`),
    reading('storage', '5. Data model and partitioning', `Identify progress by learner ID and lesson ID, with a uniqueness constraint for that pair. Define updates so retrying completion does not create a duplicate record or award points twice.

Index measured access patterns, such as fetching progress for a learner. Examine slow queries and connection use before sharding. Adding application instances can increase database pressure through their connection pools.

If measurements justify partitioning, learner ID can keep a learner’s records together. Cross-learner reports become harder, and skewed activity can create hot partitions. Partitioning is a trade-off rather than an automatic performance improvement.`),
    reading('queue', '6. Queues and duplicate delivery', `Use a queue for non-critical analytics so a slow reporting service does not delay lesson completion. Assume at-least-once delivery: a consumer can receive the same event again.

Assign a stable event ID. Persist deduplication and the business effect atomically so redelivery does not count completion twice. An in-memory set alone fails after restart.

If progress commits but event publication fails, analytics can miss updates. A transactional outbox saves the progress and event record in one database transaction, then publishes later. This adds a publisher, monitoring, and cleanup work; consumers still need duplicate handling.`),
    reading('failure', '7. Failure handling and monitoring', `Set deadlines and bounded retries. Immediate retries from every caller can amplify an outage. Use backoff, jitter, and a retry budget where operation semantics permit retrying.

Monitor latency percentiles, errors, throughput, saturation, database connections, cache hit ratio, queue age, and failed processing. Low CPU usage does not prove users can complete lessons.

Test instance failure, unavailable cache, database failover, and slow consumers. Record user-visible behavior and recovery time. Degrade optional analytics before essential progress writes, and expose failed saves clearly rather than claiming success.`),
    reading('decision', '8. Architecture decision record and vocabulary', `Context: catalogue reads dominate traffic, and brief catalogue staleness is acceptable.
Decision: cache public catalogue data; acknowledge progress only after database commit.
Alternatives: read everything directly from storage, or also cache progress.
Consequences: less repeated database work, but more invalidation and outage handling.
Validation: compare warm-cache, cold-cache, and cache-outage performance.

throughput — số thao tác xử lý trong một đơn vị thời gian.
latency — thời gian phản hồi.
bottleneck — điểm giới hạn năng lực hệ thống.
stale data — dữ liệu chưa phản ánh thay đổi mới.
trade-off — sự đánh đổi.
idempotent — lặp lại thao tác không tạo thêm tác động ngoài lần đầu.

Write your own queue decision using: “We choose … because …”, “This assumes …”, and “We would reconsider if …”. State one rejected alternative and a measurable validation plan.`),
    quiz('q-load', 'Reason about capacity', 'Why is daily active user count insufficient to choose server count?', 'It omits requests per user, peak rate, concurrency, and request cost. Estimate explicitly and measure capacity under representative load.'),
    quiz('q-consistency', 'Choose a consistency policy', 'Why treat catalogue reads differently from progress reads after saving?', 'Brief catalogue staleness is acceptable, but saved progress must be visible on the next read. This exercise uses the authoritative store for that progress read.'),
    quiz('q-events', 'Handle duplicate events', 'How can a consumer avoid awarding points twice?', 'Use a stable event identifier and atomically persist deduplication with the business effect. In-memory checks alone do not survive restart.'),
    quiz('q-cache', 'Investigate cache failure', 'Why is unrestricted database fallback risky?', 'The database suddenly receives cached traffic and may overload. Bound fallback concurrency and test the failure mode.'),
    quiz('q-sharding', 'Explain a trade-off', 'Give a reason to postpone sharding and one cost of adding it.', 'Query, index, or connection improvements may resolve the measured bottleneck first. Sharding adds operational complexity and complicates cross-partition queries and transactions.'),
  ] },
]

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const results = await prisma.$transaction(async tx => {
    const results = []
    for (const seed of lessons) {
      const lesson = await tx.lesson.findUnique({ where: { slug: seed.slug }, include: { sections: true } })
      if (!lesson) throw new Error('Missing lesson ' + seed.slug + '; transaction rolled back.')
      let order = Math.max(0, ...lesson.sections.map(section => section.order))
      let added = 0
      for (const section of seed.sections) {
        const seedKey = 'api-system-v1:' + seed.slug + ':' + section.key
        if (lesson.sections.some(existing => (existing.content as Record<string, unknown>)?.seedKey === seedKey)) continue
        if (!dryRun) await tx.lessonSection.create({ data: {
          lessonId: lesson.id, order: ++order, type: section.type, title: section.title,
          content: { ...section.content, seedKey },
        } })
        added++
      }
      results.push({ slug: seed.slug, lessonId: lesson.id, existingSections: lesson.sections.length, addedSections: added, totalSections: lesson.sections.length + (dryRun ? 0 : added) })
    }
    return results
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: 15000 })
  console.log(JSON.stringify({ dryRun, results }, null, 2))
}

main().catch(error => { console.error(error); process.exitCode = 1 }).finally(() => prisma.$disconnect())

