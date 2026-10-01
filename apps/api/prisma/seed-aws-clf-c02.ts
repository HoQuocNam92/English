import { ExamKind, PrismaClient, QuestionType } from '@prisma/client'

const prisma = new PrismaClient()

type Topic = { code: string; name: string }
type DomainSeed = {
  code: string
  name: string
  description: string
  weightPercent: number
  topics: Topic[]
}

type ConceptSeed = {
  domainCode: string
  topicCode: string
  term: string
  definitionEn: string
  definitionVi: string
}

const domains: DomainSeed[] = [
  {
    code: 'AWS_CLF_C02_D1',
    name: 'Cloud Concepts',
    description: 'CLF-C02 Domain 1: Cloud Concepts (24% of scored content).',
    weightPercent: 24,
    topics: [
      { code: '1.1', name: 'Define the benefits of the AWS Cloud' },
      { code: '1.2', name: 'Identify design principles of the AWS Cloud' },
      { code: '1.3', name: 'Understand cloud migration benefits and strategies' },
      { code: '1.4', name: 'Understand concepts of cloud economics' },
    ],
  },
  {
    code: 'AWS_CLF_C02_D2',
    name: 'Security and Compliance',
    description: 'CLF-C02 Domain 2: Security and Compliance (30% of scored content).',
    weightPercent: 30,
    topics: [
      { code: '2.1', name: 'Understand the AWS shared responsibility model' },
      { code: '2.2', name: 'Understand security, governance, and compliance concepts' },
      { code: '2.3', name: 'Identify AWS access management capabilities' },
      { code: '2.4', name: 'Identify components and resources for security' },
    ],
  },
  {
    code: 'AWS_CLF_C02_D3',
    name: 'Cloud Technology and Services',
    description: 'CLF-C02 Domain 3: Cloud Technology and Services (34% of scored content).',
    weightPercent: 34,
    topics: [
      { code: '3.1', name: 'Define methods of deploying and operating in the AWS Cloud' },
      { code: '3.2', name: 'Define the AWS global infrastructure' },
      { code: '3.3', name: 'Identify AWS compute services' },
      { code: '3.4', name: 'Identify AWS database services' },
      { code: '3.5', name: 'Identify AWS network services' },
      { code: '3.6', name: 'Identify AWS storage services' },
      { code: '3.7', name: 'Identify AWS AI, ML, and analytics services' },
      { code: '3.8', name: 'Identify services from other in-scope categories' },
    ],
  },
  {
    code: 'AWS_CLF_C02_D4',
    name: 'Billing, Pricing, and Support',
    description: 'CLF-C02 Domain 4: Billing, Pricing, and Support (12% of scored content).',
    weightPercent: 12,
    topics: [
      { code: '4.1', name: 'Compare AWS pricing models' },
      { code: '4.2', name: 'Understand billing, budget, and cost management resources' },
      { code: '4.3', name: 'Identify AWS technical resources and Support options' },
    ],
  },
]

