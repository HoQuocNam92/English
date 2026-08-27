import { PrismaClient, UserRole, UserStatus, ContentStatus, LevelCode } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Bắt đầu seed database TechEnglish Pro...')

  // ============================================================
  // 1. LEARNING LEVELS
  // ============================================================
  console.log('📊 Seed Learning Levels...')
  const levels = await Promise.all([
    prisma.level.upsert({
      where: { code: LevelCode.beginner },
      update: {},
      create: {
        code: LevelCode.beginner,
        name: 'Beginner',
        order: 1,
        description: 'Suitable for those new to technical English. Covers basic IT vocabulary and simple technical reading.',
        isActive: true,
      },
    }),
    prisma.level.upsert({
      where: { code: LevelCode.intermediate },
      update: {},
      create: {
        code: LevelCode.intermediate,
        name: 'Intermediate',
        order: 2,
        description: 'For learners familiar with IT basics. Covers intermediate technical documentation and scenario-based content.',
        isActive: true,
      },
    }),
    prisma.level.upsert({
      where: { code: LevelCode.advanced },
      update: {},
      create: {
        code: LevelCode.advanced,
        name: 'Advanced',
        order: 3,
        description: 'For experienced engineers. Covers complex API documentation, architecture patterns, and certification exam content.',
        isActive: true,
      },
    }),
    prisma.level.upsert({
      where: { code: LevelCode.professional },
      update: {},
      create: {
        code: LevelCode.professional,
        name: 'Professional',
        order: 4,
        description: 'Expert-level. Covers advanced system design, enterprise architecture, and professional certification preparation.',
        isActive: true,
      },
    }),
  ])
  console.log(`   ✅ ${levels.length} levels seeded`)

  // ============================================================
  // 2. IT DOMAINS
  // ============================================================
  console.log('🌐 Seed IT Domains...')
  const domainData = [
    { code: 'CLOUD', name: 'Cloud Computing', description: 'Cloud platforms, services, infrastructure, and deployment models (AWS, GCP, Azure).', icon: 'cloud' },
    { code: 'CYBERSEC', name: 'Cybersecurity', description: 'Network security, threat analysis, encryption, compliance, and security operations.', icon: 'shield' },
    { code: 'NETWORKING', name: 'Networking', description: 'TCP/IP, routing, switching, network protocols, and infrastructure management.', icon: 'network' },
    { code: 'DATA_ENG', name: 'Data Engineering', description: 'Data pipelines, ETL processes, data warehousing, and big data platforms.', icon: 'database' },
    { code: 'DATA_SCI', name: 'Data Science', description: 'Machine learning, statistical analysis, data visualization, and AI fundamentals.', icon: 'chart-bar' },
    { code: 'SOFTWARE_ENG', name: 'Software Engineering', description: 'Software design patterns, clean architecture, APIs, testing, and best practices.', icon: 'code' },
    { code: 'DEVOPS', name: 'DevOps', description: 'CI/CD pipelines, container orchestration, infrastructure as code, and SRE practices.', icon: 'loop' },
  ]

  const domains: Record<string, { id: string; name: string; code: string }> = {}
  for (const d of domainData) {
    const domain = await prisma.domain.upsert({
      where: { code: d.code },
      update: {},
      create: { ...d, isActive: true },
    })
    domains[d.code] = domain
  }
  console.log(`   ✅ ${Object.keys(domains).length} domains seeded`)

  // ============================================================
  // 3. CAREER GOALS
  // ============================================================
  console.log('🎯 Seed Career Goals...')
  const careerGoalData = [
    { code: 'BACKEND_ENGINEER', name: 'Backend Engineer', description: 'Design and build scalable server-side systems and APIs.' },
    { code: 'FRONTEND_ENGINEER', name: 'Frontend Engineer', description: 'Build responsive, accessible web interfaces and client-side applications.' },
    { code: 'FULLSTACK_ENGINEER', name: 'Full-Stack Engineer', description: 'Develop both client-side and server-side components of web applications.' },
    { code: 'DEVOPS_ENGINEER', name: 'DevOps Engineer', description: 'Automate infrastructure, manage CI/CD, and maintain system reliability.' },
    { code: 'CLOUD_ARCHITECT', name: 'Cloud Architect', description: 'Design cloud-native architectures and migration strategies.' },
    { code: 'DATA_ENGINEER', name: 'Data Engineer', description: 'Build and maintain data pipelines, warehouses, and analytics infrastructure.' },
    { code: 'ML_ENGINEER', name: 'ML Engineer', description: 'Design, train, and deploy machine learning models at scale.' },
    { code: 'SECURITY_ENGINEER', name: 'Security Engineer', description: 'Protect systems and data through security engineering and threat modeling.' },
    { code: 'SOLUTION_ARCHITECT', name: 'Solutions Architect', description: 'Design end-to-end technical solutions and guide architecture decisions.' },
    { code: 'SRE', name: 'Site Reliability Engineer', description: 'Ensure reliability, scalability, and performance of production systems.' },
  ]

  for (const cg of careerGoalData) {
    await prisma.careerGoal.upsert({
      where: { code: cg.code },
      update: {},
      create: { ...cg, isActive: true },
    })
  }
  console.log(`   ✅ ${careerGoalData.length} career goals seeded`)

  // ============================================================
  // 4. CERTIFICATES
  // ============================================================
  console.log('🏆 Seed Certificates...')
  const certData = [
    {
      code: 'AWS-SAA',
      name: 'AWS Certified Solutions Architect – Associate',
      provider: 'Amazon Web Services',
      description: 'Validates expertise in designing distributed systems on AWS. Covers high availability, cost optimization, and security.',
      examUrl: 'https://aws.amazon.com/certification/certified-solutions-architect-associate/',
      domainCodes: ['CLOUD'],
    },
    {
      code: 'AWS-DVA',
      name: 'AWS Certified Developer – Associate',
      provider: 'Amazon Web Services',
      description: 'Validates proficiency in developing and maintaining AWS-based applications.',
      examUrl: 'https://aws.amazon.com/certification/certified-developer-associate/',
      domainCodes: ['CLOUD', 'SOFTWARE_ENG'],
    },
    {
      code: 'CKA',
      name: 'Certified Kubernetes Administrator',
      provider: 'Cloud Native Computing Foundation',
      description: 'Demonstrates skills in Kubernetes cluster administration, workload management, and troubleshooting.',
      examUrl: 'https://www.cncf.io/certification/cka/',
      domainCodes: ['DEVOPS', 'CLOUD'],
    },
    {
      code: 'COMPTIA-SECURITY-PLUS',
      name: 'CompTIA Security+',
      provider: 'CompTIA',
      description: 'Entry-level cybersecurity certification covering network security, threats, and compliance.',
      examUrl: 'https://www.comptia.org/certifications/security',
      domainCodes: ['CYBERSEC', 'NETWORKING'],
    },
    {
      code: 'GCP-ACE',
      name: 'Google Cloud Associate Cloud Engineer',
      provider: 'Google Cloud',
      description: 'Validates ability to deploy applications and monitor cloud operations on Google Cloud.',
      examUrl: 'https://cloud.google.com/certification/cloud-engineer',
      domainCodes: ['CLOUD'],
    },
    {
      code: 'AZURE-AZ900',
      name: 'Microsoft Azure Fundamentals (AZ-900)',
      provider: 'Microsoft',
      description: 'Foundation-level certification covering Azure cloud concepts, services, and pricing.',
      examUrl: 'https://learn.microsoft.com/certifications/azure-fundamentals/',
      domainCodes: ['CLOUD'],
    },
  ]

  const certs: Record<string, { id: string }> = {}
  for (const c of certData) {
    const cert = await prisma.certificate.upsert({
      where: { code: c.code },
      update: {},
      create: {
        code: c.code,
        name: c.name,
        provider: c.provider,
        description: c.description,
        examUrl: c.examUrl,
        isActive: true,
        domains: {
          create: c.domainCodes.map((dc) => ({ domain: { connect: { code: dc } } })),
        },
      },
    })
    certs[c.code] = cert
  }
  console.log(`   ✅ ${Object.keys(certs).length} certificates seeded`)

  // ============================================================
  // 5. DEMO USERS
  // ============================================================
  console.log('👥 Seed Demo Users...')
  const passwordHash = await bcrypt.hash('Demo@123456', 12)

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@techenglish.pro' },
    update: {},
    create: {
      email: 'admin@techenglish.pro',
      displayName: 'Admin TechEnglish',
      passwordHash,
      role: UserRole.admin,
      status: UserStatus.active,
    },
  })

  const teacherUser = await prisma.user.upsert({
    where: { email: 'teacher@techenglish.pro' },
    update: {},
    create: {
      email: 'teacher@techenglish.pro',
      displayName: 'Giảng viên Demo',
      passwordHash,
      role: UserRole.teacher,
      status: UserStatus.active,
    },
  })

  const learner1 = await prisma.user.upsert({
    where: { email: 'learner1@techenglish.pro' },
    update: {},
    create: {
      email: 'learner1@techenglish.pro',
      displayName: 'Nguyễn Văn Nam',
      passwordHash,
      role: UserRole.learner,
      status: UserStatus.active,
    },
  })

  const learner2 = await prisma.user.upsert({
    where: { email: 'learner2@techenglish.pro' },
    update: {},
    create: {
      email: 'learner2@techenglish.pro',
      displayName: 'Trần Thị Lan',
      passwordHash,
      role: UserRole.learner,
      status: UserStatus.active,
    },
  })

  console.log('   ✅ 4 demo users seeded (admin, teacher, learner x2)')

  // ============================================================
  // 6. LEARNER PROFILES
  // ============================================================
  console.log('📋 Seed Learner Profiles...')
  await prisma.learnerProfile.upsert({
    where: { userId: learner1.id },
    update: {},
    create: {
      userId: learner1.id,
      levelId: levels[1].id, // intermediate
      bio: 'Backend developer đang chuẩn bị cho AWS Solutions Architect.',
      weeklyStudyTargetMinutes: 300,
      onboardingCompleted: true,
      domains: { create: [{ domainId: domains['CLOUD'].id }, { domainId: domains['SOFTWARE_ENG'].id }] },
      careerGoals: { create: [{ careerGoalId: (await prisma.careerGoal.findUnique({ where: { code: 'CLOUD_ARCHITECT' } }))!.id }] },
      certGoals: {
        create: [{
          certificateId: certs['AWS-SAA'].id,
          targetDate: new Date('2026-12-31'),
        }],
      },
    },
  })

  await prisma.learnerProfile.upsert({
    where: { userId: learner2.id },
    update: {},
    create: {
      userId: learner2.id,
      levelId: levels[0].id, // beginner
      bio: 'Sinh viên năm 4 ngành CNTT, quan tâm DevOps và Cloud.',
      weeklyStudyTargetMinutes: 180,
      onboardingCompleted: true,
      domains: { create: [{ domainId: domains['DEVOPS'].id }, { domainId: domains['CLOUD'].id }] },
      careerGoals: { create: [{ careerGoalId: (await prisma.careerGoal.findUnique({ where: { code: 'DEVOPS_ENGINEER' } }))!.id }] },
      certGoals: {
        create: [{
          certificateId: certs['CKA'].id,
          targetDate: new Date('2027-03-31'),
        }],
      },
    },
  })
  console.log('   ✅ 2 learner profiles seeded')

  // ============================================================
  // 7. SAMPLE VOCABULARIES
  // ============================================================
  console.log('📚 Seed Sample Vocabularies...')
  const vocabData = [
    {
      term: 'idempotent',
      pronunciationIpa: '/ˌaɪdəmˈpoʊtənt/',
      partOfSpeech: 'adjective',
      definitionEn: 'Describing an operation that produces the same result regardless of how many times it is performed.',
      definitionVi: 'Mô tả một phép toán cho ra kết quả giống nhau dù được thực hiện bao nhiêu lần.',
      domainCode: 'SOFTWARE_ENG',
      levelCode: LevelCode.intermediate,
      tags: ['REST API', 'HTTP', 'design'],
      examples: [
        { sentenceEn: 'A PUT request should be idempotent — sending it twice should produce the same result as sending it once.', translationVi: 'Một request PUT nên là idempotent — gửi hai lần phải cho kết quả giống như gửi một lần.' },
      ],
    },
    {
      term: 'microservice',
      pronunciationIpa: '/ˈmaɪkrəˌsɜːrvɪs/',
      partOfSpeech: 'noun',
      definitionEn: 'An architectural pattern that structures an application as a collection of small, independently deployable services.',
      definitionVi: 'Kiểu kiến trúc cấu trúc ứng dụng thành tập hợp các dịch vụ nhỏ, có thể triển khai độc lập.',
      domainCode: 'SOFTWARE_ENG',
      levelCode: LevelCode.intermediate,
      tags: ['architecture', 'distributed systems'],
      examples: [
        { sentenceEn: 'Netflix uses a microservice architecture to scale individual components independently.', translationVi: 'Netflix sử dụng kiến trúc microservice để mở rộng từng thành phần một cách độc lập.' },
      ],
    },
    {
      term: 'containerization',
      pronunciationIpa: '/kənˌteɪnəraɪˈzeɪʃən/',
      partOfSpeech: 'noun',
      definitionEn: 'The process of packaging an application and its dependencies into a container that can run consistently across environments.',
      definitionVi: 'Quá trình đóng gói ứng dụng và các dependency vào một container có thể chạy nhất quán trên mọi môi trường.',
      domainCode: 'DEVOPS',
      levelCode: LevelCode.beginner,
      tags: ['Docker', 'Kubernetes', 'deployment'],
      examples: [
        { sentenceEn: 'Containerization with Docker eliminates the "it works on my machine" problem.', translationVi: 'Containerization với Docker loại bỏ vấn đề "chạy được trên máy tôi".' },
      ],
    },
    {
      term: 'latency',
      pronunciationIpa: '/ˈleɪtənsi/',
      partOfSpeech: 'noun',
      definitionEn: 'The time delay between a request being sent and the response being received, typically measured in milliseconds.',
      definitionVi: 'Độ trễ thời gian giữa lúc gửi yêu cầu và nhận phản hồi, thường đo bằng mili giây.',
      domainCode: 'NETWORKING',
      levelCode: LevelCode.beginner,
      tags: ['performance', 'networking', 'SRE'],
      examples: [
        { sentenceEn: 'High network latency can significantly degrade user experience in real-time applications.', translationVi: 'Độ trễ mạng cao có thể làm giảm đáng kể trải nghiệm người dùng trong các ứng dụng thời gian thực.' },
      ],
    },
    {
      term: 'autoscaling',
      pronunciationIpa: '/ˈɔːtəʊˌskeɪlɪŋ/',
      partOfSpeech: 'noun',
      definitionEn: 'The ability of a cloud system to automatically adjust compute resources based on current demand.',
      definitionVi: 'Khả năng của hệ thống đám mây tự động điều chỉnh tài nguyên tính toán dựa trên nhu cầu hiện tại.',
      domainCode: 'CLOUD',
      levelCode: LevelCode.intermediate,
      tags: ['AWS', 'scaling', 'cloud'],
      examples: [
        { sentenceEn: 'AWS Auto Scaling ensures your application can handle traffic spikes without manual intervention.', translationVi: 'AWS Auto Scaling đảm bảo ứng dụng của bạn xử lý được lượng truy cập tăng đột biến mà không cần can thiệp thủ công.' },
      ],
    },
  ]

  for (const v of vocabData) {
    const existing = await prisma.vocabulary.findFirst({ where: { term: v.term, domainId: domains[v.domainCode].id } })
    if (!existing) {
      const levelRecord = await prisma.level.findUnique({ where: { code: v.levelCode } })
      await prisma.vocabulary.create({
        data: {
          term: v.term,
          pronunciationIpa: v.pronunciationIpa,
          partOfSpeech: v.partOfSpeech,
          definitionEn: v.definitionEn,
          definitionVi: v.definitionVi,
          domainId: domains[v.domainCode].id,
          levelId: levelRecord!.id,
          tags: v.tags,
          status: ContentStatus.published,
          examples: {
            create: v.examples.map((e, i) => ({ ...e, order: i + 1 })),
          },
        },
      })
    }
  }
  console.log(`   ✅ ${vocabData.length} vocabularies seeded`)

  // ============================================================
  // 8. SAMPLE LESSONS
  // ============================================================
  console.log('📖 Seed Sample Lessons...')
  const lesson1 = await prisma.lesson.upsert({
    where: { slug: 'understanding-rest-apis' },
    update: {},
    create: {
      title: 'Understanding REST APIs',
      slug: 'understanding-rest-apis',
      summary: 'Learn the core concepts of RESTful APIs including HTTP methods, status codes, and API design principles.',
      type: 'technical_reading',
      domainId: domains['SOFTWARE_ENG'].id,
      levelId: levels[1].id, // intermediate
      estimatedMinutes: 30,
      status: ContentStatus.published,
      publishedAt: new Date(),
      createdById: teacherUser.id,
      sections: {
        create: [
          {
            type: 'heading',
            order: 1,
            title: 'What is a REST API?',
            content: { text: 'What is a REST API?' },
          },
          {
            type: 'rich_text',
            order: 2,
            content: {
              text: 'REST (Representational State Transfer) is an architectural style for distributed hypermedia systems. A REST API uses HTTP requests to perform CRUD operations — Create (POST), Read (GET), Update (PUT/PATCH), and Delete (DELETE).',
            },
          },
          {
            type: 'code',
            order: 3,
            title: 'Example: GET request',
            content: {
              language: 'http',
              code: 'GET /api/v1/users/123 HTTP/1.1\nHost: api.example.com\nAuthorization: Bearer <token>',
            },
          },
          {
            type: 'rich_text',
            order: 4,
            content: {
              text: 'Key REST principles include statelessness, uniform interface, client-server architecture, and cacheability. Understanding these principles helps you design scalable and maintainable APIs.',
            },
          },
        ],
      },
    },
  })

  const lesson2 = await prisma.lesson.upsert({
    where: { slug: 'aws-cloud-fundamentals' },
    update: {},
    create: {
      title: 'AWS Cloud Fundamentals',
      slug: 'aws-cloud-fundamentals',
      summary: 'An introduction to Amazon Web Services core services, global infrastructure, and cloud computing models.',
      type: 'technical_reading',
      domainId: domains['CLOUD'].id,
      levelId: levels[0].id, // beginner
      estimatedMinutes: 45,
      status: ContentStatus.published,
      publishedAt: new Date(),
      createdById: teacherUser.id,
      certificates: {
        create: [{ certificateId: certs['AWS-SAA'].id }],
      },
      sections: {
        create: [
          {
            type: 'heading',
            order: 1,
            title: 'AWS Global Infrastructure',
            content: { text: 'AWS Global Infrastructure' },
          },
          {
            type: 'rich_text',
            order: 2,
            content: {
              text: 'Amazon Web Services (AWS) is the world\'s most comprehensive and broadly adopted cloud platform. AWS has 31 launched Regions worldwide, each consisting of multiple Availability Zones (AZs).',
            },
          },
        ],
      },
    },
  })
  console.log('   ✅ 2 sample lessons seeded')

  // ============================================================
  // 9. SAMPLE QUESTIONS
  // ============================================================
  console.log('❓ Seed Sample Questions...')
  const q1 = await prisma.question.create({
    data: {
      type: 'single_choice',
      prompt: 'Which HTTP method should be used to update a specific resource while being idempotent?',
      explanation: 'PUT is idempotent — calling it multiple times with the same data produces the same result. PATCH is for partial updates and may or may not be idempotent depending on implementation. POST creates new resources and is not idempotent.',
      domainId: domains['SOFTWARE_ENG'].id,
      levelId: levels[1].id,
      topics: ['REST API', 'HTTP methods', 'idempotency'],
      points: 1.0,
      status: ContentStatus.published,
      options: {
        create: [
          { key: 'A', text: 'POST', isCorrect: false, explanation: 'POST creates new resources and is not idempotent.', order: 1 },
          { key: 'B', text: 'PUT', isCorrect: true, explanation: 'PUT replaces the entire resource and is idempotent by definition.', order: 2 },
          { key: 'C', text: 'GET', isCorrect: false, explanation: 'GET is for reading resources, not updating.', order: 3 },
          { key: 'D', text: 'DELETE', isCorrect: false, explanation: 'DELETE removes a resource, not updates it.', order: 4 },
        ],
      },
    },
  })

  await prisma.question.create({
    data: {
      type: 'single_choice',
      prompt: 'A company needs to store user session data that requires sub-millisecond latency. Which AWS service is most appropriate?',
      context: 'The application processes 10,000 concurrent user sessions. Session data is small (< 1KB) but accessed frequently with very low latency requirements.',
      explanation: 'Amazon ElastiCache (Redis) provides in-memory caching with sub-millisecond latency, making it ideal for session storage. S3 is for object storage, RDS is a relational database, and DynamoDB, while fast, does not match the sub-millisecond latency of in-memory solutions.',
      domainId: domains['CLOUD'].id,
      levelId: levels[1].id,
      topics: ['AWS', 'caching', 'session management', 'performance'],
      points: 1.0,
      status: ContentStatus.published,
      certificates: { create: [{ certificateId: certs['AWS-SAA'].id }] },
      options: {
        create: [
          { key: 'A', text: 'Amazon S3', isCorrect: false, explanation: 'S3 is object storage, not suitable for low-latency session data.', order: 1 },
          { key: 'B', text: 'Amazon RDS', isCorrect: false, explanation: 'RDS is a relational database, not optimized for sub-millisecond latency.', order: 2 },
          { key: 'C', text: 'Amazon ElastiCache (Redis)', isCorrect: true, explanation: 'ElastiCache Redis provides in-memory, sub-millisecond latency storage perfect for sessions.', order: 3 },
          { key: 'D', text: 'Amazon DynamoDB', isCorrect: false, explanation: 'DynamoDB is fast but not sub-millisecond; ElastiCache is better for this case.', order: 4 },
        ],
      },
    },
  })

  await prisma.question.create({
    data: {
      type: 'scenario',
      prompt: 'Your team receives the following error when deploying a containerized application: "OOMKilled — container exceeded memory limit." What is the most likely cause and solution?',
      context: 'The application is a Node.js service running in a Kubernetes pod with a 256Mi memory limit. Recent code changes added a new data processing feature that loads CSV files into memory.',
      explanation: 'OOMKilled (Out of Memory Killed) occurs when a container exceeds its configured memory limit. The solution is to either increase the memory limit in the pod spec or optimize the code to process data in chunks/streams instead of loading the entire file into memory.',
      domainId: domains['DEVOPS'].id,
      levelId: levels[2].id,
      topics: ['Kubernetes', 'memory management', 'troubleshooting', 'OOM'],
      points: 2.0,
      status: ContentStatus.published,
      certificates: { create: [{ certificateId: certs['CKA'].id }] },
      options: {
        create: [
          { key: 'A', text: 'The container image is corrupted and needs to be rebuilt.', isCorrect: false, explanation: 'Image corruption would cause a different error, not OOMKilled.', order: 1 },
          { key: 'B', text: 'The memory limit is too low for the current workload; increase it or optimize memory usage.', isCorrect: true, explanation: 'OOMKilled directly indicates memory limit exceeded. Increase the limit or optimize code.', order: 2 },
          { key: 'C', text: 'The Kubernetes cluster has insufficient CPU resources.', isCorrect: false, explanation: 'CPU issues cause throttling or pending pods, not OOMKilled.', order: 3 },
          { key: 'D', text: 'The Node.js version is incompatible with the base image.', isCorrect: false, explanation: 'Incompatibility issues would appear at startup, not as OOMKilled.', order: 4 },
        ],
      },
    },
  })
  console.log('   ✅ 3 sample questions seeded')

  // ============================================================
  // 10. SAMPLE EXAM
  // ============================================================
  console.log('📝 Seed Sample Exam...')
  const allPublishedQuestions = await prisma.question.findMany({
    where: { status: ContentStatus.published },
    take: 3,
  })

  if (allPublishedQuestions.length >= 2) {
    const existingExam = await prisma.exam.findFirst({ where: { title: 'REST API & Cloud Fundamentals Quiz' } })
    if (!existingExam) {
      await prisma.exam.create({
        data: {
          title: 'REST API & Cloud Fundamentals Quiz',
          description: 'A mixed quiz covering REST API principles and AWS cloud fundamentals. Suitable for intermediate learners.',
          domainId: domains['SOFTWARE_ENG'].id,
          levelId: levels[1].id,
          certificateId: certs['AWS-SAA'].id,
          topics: ['REST API', 'AWS', 'cloud fundamentals'],
          durationMinutes: 20,
          passingScorePercent: 70.0,
          maxAttempts: 3,
          shuffleQuestions: true,
          status: ContentStatus.published,
          publishedAt: new Date(),
          createdById: teacherUser.id,
          questions: {
            create: allPublishedQuestions.slice(0, 3).map((q, index) => ({
              questionId: q.id,
              order: index + 1,
              weight: 1.0,
            })),
          },
        },
      })
    }
  }
  console.log('   ✅ 1 sample exam seeded')

  // ============================================================
  // 11. LEARNER GROUP
  // ============================================================
  console.log('👨‍🎓 Seed Learner Group...')
  const existingGroup = await prisma.learnerGroup.findFirst({ where: { name: 'AWS Solutions Architect Fast-Track #01' } })
  if (!existingGroup) {
    await prisma.learnerGroup.create({
      data: {
        name: 'AWS Solutions Architect Fast-Track #01',
        description: 'Intensive group for professionals targeting the AWS SAA certification within 3 months.',
        teacherId: teacherUser.id,
        domainId: domains['CLOUD'].id,
        certificateId: certs['AWS-SAA'].id,
        status: 'active',
        startsAt: new Date('2026-09-01'),
        endsAt: new Date('2026-11-30'),
        members: {
          create: [
            { learnerId: learner1.id },
            { learnerId: learner2.id },
          ],
        },
      },
    })
  }
  console.log('   ✅ 1 learner group seeded')

  console.log('\n✨ Seed hoàn tất! Database TechEnglish Pro sẵn sàng sử dụng.')
  console.log('\n📌 Tài khoản demo:')
  console.log('   Admin:    admin@techenglish.pro    / Demo@123456')
  console.log('   Teacher:  teacher@techenglish.pro  / Demo@123456')
  console.log('   Learner1: learner1@techenglish.pro / Demo@123456')
  console.log('   Learner2: learner2@techenglish.pro / Demo@123456')
}

main()
  .catch((e) => {
    console.error('❌ Seed thất bại:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