const concepts: ConceptSeed[] = [
  { domainCode: 'AWS_CLF_C02_D1', topicCode: '1.1', term: 'elasticity', definitionEn: 'The ability to automatically add or remove resources as demand changes.', definitionVi: 'Khả năng tự động tăng hoặc giảm tài nguyên khi nhu cầu thay đổi.' },
  { domainCode: 'AWS_CLF_C02_D1', topicCode: '1.1', term: 'high availability', definitionEn: 'Designing a workload to remain accessible despite component failures.', definitionVi: 'Thiết kế workload vẫn truy cập được dù một số thành phần gặp sự cố.' },
  { domainCode: 'AWS_CLF_C02_D1', topicCode: '1.1', term: 'agility', definitionEn: 'The ability to experiment and deliver technology resources quickly.', definitionVi: 'Khả năng thử nghiệm và cung cấp tài nguyên công nghệ nhanh chóng.' },
  { domainCode: 'AWS_CLF_C02_D1', topicCode: '1.2', term: 'AWS Well-Architected Framework', definitionEn: 'AWS guidance for evaluating architectures against six cloud design pillars.', definitionVi: 'Hướng dẫn AWS để đánh giá kiến trúc theo sáu trụ cột thiết kế đám mây.' },
  { domainCode: 'AWS_CLF_C02_D1', topicCode: '1.3', term: 'AWS Cloud Adoption Framework', definitionEn: 'Guidance that helps organizations plan and accelerate cloud transformation.', definitionVi: 'Hướng dẫn giúp tổ chức lập kế hoạch và tăng tốc chuyển đổi lên đám mây.' },
  { domainCode: 'AWS_CLF_C02_D1', topicCode: '1.3', term: 'migration', definitionEn: 'Moving applications, data, or workloads from one environment to another.', definitionVi: 'Di chuyển ứng dụng, dữ liệu hoặc workload từ môi trường này sang môi trường khác.' },
  { domainCode: 'AWS_CLF_C02_D1', topicCode: '1.4', term: 'economies of scale', definitionEn: 'Cost advantages AWS can achieve by aggregating usage across many customers.', definitionVi: 'Lợi thế chi phí AWS đạt được khi tổng hợp nhu cầu của nhiều khách hàng.' },
  { domainCode: 'AWS_CLF_C02_D1', topicCode: '1.4', term: 'rightsizing', definitionEn: 'Matching resource type and capacity to workload performance needs at the lowest practical cost.', definitionVi: 'Chọn loại và dung lượng tài nguyên phù hợp nhu cầu với chi phí hợp lý nhất.' },

  { domainCode: 'AWS_CLF_C02_D2', topicCode: '2.1', term: 'shared responsibility model', definitionEn: 'AWS secures the cloud while customers secure their workloads and data in the cloud.', definitionVi: 'AWS bảo mật hạ tầng đám mây, khách hàng bảo mật workload và dữ liệu của mình.' },
  { domainCode: 'AWS_CLF_C02_D2', topicCode: '2.2', term: 'AWS Artifact', definitionEn: 'A self-service portal for AWS compliance reports and selected agreements.', definitionVi: 'Cổng tự phục vụ để tải báo cáo tuân thủ và một số thỏa thuận AWS.' },
  { domainCode: 'AWS_CLF_C02_D2', topicCode: '2.2', term: 'AWS CloudTrail', definitionEn: 'A service that records account activity and API events for auditing.', definitionVi: 'Dịch vụ ghi lại hoạt động tài khoản và sự kiện API để kiểm toán.' },
  { domainCode: 'AWS_CLF_C02_D2', topicCode: '2.2', term: 'AWS Config', definitionEn: 'A service that records resource configurations and evaluates them against rules.', definitionVi: 'Dịch vụ ghi cấu hình tài nguyên và đánh giá theo các quy tắc.' },
  { domainCode: 'AWS_CLF_C02_D2', topicCode: '2.3', term: 'AWS Identity and Access Management', definitionEn: 'A service for controlling authentication and authorization to AWS resources.', definitionVi: 'Dịch vụ kiểm soát xác thực và phân quyền truy cập tài nguyên AWS.' },
  { domainCode: 'AWS_CLF_C02_D2', topicCode: '2.3', term: 'least privilege', definitionEn: 'Granting only the permissions required to perform a task.', definitionVi: 'Chỉ cấp các quyền cần thiết để thực hiện một nhiệm vụ.' },
  { domainCode: 'AWS_CLF_C02_D2', topicCode: '2.3', term: 'multi-factor authentication', definitionEn: 'Requiring an additional verification factor beyond a password.', definitionVi: 'Yêu cầu thêm yếu tố xác minh ngoài mật khẩu.' },
  { domainCode: 'AWS_CLF_C02_D2', topicCode: '2.4', term: 'Amazon GuardDuty', definitionEn: 'A threat detection service that continuously monitors for malicious activity.', definitionVi: 'Dịch vụ phát hiện mối đe dọa, liên tục giám sát hoạt động độc hại.' },
  { domainCode: 'AWS_CLF_C02_D2', topicCode: '2.4', term: 'AWS Shield', definitionEn: 'A managed service that helps protect AWS applications against DDoS attacks.', definitionVi: 'Dịch vụ được quản lý giúp bảo vệ ứng dụng AWS trước tấn công DDoS.' },

  { domainCode: 'AWS_CLF_C02_D3', topicCode: '3.1', term: 'AWS CloudFormation', definitionEn: 'A service for provisioning AWS infrastructure from declarative templates.', definitionVi: 'Dịch vụ cấp phát hạ tầng AWS từ các mẫu khai báo.' },
  { domainCode: 'AWS_CLF_C02_D3', topicCode: '3.2', term: 'AWS Region', definitionEn: 'A separate geographic area containing multiple isolated Availability Zones.', definitionVi: 'Khu vực địa lý riêng biệt chứa nhiều Availability Zone độc lập.' },
  { domainCode: 'AWS_CLF_C02_D3', topicCode: '3.2', term: 'Availability Zone', definitionEn: 'One or more discrete data centers with redundant power, networking, and connectivity in a Region.', definitionVi: 'Một hoặc nhiều trung tâm dữ liệu độc lập trong một Region.' },
  { domainCode: 'AWS_CLF_C02_D3', topicCode: '3.3', term: 'Amazon EC2', definitionEn: 'Resizable virtual compute capacity in the AWS Cloud.', definitionVi: 'Năng lực máy chủ ảo có thể thay đổi kích thước trên AWS.' },
  { domainCode: 'AWS_CLF_C02_D3', topicCode: '3.3', term: 'AWS Lambda', definitionEn: 'A serverless compute service that runs code in response to events.', definitionVi: 'Dịch vụ điện toán serverless chạy mã để phản hồi sự kiện.' },
  { domainCode: 'AWS_CLF_C02_D3', topicCode: '3.4', term: 'Amazon RDS', definitionEn: 'A managed relational database service for common database engines.', definitionVi: 'Dịch vụ cơ sở dữ liệu quan hệ được quản lý cho các engine phổ biến.' },
  { domainCode: 'AWS_CLF_C02_D3', topicCode: '3.4', term: 'Amazon DynamoDB', definitionEn: 'A serverless, fully managed NoSQL key-value database service.', definitionVi: 'Dịch vụ cơ sở dữ liệu NoSQL key-value serverless được quản lý hoàn toàn.' },
  { domainCode: 'AWS_CLF_C02_D3', topicCode: '3.5', term: 'Amazon VPC', definitionEn: 'A logically isolated virtual network for AWS resources.', definitionVi: 'Mạng ảo được cô lập logic dành cho tài nguyên AWS.' },
  { domainCode: 'AWS_CLF_C02_D3', topicCode: '3.5', term: 'Amazon Route 53', definitionEn: 'A scalable DNS and domain registration service.', definitionVi: 'Dịch vụ DNS và đăng ký tên miền có khả năng mở rộng.' },
  { domainCode: 'AWS_CLF_C02_D3', topicCode: '3.6', term: 'Amazon S3', definitionEn: 'Highly durable object storage designed for virtually unlimited scale.', definitionVi: 'Lưu trữ đối tượng có độ bền cao và khả năng mở rộng gần như không giới hạn.' },
  { domainCode: 'AWS_CLF_C02_D3', topicCode: '3.6', term: 'Amazon EBS', definitionEn: 'Persistent block storage volumes for Amazon EC2 instances.', definitionVi: 'Ổ lưu trữ khối bền vững dành cho các EC2 instance.' },
  { domainCode: 'AWS_CLF_C02_D3', topicCode: '3.7', term: 'Amazon SageMaker AI', definitionEn: 'A managed service for building, training, and deploying machine learning models.', definitionVi: 'Dịch vụ được quản lý để xây dựng, huấn luyện và triển khai mô hình máy học.' },
  { domainCode: 'AWS_CLF_C02_D3', topicCode: '3.7', term: 'Amazon Kinesis', definitionEn: 'A family of services for collecting and processing streaming data in real time.', definitionVi: 'Nhóm dịch vụ thu thập và xử lý dữ liệu luồng theo thời gian thực.' },
  { domainCode: 'AWS_CLF_C02_D3', topicCode: '3.8', term: 'Amazon CloudWatch', definitionEn: 'A monitoring service for metrics, logs, alarms, and events from AWS resources.', definitionVi: 'Dịch vụ giám sát metric, log, cảnh báo và sự kiện của tài nguyên AWS.' },
  { domainCode: 'AWS_CLF_C02_D3', topicCode: '3.8', term: 'AWS Organizations', definitionEn: 'A service for centrally managing and governing multiple AWS accounts.', definitionVi: 'Dịch vụ quản lý và quản trị tập trung nhiều tài khoản AWS.' },

  { domainCode: 'AWS_CLF_C02_D4', topicCode: '4.1', term: 'On-Demand pricing', definitionEn: 'Paying for compute capacity without long-term commitments.', definitionVi: 'Trả phí năng lực điện toán mà không cần cam kết dài hạn.' },
  { domainCode: 'AWS_CLF_C02_D4', topicCode: '4.1', term: 'Savings Plans', definitionEn: 'A pricing model offering lower usage prices in exchange for a consistent spend commitment.', definitionVi: 'Mô hình giá ưu đãi đổi lấy cam kết mức chi tiêu ổn định.' },
  { domainCode: 'AWS_CLF_C02_D4', topicCode: '4.2', term: 'AWS Cost Explorer', definitionEn: 'A tool for visualizing, understanding, and analyzing AWS costs and usage.', definitionVi: 'Công cụ trực quan hóa, tìm hiểu và phân tích chi phí cùng mức sử dụng AWS.' },
  { domainCode: 'AWS_CLF_C02_D4', topicCode: '4.2', term: 'AWS Budgets', definitionEn: 'A service for setting custom cost or usage thresholds and receiving alerts.', definitionVi: 'Dịch vụ đặt ngưỡng chi phí hoặc mức sử dụng và nhận cảnh báo.' },
  { domainCode: 'AWS_CLF_C02_D4', topicCode: '4.3', term: 'AWS Support', definitionEn: 'Plans and resources that provide guidance and technical assistance for AWS customers.', definitionVi: 'Các gói và tài nguyên cung cấp hướng dẫn cùng hỗ trợ kỹ thuật cho khách hàng AWS.' },
  { domainCode: 'AWS_CLF_C02_D4', topicCode: '4.3', term: 'AWS re:Post', definitionEn: 'A community-driven knowledge service for technical questions about AWS.', definitionVi: 'Dịch vụ kiến thức cộng đồng dành cho câu hỏi kỹ thuật về AWS.' },
]

const singleQuestionTargets: Record<string, number> = {
  AWS_CLF_C02_D1: 15,
  AWS_CLF_C02_D2: 18,
  AWS_CLF_C02_D3: 20,
  AWS_CLF_C02_D4: 7,
}

const multipleResponseQuestions = [
  { domainCode: 'AWS_CLF_C02_D1', topicCode: '1.1', prompt: 'Which TWO are common benefits of using the AWS Cloud?', correct: ['Elasticity', 'Agility'], incorrect: ['Mandatory long-term capacity planning', 'A single fixed hardware configuration', 'Customer maintenance of AWS data centers'], explanation: 'Elasticity and agility are core cloud benefits. AWS manages the underlying data center facilities.' },
  { domainCode: 'AWS_CLF_C02_D2', topicCode: '2.2', prompt: 'Which TWO AWS services help audit activity and evaluate resource configurations?', correct: ['AWS CloudTrail', 'AWS Config'], incorrect: ['Amazon Route 53', 'Amazon S3 Glacier', 'AWS Lambda'], explanation: 'CloudTrail records account and API activity; AWS Config records and evaluates resource configurations.' },
  { domainCode: 'AWS_CLF_C02_D3', topicCode: '3.3', prompt: 'Which TWO capabilities commonly work together to adjust EC2 capacity and distribute incoming traffic?', correct: ['Amazon EC2 Auto Scaling', 'Elastic Load Balancing'], incorrect: ['AWS Artifact', 'AWS Budgets', 'Amazon Macie'], explanation: 'EC2 Auto Scaling adjusts capacity, while Elastic Load Balancing distributes traffic.' },
  { domainCode: 'AWS_CLF_C02_D3', topicCode: '3.6', prompt: 'Which TWO are AWS storage services?', correct: ['Amazon S3', 'Amazon EBS'], incorrect: ['Amazon Route 53', 'AWS IAM', 'Amazon GuardDuty'], explanation: 'Amazon S3 provides object storage and Amazon EBS provides block storage.' },
  { domainCode: 'AWS_CLF_C02_D4', topicCode: '4.2', prompt: 'Which TWO tools can help a customer analyze costs and receive alerts when thresholds are exceeded?', correct: ['AWS Cost Explorer', 'AWS Budgets'], incorrect: ['AWS Shield', 'Amazon Inspector', 'Amazon VPC'], explanation: 'Cost Explorer supports cost analysis, while AWS Budgets supports thresholds and alerts.' },
]

async function clearExistingCertificationData(tx: any) {
  const certificates = await tx.certificate.findMany({ select: { id: true } })
  const certificateIds = certificates.map((item: { id: string }) => item.id)
  if (!certificateIds.length) return { certificates: 0, exams: 0, questions: 0 }

  const [questionLinks, exams] = await Promise.all([
    tx.certificationTopicQuestion.findMany({ where: { topic: { certificateId: { in: certificateIds } } }, select: { questionId: true } }),

    tx.exam.findMany({ where: { certificateId: { in: certificateIds } }, select: { id: true } }),
  ])
  const questionIds = [...new Set(questionLinks.map((item: { questionId: string }) => item.questionId))]

  const examIds = exams.map((item: { id: string }) => item.id)

  if (examIds.length) {
    const attempts = await tx.examAttempt.findMany({ where: { examId: { in: examIds } }, select: { id: true } })
    const attemptIds = attempts.map((item: { id: string }) => item.id)
    if (attemptIds.length) await tx.attemptAnswer.deleteMany({ where: { attemptId: { in: attemptIds } } })
    await tx.examAttempt.deleteMany({ where: { examId: { in: examIds } } })
    await tx.examQuestion.deleteMany({ where: { examId: { in: examIds } } })
    await tx.exam.deleteMany({ where: { id: { in: examIds } } })
  }

  await tx.learningProgress.deleteMany({
    where: {
      resourceType: 'certificate', resourceId: { in: certificateIds }
    },
  })
  await tx.certificate.deleteMany({ where: { id: { in: certificateIds } } })

  if (questionIds.length) {
    await tx.question.deleteMany({ where: { id: { in: questionIds }, examQuestions: { none: {} }, certificationTopics: { none: {} } } })
  }

  return { certificates: certificateIds.length, exams: examIds.length, questions: questionIds.length }
}

async function main() {
  const result = await prisma.$transaction(async (tx) => {
    const removed = await clearExistingCertificationData(tx)
    const creator = await tx.user.findFirst({
      where: { status: 'active' },
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    })
    if (!creator) throw new Error('Cần ít nhất một tài khoản active để làm người tạo dữ liệu seed.')

    const level = await tx.level.upsert({
      where: { code: 'beginner' },
      update: {},
      create: { code: 'beginner', name: 'Beginner', order: 1, description: 'Nền tảng tiếng Anh CNTT và kiến thức cloud cơ bản.', isActive: true },
    })

    const domainRecords: Record<string, { id: string }> = {}
    for (const [index, domain] of domains.entries()) {
      const record = await tx.domain.upsert({
        where: { code: domain.code },
        update: { name: domain.name, description: domain.description, icon: 'cloud', isActive: true },
        create: { code: domain.code, name: domain.name, description: domain.description, icon: 'cloud', isActive: true },
      })
      domainRecords[domain.code] = record
    }

    const certificate = await tx.certificate.create({
      data: {
        code: 'AWS-CLF-C02',
        name: 'AWS Certified Cloud Practitioner',
        provider: 'Amazon Web Services',
        description: 'Chứng chỉ nền tảng xác nhận hiểu biết tổng quan về AWS Cloud, dịch vụ, bảo mật, chi phí và thuật ngữ cloud.',
        category: 'Foundational',
        examDurationMinutes: 90,
        examQuestionCount: 65,
        passingScaledScore: 700,
        examUrl: 'https://docs.aws.amazon.com/aws-certification/latest/cloud-practitioner-02/cloud-practitioner-02.html',
        isActive: true,
        domains: {
          create: domains.map((domain, index) => ({
            domainId: domainRecords[domain.code].id,
            order: index + 1,
            weightPercent: domain.weightPercent,
            topics: domain.topics,
          })),
        },
      },
    })

    const topicRecords: Record<string, { id: string; domainCode: string; name: string }> = {}
    for (const domain of domains) {
      for (const [topicIndex, topic] of domain.topics.entries()) {
        const record = await tx.certificationTopic.create({
          data: {
            certificateId: certificate.id,
            domainId: domainRecords[domain.code].id,
            code: topic.code,
            name: topic.name,
            description: `CLF-C02 ${topic.code}: ${topic.name}`,
            order: topicIndex + 1,
          },
        })
        topicRecords[topic.code] = { id: record.id, domainCode: domain.code, name: topic.name }
      }
    }

    const vocabularyRecords: Record<string, { id: string }> = {}
    for (const concept of concepts) {
      const vocabulary = await tx.vocabulary.upsert({
        where: { term_domainId: { term: concept.term, domainId: domainRecords[concept.domainCode].id } },
        update: {
          definitionEn: concept.definitionEn,
          definitionVi: concept.definitionVi,
          tags: ['AWS', 'CLF-C02', concept.topicCode],
          levelId: level.id,
          status: 'published',
        },
        create: {
          term: concept.term,
          partOfSpeech: 'technical term',
          definitionEn: concept.definitionEn,
          definitionVi: concept.definitionVi,
          tags: ['AWS', 'CLF-C02', concept.topicCode],
          domainId: domainRecords[concept.domainCode].id,
          levelId: level.id,
          status: 'published',
          examples: {
            create: [{
              sentenceEn: `The team reviewed ${concept.term} while preparing for the AWS Cloud Practitioner exam.`,
              translationVi: `Nhóm đã ôn thuật ngữ ${concept.term} khi chuẩn bị cho kỳ thi AWS Cloud Practitioner.`,
              order: 1,
            }],
          },
        },
      })
      vocabularyRecords[`${concept.domainCode}:${concept.term}`] = vocabulary
      await tx.certificationTopicVocabulary.create({
        data: { topicId: topicRecords[concept.topicCode].id, vocabularyId: vocabulary.id },
      })
    }

    const createdQuestions: Array<{ id: string; domainCode: string; topicCode: string }> = []
    for (const domain of domains) {
      const pool = concepts.filter((concept) => concept.domainCode === domain.code)
      const target = singleQuestionTargets[domain.code]
      for (let index = 0; index < target; index++) {
        const concept = pool[index % pool.length]
        const distractors = [1, 2, 3].map((offset) => pool[(index + offset) % pool.length].term)
        const correctPosition = index % 4
        const optionTerms = [...distractors]
        optionTerms.splice(correctPosition, 0, concept.term)
        const prompt = index < pool.length
          ? `Which AWS concept or service best matches this description? ${concept.definitionEn}`
          : `A team needs this capability: ${concept.definitionEn} Which option should the team identify?`
        const question = await tx.question.create({
          data: {
            type: QuestionType.single_choice,
            prompt,
            explanation: `${concept.term}: ${concept.definitionEn}`,
            domainId: domainRecords[domain.code].id,
            levelId: level.id,
            topics: [concept.topicCode],
            acceptedAnswers: [String.fromCharCode(65 + correctPosition)],
            points: 1,
            status: 'published',
            options: {
              create: optionTerms.map((term, optionIndex) => ({
                key: String.fromCharCode(65 + optionIndex),
                text: term,
                isCorrect: optionIndex === correctPosition,
                order: optionIndex + 1,
              })),
            },
          },
        })
        await tx.certificationTopicQuestion.create({ data: { topicId: topicRecords[concept.topicCode].id, questionId: question.id } })
        createdQuestions.push({ id: question.id, domainCode: domain.code, topicCode: concept.topicCode })
      }
    }

    for (const item of multipleResponseQuestions) {
      const options = [...item.correct, ...item.incorrect]
      const question = await tx.question.create({
        data: {
          type: QuestionType.multiple_choice,
          prompt: item.prompt,
          explanation: item.explanation,
          domainId: domainRecords[item.domainCode].id,
          levelId: level.id,
          topics: [item.topicCode],
          acceptedAnswers: ['A', 'B'],
          points: 1,
          status: 'published',
          options: {
            create: options.map((text, index) => ({
              key: String.fromCharCode(65 + index),
              text,
              isCorrect: index < 2,
              order: index + 1,
            })),
          },
        },
      })
      await tx.certificationTopicQuestion.create({ data: { topicId: topicRecords[item.topicCode].id, questionId: question.id } })
      createdQuestions.push({ id: question.id, domainCode: item.domainCode, topicCode: item.topicCode })
    }

    // Mỗi Topic có tối thiểu 5 câu Quick Practice.
    for (const domain of domains) {
      const domainConcepts = concepts.filter((concept) => concept.domainCode === domain.code)
      for (const topic of domain.topics) {
        const topicConcepts = domainConcepts.filter((concept) => concept.topicCode === topic.code)
        while (createdQuestions.filter((question) => question.topicCode === topic.code).length < 5) {
          const sequence = createdQuestions.filter((question) => question.topicCode === topic.code).length
          const concept = topicConcepts[sequence % topicConcepts.length]
          const distractors = domainConcepts.filter((item) => item.term !== concept.term).slice(sequence % Math.max(1, domainConcepts.length - 3)).map((item) => item.term)
          while (distractors.length < 3) distractors.push(domainConcepts[(distractors.length + sequence) % domainConcepts.length].term)
          const correctPosition = sequence % 4
          const optionTerms = distractors.slice(0, 3)
          optionTerms.splice(correctPosition, 0, concept.term)
          const question = await tx.question.create({
            data: {
              type: QuestionType.single_choice,
              prompt: `In CLF-C02 Topic ${topic.code}, which option matches this requirement? ${concept.definitionEn}`,
              explanation: `${concept.term}: ${concept.definitionEn}`,
              domainId: domainRecords[domain.code].id,
              levelId: level.id,
              topics: [topic.code],
              acceptedAnswers: [String.fromCharCode(65 + correctPosition)],
              points: 1,
              status: 'published',
              options: { create: optionTerms.map((text, optionIndex) => ({ key: String.fromCharCode(65 + optionIndex), text, isCorrect: optionIndex === correctPosition, order: optionIndex + 1 })) },
            },
          })
          await tx.certificationTopicQuestion.create({ data: { topicId: topicRecords[topic.code].id, questionId: question.id } })
          createdQuestions.push({ id: question.id, domainCode: domain.code, topicCode: topic.code })
        }
      }
    }



    for (const domain of domains) {
      for (const topic of domain.topics) {
        const topicQuestions = createdQuestions.filter((question) => question.topicCode === topic.code).slice(0, 10)
        const practiceExam = await tx.exam.create({
          data: {
            title: `CLF-C02 Topic ${topic.code} Practice — ${topic.name}`,
            description: `Quick Practice cho Topic ${topic.code}: ${topic.name}.`,
            kind: ExamKind.practice,
            domainId: domainRecords[domain.code].id,
            levelId: level.id,
            certificateId: certificate.id,
            topics: [topic.code],
            durationMinutes: 10,
            passingScorePercent: 70,
            maxAttempts: 20,
            shuffleQuestions: true,
            status: 'published',
            publishedAt: new Date(),
            createdById: creator.id,
            questions: { create: topicQuestions.map((question, index) => ({ questionId: question.id, order: index + 1, weight: 1 })) },
          },
        })

      }
    }

    for (const [index, domain] of domains.entries()) {
      const domainQuestions = createdQuestions.filter((question) => question.domainCode === domain.code)
      await tx.exam.create({
        data: {
          title: `CLF-C02 Domain ${index + 1} Test — ${domain.name}`,
          description: `Bài luyện tập theo CLF-C02 Domain ${index + 1}, trọng số chính thức ${domain.weightPercent}%.`,
          kind: ExamKind.domain_test,
          domainId: domainRecords[domain.code].id,
          levelId: level.id,
          certificateId: certificate.id,
          topics: domain.topics.map((topic) => topic.code),
          durationMinutes: Math.max(15, domainQuestions.length),
          passingScorePercent: 70,
          maxAttempts: 10,
          shuffleQuestions: true,
          status: 'published',
          publishedAt: new Date(),
          createdById: creator.id,
          questions: {
            create: domainQuestions.map((question, questionIndex) => ({ questionId: question.id, order: questionIndex + 1, weight: 1 })),
          },
        },
      })
    }

    const mockTargets: Record<string, number> = { AWS_CLF_C02_D1: 16, AWS_CLF_C02_D2: 19, AWS_CLF_C02_D3: 22, AWS_CLF_C02_D4: 8 }
    const mockQuestions: typeof createdQuestions = []
    for (const domain of domains) {
      const selected: typeof createdQuestions = []
      let round = 0
      while (selected.length < mockTargets[domain.code]) {
        for (const topic of domain.topics) {
          const candidates = createdQuestions.filter((question) => question.topicCode === topic.code)
          const candidate = candidates[round % candidates.length]
          if (candidate && !selected.some((question) => question.id === candidate.id)) selected.push(candidate)
          if (selected.length === mockTargets[domain.code]) break
        }
        round += 1
      }
      mockQuestions.push(...selected)
    }

    await tx.exam.create({
      data: {
        title: 'AWS Certified Cloud Practitioner CLF-C02 — Mock Exam #1',
        description: 'Đề luyện tập 65 câu trong 90 phút, phân bổ theo blueprint CLF-C02. Đây là câu hỏi luyện tập tự biên soạn, không phải câu hỏi thi chính thức của AWS.',
        kind: ExamKind.mock_exam,
        domainId: domainRecords.AWS_CLF_C02_D1.id,
        levelId: level.id,
        certificateId: certificate.id,
        topics: ['CLF-C02', 'full-mock'],
        durationMinutes: 90,
        passingScorePercent: 70,
        maxAttempts: 5,
        shuffleQuestions: true,
        status: 'published',
        publishedAt: new Date(),
        createdById: creator.id,
        questions: {
          create: mockQuestions.map((question, index) => ({ questionId: question.id, order: index + 1, weight: 1 })),
        },
      },
    })

    return {
      removed,
      certificate: { id: certificate.id, code: certificate.code, name: certificate.name },
      domains: domains.length,
      topics: domains.reduce((sum, domain) => sum + domain.topics.length, 0),
      vocabulary: concepts.length,
      questions: createdQuestions.length,
      domainTests: domains.length,
      topicPractices: domains.reduce((sum, domain) => sum + domain.topics.length, 0),
      mockExams: 1,
    }
  }, { maxWait: 20_000, timeout: 120_000 })

  console.log(JSON.stringify(result, null, 2))
}

main()
  .catch((error) => {
    console.error('Không thể seed AWS CLF-C02:', error)
    process.exitCode = 1
  })
  .finally(async () => prisma.$disconnect())
