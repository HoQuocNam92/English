import { PrismaClient, UserStatus, ContentStatus, LevelCode, QuestionType, AttemptStatus, ProgressStatus, ProgressResourceType, RecommendationResourceType } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Bắt đầu seed TechEnglish Pro...')

  // ============================================================
  // 1. LEARNING LEVELS
  // ============================================================
  const levels = await Promise.all([
    prisma.level.upsert({ where: { code: LevelCode.beginner }, update: {}, create: { code: LevelCode.beginner, name: 'Beginner', order: 1, description: 'Phù hợp với người mới bắt đầu học tiếng Anh IT. Bao gồm từ vựng cơ bản và đọc hiểu tài liệu kỹ thuật đơn giản.', isActive: true } }),
    prisma.level.upsert({ where: { code: LevelCode.intermediate }, update: {}, create: { code: LevelCode.intermediate, name: 'Intermediate', order: 2, description: 'Dành cho người đã quen với IT cơ bản. Bao gồm tài liệu kỹ thuật trung cấp và nội dung dựa trên tình huống.', isActive: true } }),
    prisma.level.upsert({ where: { code: LevelCode.advanced }, update: {}, create: { code: LevelCode.advanced, name: 'Advanced', order: 3, description: 'Cho kỹ sư có kinh nghiệm. Tài liệu API phức tạp, kiến trúc hệ thống và nội dung chuẩn bị chứng chỉ.', isActive: true } }),
    prisma.level.upsert({ where: { code: LevelCode.professional }, update: {}, create: { code: LevelCode.professional, name: 'Professional', order: 4, description: 'Cấp chuyên gia. System design nâng cao, enterprise architecture và chuẩn bị chứng chỉ quốc tế.', isActive: true } }),
  ])
  console.log(`   ✅ ${levels.length} levels`)

  // ============================================================
  // 2. IT DOMAINS
  // ============================================================
  const domainData = [
    { code: 'CLOUD', name: 'Cloud Computing', description: 'AWS, GCP, Azure — cloud platforms, services, và deployment models.', icon: 'cloud' },
    { code: 'CYBERSEC', name: 'Cybersecurity', description: 'Network security, threat analysis, encryption, và security operations.', icon: 'shield' },
    { code: 'NETWORKING', name: 'Networking', description: 'TCP/IP, routing, switching, network protocols, và infrastructure.', icon: 'network' },
    { code: 'DATA_ENG', name: 'Data Engineering', description: 'Data pipelines, ETL, data warehousing, và big data platforms.', icon: 'database' },
    { code: 'DATA_SCI', name: 'Data Science', description: 'Machine learning, statistical analysis, data visualization, và AI.', icon: 'chart-bar' },
    { code: 'SOFTWARE_ENG', name: 'Software Engineering', description: 'Design patterns, clean architecture, APIs, testing, và best practices.', icon: 'code' },
    { code: 'DEVOPS', name: 'DevOps', description: 'CI/CD pipelines, container orchestration, infrastructure as code, và SRE.', icon: 'loop' },
  ]
  const domains: Record<string, { id: string; name: string; code: string }> = {}
  for (const d of domainData) {
    domains[d.code] = await prisma.domain.upsert({ where: { code: d.code }, update: {}, create: { ...d, isActive: true } })
  }
  console.log(`   ✅ ${Object.keys(domains).length} domains`)

  // ============================================================
  // 3. CAREER GOALS
  // ============================================================
  const careerGoalData = [
    { code: 'BACKEND_ENGINEER', name: 'Backend Engineer', description: 'Thiết kế và xây dựng hệ thống server-side và API có khả năng mở rộng.' },
    { code: 'FRONTEND_ENGINEER', name: 'Frontend Engineer', description: 'Xây dựng web interface responsive, accessible và client-side applications.' },
    { code: 'FULLSTACK_ENGINEER', name: 'Full-Stack Engineer', description: 'Phát triển cả client-side và server-side của ứng dụng web.' },
    { code: 'DEVOPS_ENGINEER', name: 'DevOps Engineer', description: 'Tự động hoá infrastructure, quản lý CI/CD và duy trì độ tin cậy hệ thống.' },
    { code: 'CLOUD_ARCHITECT', name: 'Cloud Architect', description: 'Thiết kế kiến trúc cloud-native và chiến lược migration.' },
    { code: 'DATA_ENGINEER', name: 'Data Engineer', description: 'Xây dựng và duy trì data pipelines, warehouses, và analytics infrastructure.' },
    { code: 'ML_ENGINEER', name: 'ML Engineer', description: 'Thiết kế, huấn luyện và triển khai các mô hình machine learning quy mô lớn.' },
    { code: 'SECURITY_ENGINEER', name: 'Security Engineer', description: 'Bảo vệ hệ thống và dữ liệu thông qua security engineering và threat modeling.' },
    { code: 'SOLUTION_ARCHITECT', name: 'Solutions Architect', description: 'Thiết kế giải pháp kỹ thuật end-to-end và định hướng kiến trúc.' },
    { code: 'SRE', name: 'Site Reliability Engineer', description: 'Đảm bảo độ tin cậy, khả năng mở rộng và hiệu suất của hệ thống production.' },
  ]
  for (const cg of careerGoalData) {
    await prisma.careerGoal.upsert({ where: { code: cg.code }, update: {}, create: { ...cg, isActive: true } })
  }
  console.log(`   ✅ ${careerGoalData.length} career goals`)

  // ============================================================
  // 4. CERTIFICATES
  // ============================================================
  const certData = [
    { code: 'AWS-SAA', name: 'AWS Certified Solutions Architect – Associate', provider: 'Amazon Web Services', description: 'Xác nhận chuyên môn thiết kế hệ thống phân tán trên AWS. Bao gồm high availability, cost optimization và security.', examUrl: 'https://aws.amazon.com/certification/certified-solutions-architect-associate/', domainCodes: ['CLOUD'] },
    { code: 'AWS-DVA', name: 'AWS Certified Developer – Associate', provider: 'Amazon Web Services', description: 'Xác nhận năng lực phát triển và maintain ứng dụng AWS-based.', examUrl: 'https://aws.amazon.com/certification/certified-developer-associate/', domainCodes: ['CLOUD', 'SOFTWARE_ENG'] },
    { code: 'CKA', name: 'Certified Kubernetes Administrator', provider: 'Cloud Native Computing Foundation', description: 'Chứng nhận kỹ năng quản trị Kubernetes cluster, quản lý workloads và troubleshooting.', examUrl: 'https://www.cncf.io/certification/cka/', domainCodes: ['DEVOPS', 'CLOUD'] },
    { code: 'COMPTIA-SECURITY-PLUS', name: 'CompTIA Security+', provider: 'CompTIA', description: 'Chứng chỉ cybersecurity entry-level bao gồm network security, threats và compliance.', examUrl: 'https://www.comptia.org/certifications/security', domainCodes: ['CYBERSEC', 'NETWORKING'] },
    { code: 'GCP-ACE', name: 'Google Cloud Associate Cloud Engineer', provider: 'Google Cloud', description: 'Xác nhận khả năng triển khai ứng dụng và monitor cloud operations trên Google Cloud.', examUrl: 'https://cloud.google.com/certification/cloud-engineer', domainCodes: ['CLOUD'] },
    { code: 'AZURE-AZ900', name: 'Microsoft Azure Fundamentals (AZ-900)', provider: 'Microsoft', description: 'Chứng chỉ foundation-level về Azure cloud concepts, services và pricing.', examUrl: 'https://learn.microsoft.com/certifications/azure-fundamentals/', domainCodes: ['CLOUD'] },
  ]
  const certs: Record<string, { id: string }> = {}
  for (const c of certData) {
    certs[c.code] = await prisma.certificate.upsert({
      where: { code: c.code }, update: {},
      create: { code: c.code, name: c.name, provider: c.provider, description: c.description, examUrl: c.examUrl, isActive: true, domains: { create: c.domainCodes.map((dc) => ({ domain: { connect: { code: dc } } })) } },
    })
  }
  console.log(`   ✅ ${Object.keys(certs).length} certificates`)

  // ============================================================
  // 5a. ROLES
  // ============================================================
  const roleData = [
    { code: 'admin', name: 'Administrator', description: 'Toàn quyền quản trị hệ thống.', isSystem: true },
    { code: 'teacher', name: 'Teacher', description: 'Tạo và quản lý bài học, câu hỏi, bài thi. Theo dõi tiến độ học viên.', isSystem: true },
    { code: 'learner', name: 'Learner', description: 'Truy cập nội dung học, làm bài thi và theo dõi tiến độ cá nhân.', isSystem: true },
  ]
  const roles: Record<string, { id: string }> = {}
  for (const r of roleData) {
    roles[r.code] = await prisma.role.upsert({ where: { code: r.code }, update: {}, create: r })
  }
  console.log(`   ✅ ${Object.keys(roles).length} roles`)

  // ============================================================
  // 5b. PERMISSIONS (23)
  // ============================================================
  const permissionData = [
    { code: 'users:read', name: 'Read Users', resource: 'users', action: 'read', description: 'Xem danh sách và thông tin người dùng' },
    { code: 'users:manage', name: 'Manage Users', resource: 'users', action: 'manage', description: 'Tạo, cập nhật, suspend users' },
    { code: 'roles:read', name: 'Read Roles', resource: 'roles', action: 'read', description: 'Xem danh sách roles và permissions' },
    { code: 'roles:create', name: 'Create Roles', resource: 'roles', action: 'create', description: 'Tạo custom roles mới' },
    { code: 'roles:update', name: 'Update Roles', resource: 'roles', action: 'update', description: 'Sửa role name, description và permissions' },
    { code: 'roles:delete', name: 'Delete Roles', resource: 'roles', action: 'delete', description: 'Xoá non-system custom roles' },
    { code: 'roles:assign', name: 'Assign Roles', resource: 'roles', action: 'assign', description: 'Cấp hoặc thu hồi roles cho users' },
    { code: 'permissions:read', name: 'Read Permissions', resource: 'permissions', action: 'read', description: 'Xem tất cả permissions trong hệ thống' },
    { code: 'lessons:read', name: 'Read Lessons', resource: 'lessons', action: 'read', description: 'Xem nội dung bài học' },
    { code: 'lessons:create', name: 'Create Lessons', resource: 'lessons', action: 'create', description: 'Tạo bài học mới' },
    { code: 'lessons:update', name: 'Update Lessons', resource: 'lessons', action: 'update', description: 'Chỉnh sửa nội dung bài học' },
    { code: 'lessons:delete', name: 'Delete Lessons', resource: 'lessons', action: 'delete', description: 'Xoá bài học' },
    { code: 'lessons:publish', name: 'Publish Lessons', resource: 'lessons', action: 'publish', description: 'Publish hoặc archive bài học' },
    { code: 'vocabulary:read', name: 'Read Vocabulary', resource: 'vocabulary', action: 'read', description: 'Xem từ vựng' },
    { code: 'vocabulary:manage', name: 'Manage Vocabulary', resource: 'vocabulary', action: 'manage', description: 'Tạo, sửa, xoá từ vựng' },
    { code: 'questions:read', name: 'Read Questions', resource: 'questions', action: 'read', description: 'Xem ngân hàng câu hỏi' },
    { code: 'questions:manage', name: 'Manage Questions', resource: 'questions', action: 'manage', description: 'Tạo, sửa, xoá câu hỏi' },
    { code: 'exams:read', name: 'Read Exams', resource: 'exams', action: 'read', description: 'Xem bài thi' },
    { code: 'exams:create', name: 'Create Exams', resource: 'exams', action: 'create', description: 'Tạo bài thi mới' },
    { code: 'exams:publish', name: 'Publish Exams', resource: 'exams', action: 'publish', description: 'Publish hoặc archive bài thi' },
    { code: 'exams:grade', name: 'Grade Exams', resource: 'exams', action: 'grade', description: 'Xem và quản lý kết quả thi' },
    { code: 'reports:read', name: 'Read Reports', resource: 'reports', action: 'read', description: 'Xem báo cáo tiến độ và analytics' },
    { code: 'groups:manage', name: 'Manage Groups', resource: 'groups', action: 'manage', description: 'Tạo và quản lý nhóm học viên' },
  ]
  const permissions: Record<string, { id: string }> = {}
  for (const p of permissionData) {
    permissions[p.code] = await prisma.permission.upsert({ where: { code: p.code }, update: {}, create: p })
  }
  console.log(`   ✅ ${Object.keys(permissions).length} permissions`)

  // ============================================================
  // 5c. ROLE PERMISSIONS
  // ============================================================
  const rolePerm = async (roleCode: string, permCodes: string[]) => {
    for (const permCode of permCodes) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: roles[roleCode].id, permissionId: permissions[permCode].id } },
        update: {}, create: { roleId: roles[roleCode].id, permissionId: permissions[permCode].id },
      })
    }
  }
  await rolePerm('admin', Object.keys(permissions))
  await rolePerm('teacher', ['lessons:read','lessons:create','lessons:update','lessons:delete','lessons:publish','vocabulary:read','vocabulary:manage','questions:read','questions:manage','exams:read','exams:create','exams:publish','exams:grade','groups:manage','reports:read'])
  await rolePerm('learner', ['lessons:read','vocabulary:read','exams:read','questions:read'])
  console.log('   ✅ Role permissions assigned')

  // ============================================================
  // 5d. USERS (1 admin + 2 teachers + 5 learners)
  // ============================================================
  console.log('👥 Seed Users...')
  const hash = await bcrypt.hash('Demo@123456', 12)

  const createUser = async (email: string, displayName: string, roleCode: string, detail: Record<string, unknown> = {}) => {
    const user = await prisma.user.upsert({ where: { email }, update: {}, create: { email, passwordHash: hash, status: UserStatus.active } })
    await prisma.userDetail.upsert({ where: { userId: user.id }, update: {}, create: { userId: user.id, displayName, ...detail } })
    await prisma.userRole.upsert({ where: { userId_roleId: { userId: user.id, roleId: roles[roleCode].id } }, update: {}, create: { userId: user.id, roleId: roles[roleCode].id } })
    return user
  }

  const adminUser   = await createUser('admin@techenglish.pro', 'Admin TechEnglish', 'admin', { bio: 'System administrator of TechEnglish Pro platform.', locale: 'vi', timezone: 'Asia/Ho_Chi_Minh' })
  const teacher1    = await createUser('nguyen.thanh@techenglish.pro', 'Nguyễn Thanh Hà', 'teacher', { bio: 'Cloud & DevOps specialist với 10 năm kinh nghiệm. Chuyên gia AWS, Kubernetes và CI/CD.', phoneNumber: '0901000001', locale: 'vi' })
  const teacher2    = await createUser('tran.minh@techenglish.pro', 'Trần Minh Đức', 'teacher', { bio: 'Security & Networking specialist 8 năm kinh nghiệm. CompTIA Security+, CISSP certified.', phoneNumber: '0901000002', locale: 'vi' })
  const learner1    = await createUser('learner1@techenglish.pro', 'Lê Văn An', 'learner', { bio: 'Backend developer tại TP.HCM, 3 năm kinh nghiệm. Đang chuẩn bị AWS Solutions Architect.', phoneNumber: '0901001001' })
  const learner2    = await createUser('learner2@techenglish.pro', 'Phạm Thị Bình', 'learner', { bio: 'DevOps intern, đang học Kubernetes và Docker. Mục tiêu đạt CKA trong 6 tháng.', phoneNumber: '0901001002' })
  const learner3    = await createUser('learner3@techenglish.pro', 'Hoàng Văn Cường', 'learner', { bio: 'Security analyst 2 năm kinh nghiệm. Đang học cho kỳ thi CompTIA Security+.', phoneNumber: '0901001003' })
  const learner4    = await createUser('learner4@techenglish.pro', 'Vũ Thị Dung', 'learner', { bio: 'Data engineer tại startup fintech. Có kinh nghiệm Spark, Kafka và GCP.', phoneNumber: '0901001004' })
  const learner5    = await createUser('learner5@techenglish.pro', 'Đặng Văn Em', 'learner', { bio: 'Full-stack developer fresh graduate. Muốn nâng cao kỹ năng tiếng Anh IT để apply nước ngoài.', phoneNumber: '0901001005' })
  console.log('   ✅ 8 users (1 admin + 2 teachers + 5 learners)')

  // ============================================================
  // 6. LEARNER PROFILES
  // ============================================================
  const cloudArchGoal = await prisma.careerGoal.findUnique({ where: { code: 'CLOUD_ARCHITECT' } })
  const devopsGoal    = await prisma.careerGoal.findUnique({ where: { code: 'DEVOPS_ENGINEER' } })
  const secGoal       = await prisma.careerGoal.findUnique({ where: { code: 'SECURITY_ENGINEER' } })
  const dataGoal      = await prisma.careerGoal.findUnique({ where: { code: 'DATA_ENGINEER' } })
  const fullGoal      = await prisma.careerGoal.findUnique({ where: { code: 'FULLSTACK_ENGINEER' } })

  const makeProfile = async (userId: string, levelIdx: number, bio: string, weeklyMin: number, domainCodes: string[], careerGoalId: string | null, certCode: string | null, targetDate: Date | null) => {
    const existing = await prisma.learnerProfile.findUnique({ where: { userId } })
    if (existing) return existing
    return prisma.learnerProfile.create({
      data: {
        userId, levelId: levels[levelIdx].id, bio, weeklyStudyTargetMinutes: weeklyMin, onboardingCompleted: true,
        domains: { create: domainCodes.map(c => ({ domainId: domains[c].id })) },
        careerGoals: careerGoalId ? { create: [{ careerGoalId }] } : undefined,
        certGoals: (certCode && targetDate) ? { create: [{ certificateId: certs[certCode].id, targetDate }] } : undefined,
      },
    })
  }

  await makeProfile(learner1.id, 1, 'Backend developer đang chuẩn bị AWS-SAA, focus vào Cloud và Software Engineering.', 300, ['CLOUD','SOFTWARE_ENG'], cloudArchGoal?.id ?? null, 'AWS-SAA', new Date('2026-12-31'))
  await makeProfile(learner2.id, 0, 'DevOps intern, quan tâm đến Kubernetes và container orchestration.', 240, ['DEVOPS','CLOUD'], devopsGoal?.id ?? null, 'CKA', new Date('2027-03-31'))
  await makeProfile(learner3.id, 1, 'Security analyst đang target CompTIA Security+ trong vòng 4 tháng.', 200, ['CYBERSEC','NETWORKING'], secGoal?.id ?? null, 'COMPTIA-SECURITY-PLUS', new Date('2026-12-15'))
  await makeProfile(learner4.id, 2, 'Data engineer có kinh nghiệm, focus GCP và advanced data pipelines.', 180, ['DATA_ENG','CLOUD'], dataGoal?.id ?? null, 'GCP-ACE', new Date('2026-10-31'))
  await makeProfile(learner5.id, 0, 'Fresh graduate, muốn học tiếng Anh IT để chuẩn bị đi làm.', 120, ['SOFTWARE_ENG','DEVOPS'], fullGoal?.id ?? null, null, null)
  console.log('   ✅ 5 learner profiles')

  // ============================================================
  // 7. VOCABULARY (30 terms)
  // ============================================================
  console.log('📚 Seed Vocabulary (30 terms)...')
  const vocabData = [
    // === CLOUD (8) ===
    { term: 'autoscaling', ipa: '/ˈɔːtəʊˌskeɪlɪŋ/', pos: 'noun', en: 'The automatic adjustment of compute resources — such as servers or containers — based on current demand, without manual intervention.', vi: 'Tự động điều chỉnh tài nguyên tính toán (máy chủ, container) dựa trên nhu cầu hiện tại, không cần can thiệp thủ công.', domain: 'CLOUD', level: LevelCode.intermediate, tags: ['AWS','scaling','cloud','resource management'], examples: [{ e: 'AWS Auto Scaling automatically adds EC2 instances during peak traffic and removes them when demand drops, ensuring cost efficiency.', v: 'AWS Auto Scaling tự động thêm EC2 instances khi traffic tăng cao và xoá chúng khi nhu cầu giảm, đảm bảo hiệu quả chi phí.' }] },
    { term: 'availability zone', ipa: '/əˌveɪləˈbɪlɪti zoʊn/', pos: 'noun', en: 'An isolated location within a cloud region, with independent power, cooling, and networking, designed to minimize correlated failures.', vi: 'Vị trí biệt lập trong một cloud region, có nguồn điện, làm mát và mạng lưới độc lập, được thiết kế để giảm thiểu các lỗi liên quan.', domain: 'CLOUD', level: LevelCode.beginner, tags: ['AWS','high availability','disaster recovery','region'], examples: [{ e: 'Deploying your application across multiple availability zones ensures it remains operational even if one zone experiences an outage.', v: 'Triển khai ứng dụng trên nhiều availability zones đảm bảo ứng dụng vẫn hoạt động ngay cả khi một zone gặp sự cố.' }] },
    { term: 'load balancer', ipa: '/loʊd ˈbælənsər/', pos: 'noun', en: 'A device or software service that distributes incoming network traffic across multiple servers to ensure no single server bears too much load.', vi: 'Thiết bị hoặc dịch vụ phần mềm phân phối traffic mạng đến nhiều máy chủ để đảm bảo không có máy chủ nào chịu tải quá mức.', domain: 'CLOUD', level: LevelCode.beginner, tags: ['AWS ELB','traffic distribution','high availability'], examples: [{ e: 'The Application Load Balancer routes HTTP requests to healthy EC2 instances based on path-based routing rules.', v: 'Application Load Balancer định tuyến HTTP requests đến các EC2 instances khoẻ mạnh dựa trên quy tắc path-based routing.' }] },
    { term: 'VPC', ipa: '/ˌviː.piːˈsiː/', pos: 'noun', en: 'Virtual Private Cloud — an isolated virtual network within a public cloud provider that you define and control, including IP ranges, subnets, and routing.', vi: 'Virtual Private Cloud — mạng ảo riêng biệt trong cloud provider mà bạn định nghĩa và kiểm soát, bao gồm dải IP, subnets và routing.', domain: 'CLOUD', level: LevelCode.intermediate, tags: ['AWS','network isolation','security','subnet'], examples: [{ e: 'We placed our database in a private subnet within the VPC, making it inaccessible from the public internet.', v: 'Chúng tôi đặt database trong private subnet trong VPC, khiến nó không thể truy cập từ internet công cộng.' }] },
    { term: 'serverless', ipa: '/ˈsɜːrvərləs/', pos: 'adjective', en: 'A cloud execution model where the cloud provider dynamically manages the allocation of machine resources; developers deploy functions or containers without managing servers.', vi: 'Mô hình thực thi cloud mà nhà cung cấp tự động quản lý phân bổ tài nguyên; lập trình viên deploy functions hoặc containers mà không cần quản lý máy chủ.', domain: 'CLOUD', level: LevelCode.intermediate, tags: ['AWS Lambda','FaaS','cost optimization'], examples: [{ e: 'With AWS Lambda, our image processing function runs serverless — we pay only for the milliseconds it executes, not for idle server time.', v: 'Với AWS Lambda, hàm xử lý ảnh của chúng tôi chạy serverless — chúng tôi chỉ trả tiền cho số milliseconds nó thực thi, không phải thời gian máy chủ nhàn rỗi.' }] },
    { term: 'CDN', ipa: '/ˌsiː.diːˈen/', pos: 'noun', en: 'Content Delivery Network — a geographically distributed network of proxy servers and data centres that delivers web content to users based on their geographic location.', vi: 'Content Delivery Network — mạng lưới máy chủ proxy phân tán theo địa lý, phân phối nội dung web đến người dùng dựa trên vị trí địa lý của họ.', domain: 'CLOUD', level: LevelCode.beginner, tags: ['CloudFront','performance','caching','latency'], examples: [{ e: 'By serving static assets through a CDN like AWS CloudFront, we reduced page load time for Southeast Asian users from 3.2s to 0.8s.', v: 'Bằng cách phục vụ static assets qua CDN như AWS CloudFront, chúng tôi giảm thời gian tải trang cho người dùng Đông Nam Á từ 3.2 giây xuống 0.8 giây.' }] },
    { term: 'IAM', ipa: '/ˌaɪ.eɪˈem/', pos: 'noun', en: 'Identity and Access Management — a framework of policies and technologies for ensuring the right users have appropriate access to technology resources.', vi: 'Identity and Access Management — khung chính sách và công nghệ đảm bảo người dùng đúng có quyền truy cập phù hợp vào tài nguyên công nghệ.', domain: 'CLOUD', level: LevelCode.intermediate, tags: ['AWS','security','access control','least privilege'], examples: [{ e: 'Following the principle of least privilege, the IAM role for our Lambda function only has s3:GetObject permission on the specific bucket it needs.', v: 'Theo nguyên tắc ít đặc quyền nhất, IAM role cho Lambda function của chúng tôi chỉ có quyền s3:GetObject trên bucket cụ thể mà nó cần.' }] },
    { term: 'multitenancy', ipa: '/ˌmʌltiˈtenənsi/', pos: 'noun', en: 'An architecture where a single instance of software serves multiple customers (tenants), with data and configurations logically isolated between tenants.', vi: 'Kiến trúc mà một instance phần mềm phục vụ nhiều khách hàng (tenants), với dữ liệu và cấu hình được cách ly logic giữa các tenants.', domain: 'CLOUD', level: LevelCode.advanced, tags: ['SaaS','architecture','isolation','resource sharing'], examples: [{ e: 'Our SaaS platform uses a multitenant architecture with row-level security in PostgreSQL to isolate each customer\'s data within the same database.', v: 'Nền tảng SaaS của chúng tôi sử dụng kiến trúc multitenant với row-level security trong PostgreSQL để cách ly dữ liệu của mỗi khách hàng trong cùng một database.' }] },
    // === DEVOPS (8) ===
    { term: 'CI/CD', ipa: '/ˌsiː.aɪˌsiːˈdiː/', pos: 'noun', en: 'Continuous Integration / Continuous Deployment — the practice of automating the building, testing, and deployment of software to enable frequent, reliable releases.', vi: 'Tích hợp liên tục / Triển khai liên tục — thực hành tự động hoá việc build, test và deploy phần mềm để cho phép phát hành thường xuyên và đáng tin cậy.', domain: 'DEVOPS', level: LevelCode.beginner, tags: ['automation','pipeline','GitHub Actions','Jenkins'], examples: [{ e: 'Our CI/CD pipeline automatically runs unit tests and integration tests on every pull request, blocking merges if any tests fail.', v: 'Pipeline CI/CD của chúng tôi tự động chạy unit tests và integration tests trên mỗi pull request, chặn merge nếu có test nào thất bại.' }] },
    { term: 'containerization', ipa: '/kənˌteɪnəraɪˈzeɪʃən/', pos: 'noun', en: 'The process of packaging an application along with its dependencies, configuration, and runtime into a portable, self-contained unit called a container.', vi: 'Quá trình đóng gói ứng dụng cùng với dependencies, cấu hình và runtime vào một đơn vị portable, tự chứa gọi là container.', domain: 'DEVOPS', level: LevelCode.beginner, tags: ['Docker','Kubernetes','portability','deployment'], examples: [{ e: 'Containerization with Docker eliminated the "it works on my machine" problem by ensuring consistent environments from development to production.', v: 'Containerization với Docker đã loại bỏ vấn đề "chạy được trên máy tôi" bằng cách đảm bảo môi trường nhất quán từ development đến production.' }] },
    { term: 'orchestration', ipa: '/ˌɔːrkɪˈstreɪʃən/', pos: 'noun', en: 'Automated coordination and management of multiple containerized services, including scheduling, scaling, networking, and health monitoring.', vi: 'Phối hợp và quản lý tự động nhiều dịch vụ containerized, bao gồm scheduling, scaling, networking và health monitoring.', domain: 'DEVOPS', level: LevelCode.intermediate, tags: ['Kubernetes','deployment','scaling','container management'], examples: [{ e: 'Kubernetes orchestration ensures our microservices are automatically rescheduled to healthy nodes when a node fails.', v: 'Kubernetes orchestration đảm bảo các microservices của chúng tôi được tự động lên lịch lại trên các nodes khoẻ mạnh khi một node bị lỗi.' }] },
    { term: 'blue-green deployment', ipa: '/bluː ɡriːn dɪˈplɔɪmənt/', pos: 'noun', en: 'A release strategy that uses two identical production environments (blue and green) to enable zero-downtime deployments and instant rollback capability.', vi: 'Chiến lược phát hành sử dụng hai môi trường production giống hệt nhau (blue và green) để cho phép zero-downtime deployment và khả năng rollback ngay lập tức.', domain: 'DEVOPS', level: LevelCode.advanced, tags: ['zero downtime','rollback','deployment strategy','release'], examples: [{ e: 'During our blue-green deployment, we switched the load balancer from the old (blue) environment to the new (green) environment in under 30 seconds with zero user impact.', v: 'Trong quá trình blue-green deployment, chúng tôi chuyển load balancer từ môi trường cũ (blue) sang môi trường mới (green) trong dưới 30 giây mà không ảnh hưởng đến người dùng.' }] },
    { term: 'canary release', ipa: '/kəˈneəri rɪˈliːs/', pos: 'noun', en: 'A technique to reduce release risk by gradually rolling out a change to a small subset of users before making it available to everyone.', vi: 'Kỹ thuật giảm rủi ro phát hành bằng cách từ từ triển khai thay đổi cho một tập nhỏ người dùng trước khi áp dụng cho tất cả mọi người.', domain: 'DEVOPS', level: LevelCode.advanced, tags: ['risk reduction','A/B testing','feature flags','release'], examples: [{ e: 'We used a canary release to send 5% of traffic to the new recommendation engine, monitoring error rates and latency before a full rollout.', v: 'Chúng tôi sử dụng canary release để gửi 5% traffic đến recommendation engine mới, theo dõi error rates và latency trước khi triển khai hoàn toàn.' }] },
    { term: 'infrastructure as code', ipa: '/ˈɪnfrəˌstrʌktʃər æz koʊd/', pos: 'noun', en: 'The practice of managing and provisioning computing infrastructure through machine-readable configuration files rather than through manual processes.', vi: 'Thực hành quản lý và cung cấp cơ sở hạ tầng tính toán thông qua các file cấu hình machine-readable thay vì thông qua các quy trình thủ công.', domain: 'DEVOPS', level: LevelCode.intermediate, tags: ['Terraform','Ansible','automation','repeatability'], examples: [{ e: 'With Terraform as our infrastructure as code tool, spinning up a new staging environment is a single command that takes 8 minutes instead of 2 days of manual setup.', v: 'Với Terraform là công cụ infrastructure as code, khởi tạo môi trường staging mới chỉ là một lệnh mất 8 phút thay vì 2 ngày cấu hình thủ công.' }] },
    { term: 'observability', ipa: '/əbˌzɜːrvəˈbɪlɪti/', pos: 'noun', en: 'The ability to infer the internal state of a system from its external outputs — logs, metrics, and distributed traces — without deploying new code.', vi: 'Khả năng suy ra trạng thái nội bộ của hệ thống từ các đầu ra bên ngoài — logs, metrics và distributed traces — mà không cần deploy code mới.', domain: 'DEVOPS', level: LevelCode.advanced, tags: ['monitoring','SRE','Prometheus','Grafana','tracing'], examples: [{ e: 'High observability allowed our SRE team to pinpoint the root cause of a latency spike within 4 minutes using correlated logs, metrics, and traces in Grafana.', v: 'Khả năng observability cao cho phép team SRE của chúng tôi xác định nguyên nhân gốc rễ của latency spike trong vòng 4 phút bằng cách sử dụng logs, metrics và traces tương quan trong Grafana.' }] },
    { term: 'rollback', ipa: '/ˈroʊlˌbæk/', pos: 'noun', en: 'The act of reverting a deployed application or database schema to a previous stable version, typically performed after a failed release introduces bugs or instability.', vi: 'Hành động khôi phục ứng dụng đã deploy hoặc database schema về phiên bản ổn định trước đó, thường được thực hiện sau khi một bản phát hành bị lỗi gây ra bugs hoặc không ổn định.', domain: 'DEVOPS', level: LevelCode.intermediate, tags: ['disaster recovery','deployment','release management','stability'], examples: [{ e: 'When our new payment service caused a 15% error rate, the on-call engineer executed a rollback to the previous version in under 2 minutes.', v: 'Khi payment service mới gây ra error rate 15%, kỹ sư trực ban đã thực hiện rollback về phiên bản trước trong vòng 2 phút.' }] },
    // === SOFTWARE ENGINEERING (8) ===
    { term: 'idempotent', ipa: '/ˌaɪdəmˈpoʊtənt/', pos: 'adjective', en: 'Describing an operation that produces the same result regardless of how many times it is performed; calling it once or multiple times has the same effect.', vi: 'Mô tả một phép toán cho ra kết quả giống nhau dù được thực hiện bao nhiêu lần; gọi một lần hoặc nhiều lần đều có cùng hiệu quả.', domain: 'SOFTWARE_ENG', level: LevelCode.intermediate, tags: ['REST API','HTTP','PUT','design'], examples: [{ e: 'A PUT request to /users/123 must be idempotent: sending it 10 times with the same body should produce exactly the same result as sending it once.', v: 'PUT request đến /users/123 phải là idempotent: gửi 10 lần với cùng body phải cho kết quả hoàn toàn giống như gửi một lần.' }] },
    { term: 'microservice', ipa: '/ˈmaɪkrəˌsɜːrvɪs/', pos: 'noun', en: 'An architectural style that structures an application as a collection of small, independently deployable services, each responsible for a specific business capability.', vi: 'Kiểu kiến trúc cấu trúc ứng dụng thành tập hợp các dịch vụ nhỏ, có thể deploy độc lập, mỗi dịch vụ chịu trách nhiệm về một business capability cụ thể.', domain: 'SOFTWARE_ENG', level: LevelCode.intermediate, tags: ['architecture','distributed systems','scalability'], examples: [{ e: 'Netflix decomposed their monolithic application into hundreds of microservices, allowing teams to deploy the recommendation engine independently of the streaming service.', v: 'Netflix đã tách ứng dụng monolithic của họ thành hàng trăm microservices, cho phép các team deploy recommendation engine độc lập với streaming service.' }] },
    { term: 'rate limiting', ipa: '/reɪt ˈlɪmɪtɪŋ/', pos: 'noun', en: 'A technique for controlling the rate at which an API client can make requests within a defined time window, protecting backend services from overload.', vi: 'Kỹ thuật kiểm soát tốc độ mà API client có thể thực hiện requests trong một khoảng thời gian nhất định, bảo vệ backend services khỏi bị quá tải.', domain: 'SOFTWARE_ENG', level: LevelCode.intermediate, tags: ['API design','security','throttling','protection'], examples: [{ e: 'Our public API enforces rate limiting of 100 requests per minute per API key; clients exceeding this receive a 429 Too Many Requests response.', v: 'API công khai của chúng tôi giới hạn tốc độ 100 requests mỗi phút mỗi API key; clients vượt quá giới hạn này nhận được phản hồi 429 Too Many Requests.' }] },
    { term: 'webhook', ipa: '/ˈwebhʊk/', pos: 'noun', en: 'An HTTP callback mechanism that allows one application to automatically notify another application when a specific event occurs, enabling real-time integrations.', vi: 'Cơ chế callback HTTP cho phép một ứng dụng tự động thông báo cho ứng dụng khác khi một sự kiện cụ thể xảy ra, cho phép tích hợp thời gian thực.', domain: 'SOFTWARE_ENG', level: LevelCode.intermediate, tags: ['event-driven','integration','API','real-time'], examples: [{ e: 'GitHub sends a webhook to our CI server whenever a pull request is opened, triggering an automated build and test pipeline.', v: 'GitHub gửi webhook đến CI server của chúng tôi mỗi khi một pull request được mở, kích hoạt pipeline build và test tự động.' }] },
    { term: 'eventual consistency', ipa: '/ɪˈventʃuəl kənˈsɪstənsi/', pos: 'noun', en: 'A consistency model in distributed systems where replicas of data will eventually converge to the same state, given no new updates are made.', vi: 'Mô hình nhất quán trong hệ thống phân tán, nơi các bản sao dữ liệu cuối cùng sẽ hội tụ về cùng một trạng thái, nếu không có cập nhật mới nào được thực hiện.', domain: 'SOFTWARE_ENG', level: LevelCode.advanced, tags: ['distributed systems','CAP theorem','NoSQL','DynamoDB'], examples: [{ e: 'DynamoDB\'s default read mode uses eventual consistency: a write made in the us-east-1 replica may not be immediately visible in reads from us-west-2.', v: 'Chế độ đọc mặc định của DynamoDB sử dụng eventual consistency: một lần write trên replica us-east-1 có thể không hiển thị ngay lập tức khi đọc từ us-west-2.' }] },
    { term: 'technical debt', ipa: '/ˈteknɪkəl det/', pos: 'noun', en: 'The implied cost of additional rework caused by choosing a quick, easy solution now instead of a better, more robust approach that would take longer.', vi: 'Chi phí ngầm của việc làm lại thêm do chọn giải pháp nhanh, dễ dàng hiện tại thay vì cách tiếp cận tốt hơn, bền vững hơn sẽ mất nhiều thời gian hơn.', domain: 'SOFTWARE_ENG', level: LevelCode.intermediate, tags: ['code quality','refactoring','engineering culture','maintainability'], examples: [{ e: 'Three years of accumulated technical debt in our authentication system meant that adding OAuth2 support took 6 weeks instead of the expected 3 days.', v: 'Ba năm technical debt tích lũy trong hệ thống authentication của chúng tôi có nghĩa là thêm hỗ trợ OAuth2 mất 6 tuần thay vì 3 ngày như dự kiến.' }] },
    { term: 'debouncing', ipa: '/diːˈbaʊnsɪŋ/', pos: 'noun', en: 'A programming technique that delays the execution of a function until after a specified period of inactivity, preventing it from being called too frequently.', vi: 'Kỹ thuật lập trình trì hoãn việc thực thi một hàm cho đến sau một khoảng thời gian không hoạt động nhất định, ngăn nó bị gọi quá thường xuyên.', domain: 'SOFTWARE_ENG', level: LevelCode.intermediate, tags: ['performance','UI','event handling','optimization'], examples: [{ e: 'We added debouncing to the search input with a 300ms delay, reducing API calls from 20 per word to just 1 per complete search term.', v: 'Chúng tôi thêm debouncing vào ô tìm kiếm với độ trễ 300ms, giảm số API calls từ 20 lần mỗi từ xuống còn 1 lần mỗi cụm từ tìm kiếm hoàn chỉnh.' }] },
    // === CYBERSECURITY (6) ===
    { term: 'zero-trust', ipa: '/ˈzɪroʊ trʌst/', pos: 'adjective', en: 'A security framework that assumes no user, device, or network segment is inherently trustworthy; every access request must be verified regardless of source.', vi: 'Khung bảo mật giả định không có người dùng, thiết bị hoặc phân đoạn mạng nào vốn đáng tin cậy; mỗi yêu cầu truy cập phải được xác minh bất kể nguồn gốc.', domain: 'CYBERSEC', level: LevelCode.intermediate, tags: ['security','identity','access control','network security'], examples: [{ e: 'Adopting a zero-trust architecture, we now require multi-factor authentication even for internal VPN users, following the principle "never trust, always verify".', v: 'Áp dụng kiến trúc zero-trust, chúng tôi hiện yêu cầu xác thực đa yếu tố ngay cả với người dùng VPN nội bộ, theo nguyên tắc "không bao giờ tin tưởng, luôn xác minh".' }] },
    { term: 'DDoS', ipa: '/ˌdiː.diː.oʊˈes/', pos: 'noun', en: 'Distributed Denial of Service — a cyberattack where multiple compromised systems flood a target with traffic, overwhelming it and making it unavailable to legitimate users.', vi: 'Tấn công từ chối dịch vụ phân tán — cuộc tấn công mạng mà nhiều hệ thống bị xâm phạm làm ngập target với traffic, khiến nó không khả dụng với người dùng hợp lệ.', domain: 'CYBERSEC', level: LevelCode.beginner, tags: ['network attack','availability','mitigation','AWS Shield'], examples: [{ e: 'During our product launch, we experienced a DDoS attack peaking at 2.3 Tbps; AWS Shield Advanced automatically absorbed the attack within 8 minutes.', v: 'Trong đợt ra mắt sản phẩm, chúng tôi bị tấn công DDoS đạt đỉnh 2.3 Tbps; AWS Shield Advanced tự động hấp thụ cuộc tấn công trong vòng 8 phút.' }] },
    { term: 'penetration testing', ipa: '/ˌpenɪˈtreɪʃən ˈtestɪŋ/', pos: 'noun', en: 'An authorized, simulated cyberattack on a computer system to evaluate its security posture, identify vulnerabilities, and verify that defenses work as expected.', vi: 'Cuộc tấn công mạng mô phỏng được uỷ quyền vào hệ thống máy tính để đánh giá trạng thái bảo mật, xác định lỗ hổng và xác minh rằng các biện pháp phòng thủ hoạt động như mong đợi.', domain: 'CYBERSEC', level: LevelCode.advanced, tags: ['ethical hacking','security assessment','vulnerability','compliance'], examples: [{ e: 'Our annual penetration test revealed an SQL injection vulnerability in the admin panel that had gone undetected for 18 months.', v: 'Bài kiểm tra thâm nhập hàng năm của chúng tôi đã phát hiện ra lỗ hổng SQL injection trong admin panel đã không bị phát hiện trong 18 tháng.' }] },
    { term: 'TLS', ipa: '/ˌtiː.elˈes/', pos: 'noun', en: 'Transport Layer Security — a cryptographic protocol that provides end-to-end communications security, encrypting data in transit between clients and servers.', vi: 'Transport Layer Security — giao thức mật mã cung cấp bảo mật truyền thông end-to-end, mã hoá dữ liệu khi truyền giữa clients và servers.', domain: 'CYBERSEC', level: LevelCode.beginner, tags: ['encryption','HTTPS','SSL','data in transit'], examples: [{ e: 'All API endpoints must use TLS 1.3; our NGINX configuration explicitly disables TLS 1.0 and 1.1 to prevent downgrade attacks.', v: 'Tất cả API endpoints phải sử dụng TLS 1.3; cấu hình NGINX của chúng tôi vô hiệu hoá rõ ràng TLS 1.0 và 1.1 để ngăn chặn các cuộc tấn công downgrade.' }] },
    { term: 'OAuth2', ipa: '/ˌoʊˈɔːθ tuː/', pos: 'noun', en: 'An authorization framework that enables applications to obtain limited access to user accounts on third-party services without exposing user credentials.', vi: 'Khung ủy quyền cho phép ứng dụng lấy quyền truy cập có giới hạn vào tài khoản người dùng trên dịch vụ bên thứ ba mà không tiết lộ thông tin đăng nhập người dùng.', domain: 'CYBERSEC', level: LevelCode.intermediate, tags: ['authentication','access delegation','API security','JWT'], examples: [{ e: 'Using OAuth2, our app can access a user\'s Google Calendar to schedule meetings without ever seeing the user\'s Google password.', v: 'Sử dụng OAuth2, ứng dụng của chúng tôi có thể truy cập Google Calendar của người dùng để lên lịch họp mà không cần biết mật khẩu Google của người dùng.' }] },
    { term: 'supply chain attack', ipa: '/səˈplaɪ tʃeɪn əˈtæk/', pos: 'noun', en: 'A cyberattack that targets less-secure elements in the software supply chain — such as third-party libraries or build systems — to compromise a primary target.', vi: 'Cuộc tấn công mạng nhắm vào các yếu tố ít bảo mật hơn trong chuỗi cung ứng phần mềm — như thư viện bên thứ ba hoặc build systems — để xâm phạm mục tiêu chính.', domain: 'CYBERSEC', level: LevelCode.advanced, tags: ['security','software distribution','npm','SolarWinds'], examples: [{ e: 'The SolarWinds supply chain attack compromised a trusted software update mechanism, allowing attackers to silently install malware in 18,000 organizations.', v: 'Vụ tấn công chuỗi cung ứng SolarWinds đã xâm phạm cơ chế cập nhật phần mềm đáng tin cậy, cho phép kẻ tấn công cài đặt malware thầm lặng trong 18.000 tổ chức.' }] },
  ]

  for (const v of vocabData) {
    const existing = await prisma.vocabulary.findFirst({ where: { term: v.term, domainId: domains[v.domain].id } })
    if (!existing) {
      const lvlRecord = await prisma.level.findUnique({ where: { code: v.level } })
      await prisma.vocabulary.create({
        data: {
          term: v.term, pronunciationIpa: v.ipa, partOfSpeech: v.pos,
          definitionEn: v.en, definitionVi: v.vi,
          domainId: domains[v.domain].id, levelId: lvlRecord!.id,
          tags: v.tags, status: ContentStatus.published,
          examples: { create: v.examples.map((ex, i) => ({ sentenceEn: ex.e, translationVi: ex.v, order: i + 1 })) },
        },
      })
    }
  }
  console.log(`   ✅ ${vocabData.length} vocabulary terms`)

  // ============================================================
  // 8. LESSONS (5 lessons)
  // ============================================================
  console.log('📖 Seed Lessons...')

  const lesson1 = await prisma.lesson.upsert({
    where: { slug: 'understanding-rest-apis-in-production' }, update: {},
    create: {
      title: 'Understanding REST APIs in Production', slug: 'understanding-rest-apis-in-production',
      summary: 'Học các nguyên tắc cốt lõi của RESTful APIs bao gồm HTTP methods, status codes, versioning và API design best practices cho môi trường production.',
      type: 'technical_reading', domainId: domains['SOFTWARE_ENG'].id, levelId: levels[1].id,
      estimatedMinutes: 35, status: ContentStatus.published, publishedAt: new Date(), createdById: teacher1.id,
      sections: {
        create: [
          { type: 'heading', order: 1, title: 'What is a REST API?', content: { text: 'What is a REST API?' } },
          { type: 'rich_text', order: 2, content: { text: 'REST (Representational State Transfer) is an architectural style for distributed hypermedia systems. A REST API uses HTTP requests to perform CRUD operations: Create (POST), Read (GET), Update (PUT/PATCH), and Delete (DELETE). REST APIs are stateless — each request contains all information needed to process it, with no server-side session state.' } },
          { type: 'heading', order: 3, title: 'HTTP Methods and Idempotency', content: { text: 'HTTP Methods and Idempotency' } },
          { type: 'rich_text', order: 4, content: { text: 'Understanding which HTTP methods are safe and idempotent is critical for building reliable APIs:\n\n- GET: Safe + Idempotent. Never modifies data.\n- HEAD: Safe + Idempotent. Same as GET but returns only headers.\n- PUT: Not safe, but Idempotent. Replaces the entire resource.\n- DELETE: Not safe, but Idempotent. Deletes once regardless of repeated calls.\n- POST: Neither safe nor idempotent. Creates new resources.\n- PATCH: Neither safe nor idempotent (unless designed carefully).' } },
          { type: 'code', order: 5, title: 'Example: Idempotent PUT vs Non-idempotent POST', content: { language: 'http', code: '# Idempotent: calling 5 times produces same result\nPUT /api/v1/users/123 HTTP/1.1\nContent-Type: application/json\n\n{"displayName": "Nguyen Van An", "role": "senior-engineer"}\n\n# Non-idempotent: creates a new resource each time\nPOST /api/v1/orders HTTP/1.1\nContent-Type: application/json\n\n{"productId": "prod-456", "quantity": 2}' } },
          { type: 'heading', order: 6, title: 'HTTP Status Codes', content: { text: 'HTTP Status Codes' } },
          { type: 'rich_text', order: 7, content: { text: 'Correct status codes communicate intent clearly:\n\n2xx Success:\n- 200 OK: General success\n- 201 Created: Resource successfully created (with Location header)\n- 204 No Content: Success with no response body (common for DELETE)\n\n4xx Client Errors:\n- 400 Bad Request: Invalid request syntax or validation failure\n- 401 Unauthorized: Authentication required or token expired\n- 403 Forbidden: Authenticated but lacks permission\n- 404 Not Found: Resource does not exist\n- 409 Conflict: State conflict (e.g., duplicate email)\n- 429 Too Many Requests: Rate limit exceeded\n\n5xx Server Errors:\n- 500 Internal Server Error: Unexpected server-side failure\n- 503 Service Unavailable: Server overloaded or under maintenance' } },
        ],
      },
    },
  })

  const lesson2 = await prisma.lesson.upsert({
    where: { slug: 'aws-high-availability-architecture' }, update: {},
    create: {
      title: 'AWS Solutions Architect — Designing for High Availability (PRO)',
      slug: 'aws-high-availability-architecture',
      summary: 'Tìm hiểu cách thiết kế kiến trúc AWS có tính sẵn sàng cao sử dụng Multi-AZ deployments, ELB và Auto Scaling — dành riêng cho tài khoản PRO.',
      type: 'technical_reading', domainId: domains['CLOUD'].id, levelId: levels[1].id,
      estimatedMinutes: 50, isProOnly: true, status: ContentStatus.published, publishedAt: new Date(), createdById: teacher1.id,
      certificates: { create: [{ certificateId: certs['AWS-SAA'].id }] },
      sections: {
        create: [
          { type: 'heading', order: 1, title: 'Multi-AZ Architecture', content: { text: 'Multi-AZ Architecture' } },
          { type: 'rich_text', order: 2, content: { text: 'High availability in AWS is achieved by distributing workloads across multiple Availability Zones (AZs). Each AZ is physically separate with independent power, cooling, and networking. A well-architected application should tolerate the complete failure of any single AZ without service disruption.\n\nKey principle: Design for failure. Assume any component can fail at any time and architect accordingly.' } },
          { type: 'heading', order: 3, title: 'RDS Multi-AZ vs Read Replicas', content: { text: 'RDS Multi-AZ vs Read Replicas' } },
          { type: 'rich_text', order: 4, content: { text: 'RDS Multi-AZ is for HIGH AVAILABILITY — automatic failover to standby in another AZ if the primary fails. Failover takes 60-120 seconds. The standby cannot serve reads.\n\nRDS Read Replicas are for PERFORMANCE — offload read traffic from the primary instance. Replication is asynchronous. Can be promoted to standalone DB. Can span across regions for disaster recovery.\n\nExam tip: If the question mentions "automatic failover" or "synchronous replication" → Multi-AZ. If it mentions "read scaling" or "async replication" → Read Replica.' } },
          { type: 'heading', order: 5, title: 'Elastic Load Balancing Types', content: { text: 'Elastic Load Balancing Types' } },
          { type: 'rich_text', order: 6, content: { text: 'AWS offers three load balancer types:\n\n1. Application Load Balancer (ALB) — Layer 7. Supports HTTP/HTTPS, WebSockets. Enables path-based routing (/api/* → api-service, /web/* → web-service) and host-based routing.\n\n2. Network Load Balancer (NLB) — Layer 4. Handles TCP/UDP/TLS. Designed for ultra-high performance (millions of requests/second). Preserves client IP. Use for non-HTTP protocols.\n\n3. Gateway Load Balancer (GWLB) — Layer 3. Routes traffic to virtual appliances (firewalls, IDS/IPS). Used for inline security inspection.' } },
        ],
      },
    },
  })

  const lesson3 = await prisma.lesson.upsert({
    where: { slug: 'kubernetes-pod-troubleshooting' }, update: {},
    create: {
      title: 'Kubernetes Troubleshooting — Common Pod Issues (PRO)',
      slug: 'kubernetes-pod-troubleshooting',
      summary: 'Hướng dẫn thực tế để chẩn đoán và giải quyết các vấn đề pod Kubernetes phổ biến: CrashLoopBackOff, OOMKilled, ImagePullBackOff và Pending — dành riêng cho tài khoản PRO.',
      type: 'case_study', domainId: domains['DEVOPS'].id, levelId: levels[2].id,
      estimatedMinutes: 40, isProOnly: true, status: ContentStatus.published, publishedAt: new Date(), createdById: teacher2.id,
      certificates: { create: [{ certificateId: certs['CKA'].id }] },
      sections: {
        create: [
          { type: 'heading', order: 1, title: 'CrashLoopBackOff', content: { text: 'CrashLoopBackOff — Application Keeps Crashing' } },
          { type: 'rich_text', order: 2, content: { text: 'CrashLoopBackOff means the container starts, crashes, Kubernetes restarts it, it crashes again — in a loop with increasing delays (1s, 2s, 4s, 8s... up to 5 minutes).\n\nCommon causes:\n- Application error on startup (check logs)\n- Missing environment variables or secrets\n- Wrong command/args in the pod spec\n- Failing health checks causing premature restarts\n- Missing ConfigMap or Secret mounts' } },
          { type: 'code', order: 3, title: 'Diagnostic Commands', content: { language: 'bash', code: '# Step 1: Describe the pod to see events and status\nkubectl describe pod <pod-name> -n <namespace>\n\n# Step 2: Check logs from the current container\nkubectl logs <pod-name> -n <namespace>\n\n# Step 3: Check logs from the previous crashed container\nkubectl logs <pod-name> -n <namespace> --previous\n\n# Step 4: If the pod starts, exec in for debugging\nkubectl exec -it <pod-name> -n <namespace> -- /bin/sh' } },
          { type: 'heading', order: 4, title: 'OOMKilled — Out of Memory', content: { text: 'OOMKilled — Container Killed by Memory Limit' } },
          { type: 'rich_text', order: 5, content: { text: 'OOMKilled (exit code 137) means the container was killed by the Linux kernel\'s OOM killer because it exceeded its configured memory limit.\n\nInvestigating OOMKilled:\n1. Check kubectl describe pod — look for "OOMKilled" in Last State\n2. Check kubectl top pod — current memory usage\n3. Check application metrics — was memory growing over time (leak) or spiked suddenly?\n\nSolutions:\n- Increase memory limit in pod spec (quick fix)\n- Optimize code to reduce memory usage (sustainable fix)\n- Add memory profiling to identify leaks (engineering fix)\n- Process large data in streams/chunks instead of loading entirely into memory' } },
        ],
      },
    },
  })

  const lesson4 = await prisma.lesson.upsert({
    where: { slug: 'network-security-fundamentals' }, update: {},
    create: {
      title: 'CompTIA Security+ — Network Security Fundamentals (PRO)',
      slug: 'network-security-fundamentals',
      summary: 'Các khái niệm bảo mật mạng thiết yếu cho kỳ thi CompTIA Security+: firewall types, VPN protocols, IDS vs IPS và kiến trúc zero-trust — dành riêng cho tài khoản PRO.',
      type: 'technical_reading', domainId: domains['CYBERSEC'].id, levelId: levels[1].id,
      estimatedMinutes: 45, isProOnly: true, status: ContentStatus.published, publishedAt: new Date(), createdById: teacher2.id,
      certificates: { create: [{ certificateId: certs['COMPTIA-SECURITY-PLUS'].id }] },
      sections: {
        create: [
          { type: 'heading', order: 1, title: 'Firewall Types', content: { text: 'Firewall Types' } },
          { type: 'rich_text', order: 2, content: { text: 'Packet Filtering Firewall: Examines packets at the network layer (Layer 3). Filters based on source/destination IP, port, and protocol. Stateless — does not track connection state. Fast but limited protection.\n\nStateful Inspection Firewall: Tracks the state of network connections. Understands context (e.g., allows return traffic for established TCP connections). More secure than packet filtering.\n\nNext-Generation Firewall (NGFW): Operates at Layer 7. Deep packet inspection, application awareness, SSL/TLS inspection, integrated IPS, and user identity tracking. The modern standard.' } },
          { type: 'heading', order: 3, title: 'IDS vs IPS', content: { text: 'IDS vs IPS — Detection vs Prevention' } },
          { type: 'rich_text', order: 4, content: { text: 'IDS (Intrusion Detection System): PASSIVE. Monitors traffic and generates alerts when suspicious patterns are detected. Does NOT block traffic. Think of it as a security camera.\n\nIPS (Intrusion Prevention System): ACTIVE. Sits inline in the traffic path. Detects AND blocks malicious traffic in real time. Can cause false positives that block legitimate traffic.\n\nExam tip: IDS = detect only. IPS = detect + prevent. HIDS/HIPS = host-based. NIDS/NIPS = network-based.' } },
        ],
      },
    },
  })

  const lesson5 = await prisma.lesson.upsert({
    where: { slug: 'devops-pipeline-design' }, update: {},
    create: {
      title: 'DevOps Pipeline Design — From Code to Production',
      slug: 'devops-pipeline-design',
      summary: 'Tìm hiểu cách thiết kế CI/CD pipeline hiệu quả với GitHub Actions, từ code commit đến production deployment.',
      type: 'technical_reading', domainId: domains['DEVOPS'].id, levelId: levels[0].id,
      estimatedMinutes: 30, status: ContentStatus.published, publishedAt: new Date(), createdById: teacher1.id,
      sections: {
        create: [
          { type: 'heading', order: 1, title: 'CI/CD Pipeline Stages', content: { text: 'CI/CD Pipeline Stages' } },
          { type: 'rich_text', order: 2, content: { text: 'A production-grade CI/CD pipeline typically consists of these stages:\n\n1. Source: Code commit triggers the pipeline (via webhook)\n2. Build: Compile code, install dependencies, create artifacts\n3. Test: Unit tests, integration tests, security scans (SAST)\n4. Package: Build Docker image, push to registry\n5. Deploy to Staging: Deploy to staging environment\n6. Acceptance Tests: End-to-end tests, performance tests\n7. Deploy to Production: Canary or blue-green deployment\n8. Monitor: Health checks, error rates, alerting' } },
          { type: 'code', order: 3, title: 'Example: GitHub Actions CI Pipeline', content: { language: 'yaml', code: 'name: CI Pipeline\n\non:\n  pull_request:\n    branches: [main, develop]\n\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      \n      - name: Setup Node.js\n        uses: actions/setup-node@v4\n        with:\n          node-version: "20"\n          cache: "pnpm"\n      \n      - name: Install dependencies\n        run: pnpm install --frozen-lockfile\n      \n      - name: Run unit tests\n        run: pnpm test --coverage\n      \n      - name: Run linting\n        run: pnpm lint\n      \n      - name: Build\n        run: pnpm build\n      \n      - name: Upload coverage\n        uses: codecov/codecov-action@v3' } },
        ],
      },
    },
  })
  console.log('   ✅ 5 lessons seeded')

  // Link vocabularies to lessons
  console.log('🔗 Link Vocabulary to Lessons...')
  const allVocab = await prisma.vocabulary.findMany()
  const seededLessons = await prisma.lesson.findMany()
  for (const lesson of seededLessons) {
    // Find vocabularies matching the lesson's domain or grab a sample
    let matchingVocab = allVocab.filter(v => v.domainId === lesson.domainId)
    if (matchingVocab.length === 0) matchingVocab = allVocab.slice(0, 6)
    for (const v of matchingVocab) {
      await prisma.lessonVocabulary.upsert({
        where: { lessonId_vocabularyId: { lessonId: lesson.id, vocabularyId: v.id } },
        update: {},
        create: { lessonId: lesson.id, vocabularyId: v.id }
      })
    }
  }
  console.log('   ✅ Vocabulary linked to lessons')

  // ============================================================
  // 9. QUESTIONS (15)
  // ============================================================
  console.log('❓ Seed Questions (15)...')

  const makeQ = async (type: QuestionType, prompt: string, context: string | null, explanation: string, domainCode: string, levelCode: LevelCode, topics: string[], points: number, certCodes: string[], options: Array<{ key: string; text: string; correct: boolean; exp: string }>) => {
    const lvl = await prisma.level.findUnique({ where: { code: levelCode } })
    return prisma.question.create({
      data: {
        type, prompt, context: context ?? undefined, explanation,
        domainId: domains[domainCode].id, levelId: lvl!.id, topics, points, status: ContentStatus.published,
        certificates: certCodes.length > 0 ? { create: certCodes.map(c => ({ certificateId: certs[c].id })) } : undefined,
        options: { create: options.map((o, i) => ({ key: o.key, text: o.text, isCorrect: o.correct, explanation: o.exp, order: i + 1 })) },
      },
    })
  }

  // REST API (5 questions)
  await makeQ('single_choice', 'Which HTTP status code should a REST API return when a resource is successfully created?', null, 'Mã trạng thái 201 Created là phản hồi chuẩn khi tạo mới một tài nguyên thành công. Phản hồi thường bao gồm header Location trỏ tới URL của tài nguyên vừa tạo. 200 OK dành cho thành công chung, 204 dành cho thành công không có body.', 'SOFTWARE_ENG', LevelCode.beginner, ['HTTP','REST','status codes'], 1.0, [], [
    { key: 'A', text: '200 OK', correct: false, exp: '200 OK cho biết yêu cầu thành công chung nhưng không biểu thị rõ việc tạo mới tài nguyên.' },
    { key: 'B', text: '201 Created', correct: true, exp: '201 Created là phản hồi chuẩn xác cho việc tạo mới tài nguyên thành công.' },
    { key: 'C', text: '204 No Content', correct: false, exp: '204 No Content dùng khi thành công nhưng không trả về nội dung body, thường dùng cho thao tác DELETE.' },
    { key: 'D', text: '301 Moved Permanently', correct: false, exp: '301 là mã chuyển hướng trang, không dùng cho việc tạo tài nguyên.' },
  ])

  await makeQ('single_choice', 'Which HTTP method is both safe AND idempotent?', null, 'Phương thức GET vừa safe (không thay đổi trạng thái hệ thống) vừa idempotent (gọi nhiều lần cho cùng một kết quả). PUT là idempotent nhưng không safe. POST và PATCH đều không safe và không idempotent.', 'SOFTWARE_ENG', LevelCode.intermediate, ['HTTP methods','idempotency','REST'], 1.0, [], [
    { key: 'A', text: 'POST', correct: false, exp: 'POST không safe và không idempotent — mỗi lần gọi sẽ tạo mới một tài nguyên.' },
    { key: 'B', text: 'PUT', correct: false, exp: 'PUT là idempotent nhưng không safe vì nó chỉnh sửa dữ liệu trên server.' },
    { key: 'C', text: 'GET', correct: true, exp: 'GET vừa safe (chỉ đọc) vừa idempotent (kết quả không đổi dù gọi bao nhiêu lần).' },
    { key: 'D', text: 'PATCH', correct: false, exp: 'PATCH được dùng cho cập nhật một phần và thường không đảm bảo tính idempotent.' },
  ])

  await makeQ('single_choice', 'A client sends a JSON request body but forgets to include a required field. Which HTTP status code should the server return?', null, 'Mã 400 Bad Request cho biết server không thể xử lý request do lỗi từ phía client (như thiếu trường bắt buộc hoặc sai định dạng dữ liệu).', 'SOFTWARE_ENG', LevelCode.beginner, ['HTTP','status codes','validation'], 1.0, [], [
    { key: 'A', text: '401 Unauthorized', correct: false, exp: '401 là lỗi thiếu hoặc sai thông tin xác thực (token/password).' },
    { key: 'B', text: '403 Forbidden', correct: false, exp: '403 cho biết client đã đăng nhập nhưng không có quyền truy cập.' },
    { key: 'C', text: '400 Bad Request', correct: true, exp: '400 Bad Request là câu trả lời chuẩn khi dữ liệu gửi lên bị thiếu hoặc không hợp lệ.' },
    { key: 'D', text: '500 Internal Server Error', correct: false, exp: '500 là lỗi bất ngờ từ phía hệ thống máy chủ.' },
  ])

  await makeQ('single_choice', 'A REST API returns HTTP 429. What is the most likely reason?', null, 'HTTP 429 Too Many Requests thông báo client đã vượt quá giới hạn tần suất request (rate limit) được cấu hình trên API để bảo vệ hệ thống khỏi bị quá tải.', 'SOFTWARE_ENG', LevelCode.intermediate, ['rate limiting','HTTP','API design'], 1.0, [], [
    { key: 'A', text: 'The server is experiencing an internal error', correct: false, exp: 'Lỗi nội bộ máy chủ trả về mã 5xx.' },
    { key: 'B', text: 'The client has exceeded the rate limit', correct: true, exp: '429 Too Many Requests nghĩa là client đã gửi quá nhiều request trong một khoảng thời gian.' },
    { key: 'C', text: 'The authentication token has expired', correct: false, exp: 'Token hết hạn sẽ trả về mã 401 Unauthorized.' },
    { key: 'D', text: 'The request payload is too large', correct: false, exp: 'Payload quá lớn sẽ trả về 413 Payload Too Large.' },
  ])

  await makeQ('single_choice', 'Which HTTP method should be used to update only specific fields of an existing resource?', null, 'Phương thức PATCH được thiết kế cho việc cập nhật một phần (partial update) — chỉ thay đổi các trường được truyền trong body. PUT sẽ thay thế toàn bộ tài nguyên.', 'SOFTWARE_ENG', LevelCode.intermediate, ['HTTP methods','REST','PATCH'], 1.0, [], [
    { key: 'A', text: 'PUT', correct: false, exp: 'PUT ghi đè toàn bộ tài nguyên bằng body mới — không tối ưu cho cập nhật một phần.' },
    { key: 'B', text: 'POST', correct: false, exp: 'POST dùng để tạo mới tài nguyên.' },
    { key: 'C', text: 'DELETE', correct: false, exp: 'DELETE dùng để xoá tài nguyên.' },
    { key: 'D', text: 'PATCH', correct: true, exp: 'PATCH dùng để cập nhật một phần dữ liệu của tài nguyên hiện có.' },
  ])

  // AWS Architecture (5 questions)
  await makeQ('scenario', 'A company runs a MySQL database on Amazon RDS. The database must automatically failover to a secondary instance in a different Availability Zone within 60-120 seconds if the primary fails. Which RDS feature should be enabled?', 'The company has an SLA requiring 99.95% uptime. Manual intervention for database failures is not acceptable.', 'RDS Multi-AZ tạo một bản sao standby đồng bộ ở Availability Zone khác. Khi máy chủ chính bị sự cố, RDS sẽ tự động chuyển hướng sang bản sao standby trong 60-120 giây mà không cần can thiệp thủ công.', 'CLOUD', LevelCode.intermediate, ['AWS','RDS','high availability','Multi-AZ'], 2.0, ['AWS-SAA'], [
    { key: 'A', text: 'RDS Read Replica in the same region', correct: false, exp: 'Read Replica sử dụng nhân bản bất đồng bộ và không hỗ trợ tự động failover.' },
    { key: 'B', text: 'RDS Multi-AZ deployment', correct: true, exp: 'Multi-AZ nhân bản đồng bộ và tự động chuyển vùng khi máy chủ chính gặp sự cố.' },
    { key: 'C', text: 'Amazon Aurora Global Database', correct: false, exp: 'Aurora Global Database dùng cho khôi phục thảm hoạ đa vùng (cross-region).' },
    { key: 'D', text: 'Amazon DynamoDB', correct: false, exp: 'DynamoDB là dịch vụ NoSQL hoàn toàn khác.' },
  ])

  await makeQ('scenario', 'An application needs to store and retrieve user session data with consistent sub-millisecond latency. The sessions are small (under 2KB) but accessed thousands of times per second.', 'The application has 50,000 concurrent users. Session data must be available for 30 minutes after last activity, then automatically expire.', 'Amazon ElastiCache for Redis cung cấp bộ nhớ in-memory với độ trễ dưới 1 mili-giây và hỗ trợ tự động hết hạn key (TTL) — hoàn hảo cho việc lưu trữ session người dùng.', 'CLOUD', LevelCode.intermediate, ['AWS','ElastiCache','Redis','session management','caching'], 2.0, ['AWS-SAA'], [
    { key: 'A', text: 'Amazon S3 with Transfer Acceleration', correct: false, exp: 'S3 là bộ nhớ lưu trữ file/object, độ trễ tính bằng mili-giây chứ không phải sub-millisecond.' },
    { key: 'B', text: 'Amazon RDS PostgreSQL with connection pooling', correct: false, exp: 'RDS đọc từ đĩa cứng nên quá chậm cho yêu cầu độ trễ dưới 1ms.' },
    { key: 'C', text: 'Amazon ElastiCache for Redis', correct: true, exp: 'ElastiCache Redis cung cấp tốc độ truy xuất in-memory dưới 1ms và tự động xóa session bằng TTL.' },
    { key: 'D', text: 'Amazon DynamoDB with On-Demand capacity', correct: false, exp: 'DynamoDB có độ trễ vài mili-giây, vẫn chậm hơn so với Redis in-memory.' },
  ])

  await makeQ('single_choice', 'An S3 bucket contains sensitive company data. The bucket must block ALL public access but allow a specific IAM role (arn:aws:iam::123456789012:role/DataProcessorRole) to read objects. What is the correct approach?', null, 'S3 Bucket Policy (chính sách dựa trên tài nguyên) là công cụ chuẩn để cấp quyền truy cập cho một IAM role cụ thể trong khi vẫn duy trì chế độ Chặn truy cập công khai (Block Public Access).', 'CLOUD', LevelCode.intermediate, ['AWS','S3','IAM','security','bucket policy'], 1.0, ['AWS-SAA'], [
    { key: 'A', text: 'Configure an S3 ACL to allow the IAM role', correct: false, exp: 'S3 ACLs là chuẩn cũ và không thể gán trực tiếp cho IAM role.' },
    { key: 'B', text: 'Attach a Bucket Policy allowing s3:GetObject for the IAM role', correct: true, exp: 'Bucket Policy phân quyền chính xác cho IAM role mà vẫn chặn toàn bộ truy cập công khai.' },
    { key: 'C', text: 'Enable CORS on the bucket for the IAM role', correct: false, exp: 'CORS cấu hình truy cập giữa các tên miền trên trình duyệt, không dùng cho phân quyền IAM.' },
    { key: 'D', text: 'Enable S3 Transfer Acceleration', correct: false, exp: 'Transfer Acceleration tăng tốc độ upload dữ liệu, không phải cơ chế phân quyền.' },
  ])

  await makeQ('scenario', 'A web application runs on EC2 instances in a VPC. The instances need to download software updates from the internet, but they must NOT be directly accessible from the internet (no public IP addresses assigned).', 'The EC2 instances are in private subnets. The company needs outbound internet access for package updates but zero inbound access from the internet.', 'NAT Gateway nằm trong public subnet cho phép các EC2 instances trong private subnet khởi tạo kết nối ra internet, đồng thời chặn toàn bộ các kết nối đi vào từ internet.', 'CLOUD', LevelCode.intermediate, ['AWS','NAT Gateway','VPC','networking'], 2.0, ['AWS-SAA'], [
    { key: 'A', text: 'Attach an Internet Gateway to the VPC and assign public IPs to the EC2 instances', correct: false, exp: 'Gán public IP khiến instance có thể bị truy cập trực tiếp từ internet — vi phạm yêu cầu đề bài.' },
    { key: 'B', text: 'Place EC2 instances in public subnets with security groups blocking inbound traffic', correct: false, exp: 'Đặt tại public subnet vẫn có rủi ro bị tấn công trực tiếp.' },
    { key: 'C', text: 'Deploy a NAT Gateway in a public subnet and route private subnet traffic through it', correct: true, exp: 'NAT Gateway cung cấp quyền truy cập ra internet 1 chiều cho private subnet — hoàn hảo cho yêu cầu này.' },
    { key: 'D', text: 'Use AWS Direct Connect to route traffic through the corporate network', correct: false, exp: 'Direct Connect dùng để nối mạng nội bộ doanh nghiệp với AWS, không dùng cho tải phần mềm qua internet.' },
  ])

  await makeQ('single_choice', 'A company wants to route HTTP requests to different backend services based on the URL path: /api/* to an API server fleet, and /static/* to a separate static content server. Which AWS load balancer supports this?', null, 'Application Load Balancer (ALB) hoạt động ở Tầng 7 (HTTP/HTTPS) và hỗ trợ định tuyến dựa trên đường dẫn URL (path-based routing) như /api/* hay /static/*. NLB chỉ hoạt động ở Tầng 4 nên không đọc được HTTP path.', 'CLOUD', LevelCode.intermediate, ['AWS','ELB','ALB','load balancing','routing'], 1.0, ['AWS-SAA'], [
    { key: 'A', text: 'Network Load Balancer (NLB)', correct: false, exp: 'NLB hoạt động ở Tầng 4 (TCP/UDP) nên không thể kiểm tra header đường dẫn HTTP.' },
    { key: 'B', text: 'Classic Load Balancer (CLB)', correct: false, exp: 'CLB là dòng cũ và không hỗ trợ định tuyến dựa trên đường dẫn path.' },
    { key: 'C', text: 'Application Load Balancer (ALB)', correct: true, exp: 'ALB hoạt động ở Tầng 7 và hỗ trợ phân luồng dựa trên URL path rất mạnh mẽ.' },
    { key: 'D', text: 'Gateway Load Balancer (GWLB)', correct: false, exp: 'GWLB dùng để định tuyến qua các thiết bị bảo mật ảo, không dùng cho định tuyến ứng dụng.' },
  ])

  // Kubernetes / DevOps (5 questions)
  await makeQ('scenario', 'A Kubernetes pod is in CrashLoopBackOff state. What is the FIRST command you should run to diagnose the issue?', 'The pod has been crashing repeatedly for 20 minutes. You need to quickly identify whether it is an application error, a missing environment variable, or a configuration issue.', 'Lệnh kubectl describe pod hiển thị toàn bộ thông tin chi tiết về sự kiện, biến môi trường, các volume được mount và lý do container bị crash ở mục Last State. Đây là bước đầu tiên và hiệu quả nhất để chẩn đoán sự cố.', 'DEVOPS', LevelCode.intermediate, ['Kubernetes','troubleshooting','CrashLoopBackOff','kubectl'], 2.0, ['CKA'], [
    { key: 'A', text: 'kubectl get nodes', correct: false, exp: 'Trạng thái node không giúp chẩn đoán lỗi ứng dụng trong pod.' },
    { key: 'B', text: 'kubectl describe pod <pod-name>', correct: true, exp: 'kubectl describe hiển thị thông tin sự kiện, lý do crash trước đó và cấu hình pod — bước đầu tiên hữu ích nhất.' },
    { key: 'C', text: 'kubectl get services', correct: false, exp: 'Service không liên quan tới việc container bị crash.' },
    { key: 'D', text: 'kubectl apply -f pod.yaml', correct: false, exp: 'Chạy lại file YAML khi chưa biết lỗi sẽ không giải quyết được vấn đề.' },
  ])

  await makeQ('single_choice', 'A Kubernetes pod shows status OOMKilled with exit code 137. What happened?', null, 'Lỗi OOMKilled (mã thoát 137) xảy ra khi container tiêu tốn vượt quá dung lượng RAM (Memory Limit) được cấp phép, dẫn đến việc tiến trình bị Linux kernel dừng đột ngột.', 'DEVOPS', LevelCode.intermediate, ['Kubernetes','OOMKilled','memory','troubleshooting'], 1.0, ['CKA'], [
    { key: 'A', text: 'The container was throttled due to insufficient CPU', correct: false, exp: 'Thiếu CPU chỉ khiến container chạy chậm chứ không bị dừng ngắt đột ngột như OOMKilled.' },
    { key: 'B', text: 'The container exceeded its configured memory limit and was killed', correct: true, exp: 'OOMKilled có nghĩa là container dùng quá giới hạn RAM và bị Linux Kernel kill.' },
    { key: 'C', text: 'The container image could not be pulled from the registry', correct: false, exp: 'Lỗi tải image sẽ có trạng thái ImagePullBackOff.' },
    { key: 'D', text: 'The pod failed its liveness probe 3 consecutive times', correct: false, exp: 'Lỗi liveness probe sẽ hiển thị Unhealthy trong sự kiện chứ không báo OOMKilled.' },
  ])

  await makeQ('single_choice', 'Which Kubernetes workload object automatically ensures that exactly N replicas of a pod are always running, and replaces failed pods?', null, 'Deployment quản lý ReplicaSets, đảm bảo duy trì chính xác số lượng bản sao pod đang chạy. Nếu 1 pod bị lỗi, ReplicaSet sẽ tự động tạo mới pod thay thế.', 'DEVOPS', LevelCode.beginner, ['Kubernetes','Deployment','ReplicaSet','workloads'], 1.0, ['CKA'], [
    { key: 'A', text: 'Job', correct: false, exp: 'Job dùng để chạy công việc 1 lần rồi kết thúc.' },
    { key: 'B', text: 'DaemonSet', correct: false, exp: 'DaemonSet đảm bảo chạy 1 pod trên từng Node trong cluster.' },
    { key: 'C', text: 'StatefulSet', correct: false, exp: 'StatefulSet quản lý ứng dụng có định danh trạng thái riêng.' },
    { key: 'D', text: 'Deployment', correct: true, exp: 'Deployment + ReplicaSet giúp duy trì số lượng N pod luôn hoạt động liên tục.' },
  ])

  await makeQ('single_choice', 'What is the PRIMARY advantage of a blue-green deployment strategy?', null, 'Ưu điểm lớn nhất của Blue-Green Deployment là phát hành không gián đoạn (zero-downtime) và khả năng rollback (khôi phục) phiên bản cũ ngay lập tức nếu phiên bản mới bị lỗi.', 'DEVOPS', LevelCode.intermediate, ['blue-green deployment','deployment strategy','zero downtime','rollback'], 1.0, [], [
    { key: 'A', text: 'Significantly reduces infrastructure costs', correct: false, exp: 'Blue-green tạm thời tốn gấp đôi chi phí hạ tầng vì cần duy trì 2 môi trường song song.' },
    { key: 'B', text: 'Increases CPU utilization efficiency', correct: false, exp: 'Blue-green không giúp tăng hiệu suất CPU.' },
    { key: 'C', text: 'Enables zero-downtime deployment with instant rollback capability', correct: true, exp: 'Lợi ích chính là zero-downtime và khả năng chuyển hướng traffic về phiên bản cũ ngay lập tức.' },
    { key: 'D', text: 'Eliminates the need for testing before deployment', correct: false, exp: 'Vẫn phải test kỹ trước khi chuyển giao traffic.' },
  ])

  await makeQ('scenario', 'A developer pushes code and the CI/CD pipeline fails at the "test" stage. The error message says "3 unit tests failed". What should the developer check FIRST?', 'The pipeline has 5 stages: build → lint → test → docker-build → deploy. The failure is at stage 3 (test). The build and lint stages passed successfully.', 'Vì bước Build và Lint đã thành công nên cú pháp code đã đúng. Thông báo "3 unit tests failed" chỉ ra ngay rằng lập trình viên cần xem log kết quả kiểm thử (unit test output) để biết chính xác test case nào bị trượt và vì sao.', 'DEVOPS', LevelCode.beginner, ['CI/CD','testing','troubleshooting','pipeline'], 1.0, [], [
    { key: 'A', text: 'Check production server logs for related errors', correct: false, exp: 'Lỗi xảy ra ở bước test trên CI, chưa hề được deploy lên production.' },
    { key: 'B', text: 'Review the deployment configuration files', correct: false, exp: 'File cấu hình deploy là ở các bước sau.' },
    { key: 'C', text: 'Read the unit test output to identify which tests failed and why', correct: true, exp: 'Đọc chi tiết kết quả unit test là cách nhanh nhất để tìm nguyên nhân gốc rễ.' },
    { key: 'D', text: 'Check the firewall rules on the CI server', correct: false, exp: 'Tường lửa không làm cho unit test bị fail.' },
  ])
  console.log('   ✅ 15 questions seeded')

  // ============================================================
  // 10. EXAMS (2)
  // ============================================================
  console.log('📝 Seed Exams...')

  const allQuestions = await prisma.question.findMany({ where: { status: ContentStatus.published } })
  const awsQuestions = allQuestions.filter(q => q.domainId === domains['CLOUD'].id)
  const restQuestions = allQuestions.filter(q => q.domainId === domains['SOFTWARE_ENG'].id)
  const devopsQuestions = allQuestions.filter(q => q.domainId === domains['DEVOPS'].id)

  if (!await prisma.exam.findFirst({ where: { title: 'AWS SAA Mock Exam — High Availability & Networking' } })) {
    await prisma.exam.create({
      data: {
        title: 'AWS SAA Mock Exam — High Availability & Networking (PRO)',
        description: 'Bài kiểm tra thực hành phong cách AWS SAA-C03, tập trung vào high availability, networking và database design. Dành riêng cho tài khoản PRO.',
        domainId: domains['CLOUD'].id, levelId: levels[1].id, certificateId: certs['AWS-SAA'].id,
        topics: ['Multi-AZ','Load Balancing','NAT Gateway','ElastiCache','RDS'], durationMinutes: 20,
        passingScorePercent: 70.0, maxAttempts: 3, shuffleQuestions: true, isProOnly: true,
        status: ContentStatus.published, publishedAt: new Date(), createdById: teacher1.id,
        questions: { create: awsQuestions.slice(0, 5).map((q, i) => ({ questionId: q.id, order: i + 1, weight: 1.0 })) },
      },
    })
  }

  if (!await prisma.exam.findFirst({ where: { title: 'REST API & DevOps Fundamentals Quiz' } })) {
    await prisma.exam.create({
      data: {
        title: 'REST API & DevOps Fundamentals Quiz',
        description: 'Bài kiểm tra kết hợp các câu hỏi về REST API design, HTTP methods, status codes và DevOps fundamentals. Phù hợp cho Software Engineers và DevOps Engineers.',
        domainId: domains['SOFTWARE_ENG'].id, levelId: levels[1].id,
        topics: ['REST API','HTTP methods','CI/CD','Kubernetes','deployment'], durationMinutes: 15,
        passingScorePercent: 60.0, maxAttempts: 5, shuffleQuestions: true,
        status: ContentStatus.published, publishedAt: new Date(), createdById: teacher2.id,
        questions: { create: [...restQuestions.slice(0, 5), ...devopsQuestions.slice(0, 5)].map((q, i) => ({ questionId: q.id, order: i + 1, weight: 1.0 })) },
      },
    })
  }
  console.log('   ✅ 2 exams seeded')

  // ============================================================
  // 11. LEARNER GROUPS (2)
  // ============================================================
  console.log('👨‍🎓 Seed Learner Groups...')

  if (!await prisma.learnerGroup.findFirst({ where: { name: 'AWS SAA Fast-Track #2026-A' } })) {
    await prisma.learnerGroup.create({
      data: {
        name: 'AWS SAA Fast-Track #2026-A', status: 'active',
        description: 'Nhóm chuyên sâu dành cho IT professionals đang target chứng chỉ AWS Solutions Architect Associate trong vòng 3 tháng.',
        teacherId: teacher1.id, domainId: domains['CLOUD'].id, certificateId: certs['AWS-SAA'].id,
        startsAt: new Date('2026-09-01'), endsAt: new Date('2026-11-30'),
        members: { create: [{ learnerId: learner1.id }, { learnerId: learner4.id }] },
      },
    })
  }

  if (!await prisma.learnerGroup.findFirst({ where: { name: 'CompTIA Security+ Intensive #2026-B' } })) {
    await prisma.learnerGroup.create({
      data: {
        name: 'CompTIA Security+ Intensive #2026-B', status: 'active',
        description: 'Chương trình học tập chuyên sâu về Cybersecurity, chuẩn bị cho kỳ thi CompTIA Security+ trong 4 tháng.',
        teacherId: teacher2.id, domainId: domains['CYBERSEC'].id, certificateId: certs['COMPTIA-SECURITY-PLUS'].id,
        startsAt: new Date('2026-10-01'), endsAt: new Date('2027-01-31'),
        members: { create: [{ learnerId: learner3.id }, { learnerId: learner5.id }] },
      },
    })
  }
  // Seed PRO Subscription for learner1@techenglish.pro
  const user1 = await prisma.user.findUnique({ where: { email: 'learner1@techenglish.pro' } });
  if (user1) {
    const order1 = await prisma.paymentOrder.upsert({
      where: { idempotencyKey: 'seed-idem-learner1' },
      update: { status: 'paid', paidAt: new Date() },
      create: {
        userId: user1.id,
        planId: 'pro_yearly',
        amount: 799000,
        idempotencyKey: 'seed-idem-learner1',
        status: 'paid',
        paidAt: new Date(),
        expiresAt: new Date(Date.now() + 365 * 86400000),
      }
    });

    await prisma.userSubscription.upsert({
      where: { userId: user1.id },
      update: { status: 'active', expiresAt: new Date(Date.now() + 365 * 86400000) },
      create: {
        userId: user1.id,
        planId: 'pro_yearly',
        orderId: order1.id,
        status: 'active',
        startedAt: new Date(),
        expiresAt: new Date(Date.now() + 365 * 86400000),
      }
    });
  }

  console.log('   ✅ PRO Subscription seeded for learner1@techenglish.pro');

  // ============================================================
  // 12. PHASE 3: SEED EXAM ATTEMPTS, PROGRESS, CACHE, RECOMMENDATIONS
  // ============================================================
  console.log('🚀 Seed Phase 3 Data...')

  const learners = await prisma.user.findMany({
    where: { userRoles: { some: { role: { code: 'learner' } } } }
  });
  const allLessons = await prisma.lesson.findMany();
  const allExams = await prisma.exam.findMany({
    include: {
      questions: {
        include: { question: { include: { options: true } } }
      }
    }
  });
  const allLevels = await prisma.level.findMany({ orderBy: { order: 'asc' } });

  // 1. Ensure all lessons have at least 3 sections
  for (const lesson of allLessons) {
    const sectionCount = await prisma.lessonSection.count({ where: { lessonId: lesson.id } });
    if (sectionCount === 0) {
      await prisma.lessonSection.create({
        data: { lessonId: lesson.id, type: 'heading', order: 1, title: 'Introduction to ' + lesson.title, content: { text: 'Introduction to ' + lesson.title } }
      });
      await prisma.lessonSection.create({
        data: { lessonId: lesson.id, type: 'rich_text', order: 2, content: { text: 'This is a detailed reading passage for ' + lesson.title + '. It covers the key concepts in Vietnamese while keeping the English technical terms intact. Ví dụ: REST APIs, HTTP methods, authentication tokens, và rate limiting.' } }
      });
      await prisma.lessonSection.create({
        data: { lessonId: lesson.id, type: 'vocabulary_list', order: 3, title: 'Vocabulary List', content: { text: 'Key terms used in this lesson.' } }
      });
      await prisma.lessonSection.create({
        data: { lessonId: lesson.id, type: 'quiz', order: 4, title: 'Exercise', content: { text: 'Practice exercise for ' + lesson.title } }
      });
    }
  }

  for (const learner of learners) {
    const existingProfile = await prisma.learnerProfile.findUnique({ where: { userId: learner.id } });
    if (!existingProfile) {
       await prisma.learnerProfile.create({
         data: {
           userId: learner.id,
           levelId: allLevels[0].id,
           bio: 'Autogenerated profile for testing',
           weeklyStudyTargetMinutes: 120,
           onboardingCompleted: true
         }
       });
    }

    const attemptCount = await prisma.examAttempt.count({ where: { learnerId: learner.id } });
    if (attemptCount === 0 && allExams.length > 0) {
      for (let i = 0; i < 2; i++) {
        const exam = allExams[i % allExams.length];
        if (!exam) continue;

        let totalScore = 0;
        let maxScore = 0;
        const answersData = [];

        for (const eq of exam.questions) {
          const q = eq.question;
          maxScore += q.points * eq.weight;
          
          const isCorrect = Math.random() > 0.3;
          const earnedPoints = isCorrect ? (q.points * eq.weight) : 0;
          totalScore += earnedPoints;
          
          const correctOptions = q.options.filter(o => o.isCorrect);
          const incorrectOptions = q.options.filter(o => !o.isCorrect);
          
          let selectedOptionId;
          if (isCorrect && correctOptions.length > 0) {
            selectedOptionId = correctOptions[0].id;
          } else if (incorrectOptions.length > 0) {
            selectedOptionId = incorrectOptions[0].id;
          } else if (correctOptions.length > 0) {
             selectedOptionId = correctOptions[0].id;
          }

          if (selectedOptionId) {
             answersData.push({
               questionId: q.id,
               isCorrect,
               earnedPoints,
               maxPoints: q.points * eq.weight,
               selectedOptions: { create: [{ optionId: selectedOptionId }] }
             });
          }
        }

        const scorePercent = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
        const passed = scorePercent >= exam.passingScorePercent;
        const submittedAt = new Date();
        submittedAt.setDate(submittedAt.getDate() - Math.floor(Math.random() * 20));

        await prisma.examAttempt.create({
          data: {
            learnerId: learner.id,
            examId: exam.id,
            status: AttemptStatus.submitted,
            questionsSnapshot: JSON.stringify(exam.questions),
            examSnapshot: JSON.stringify(exam),
            score: totalScore,
            maxScore,
            scorePercent,
            passed,
            startedAt: new Date(submittedAt.getTime() - 30 * 60000),
            submittedAt,
            gradedAt: submittedAt,
            answers: { create: answersData }
          }
        });
      }
    }

    const lpCount = await prisma.learningProgress.count({ where: { learnerId: learner.id } });
    if (lpCount === 0 && allLessons.length > 0) {
      for (const lesson of allLessons) {
        const statuses = [ProgressStatus.completed, ProgressStatus.in_progress, ProgressStatus.not_started];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        let completionPercent = 0;
        let completedLessonCount = 0;
        
        if (status === ProgressStatus.completed) {
           completionPercent = 100;
           completedLessonCount = 1;
        } else if (status === ProgressStatus.in_progress) {
           completionPercent = Math.floor(Math.random() * 90) + 10;
        }

        await prisma.learningProgress.create({
          data: {
            learnerId: learner.id,
            resourceType: ProgressResourceType.lesson,
            resourceId: lesson.id,
            status,
            completionPercent,
            completedLessonCount,
            totalLessonCount: 1,
            averageScorePercent: status !== ProgressStatus.not_started ? (Math.floor(Math.random() * 35) + 60) : null
          }
        });
      }
    }

    const pscExists = await prisma.progressSummaryCache.findUnique({ where: { learnerId: learner.id } });
    if (!pscExists) {
      await prisma.progressSummaryCache.create({
        data: {
          learnerId: learner.id,
          overallCompletionPercent: Math.floor(Math.random() * 40) + 40,
          studyStreakDays: Math.floor(Math.random() * 10) + 1,
          totalStudyMinutes: Math.floor(Math.random() * 800) + 200,
          completedLessons: Math.floor(Math.random() * 4) + 2,
          totalAttempts: 2,
          averageScorePercent: Math.floor(Math.random() * 25) + 65,
        }
      });
    }

    const recCount = await prisma.recommendation.count({ where: { learnerId: learner.id } });
    if (recCount === 0 && allLessons.length > 0 && allExams.length > 0) {
       for (let i = 0; i < 4; i++) {
         const types = ['lesson_review', 'vocabulary_practice', 'exam_ready', 'weak_area'];
         const recType = types[i % types.length];
         
         const resType = (i % 2 === 0) ? RecommendationResourceType.lesson : RecommendationResourceType.exam;
         const resId = resType === RecommendationResourceType.lesson ? allLessons[0].id : allExams[0].id;
         
         await prisma.recommendation.create({
           data: {
             learnerId: learner.id,
             resourceType: resType,
             resourceId: resId,
             title: 'Recommended ' + recType,
             reason: 'Based on your recent activity, we recommend this for your ' + recType + '.',
             priority: Math.floor(Math.random() * 5) + 1
           }
         });
       }
    }
  }

  // ============================================================
  // 11. PAYMENT & PRO SUBSCRIPTIONS SEED
  // ============================================================
  console.log('💳 Seed Pro Plans & Subscriptions...')
  
  // Plan quotas
  const planQuotas = [
    { planId: 'pro_monthly', maxSlots: 500, soldSlots: 45 },
    { planId: 'pro_yearly', maxSlots: 200, soldSlots: 88 },
    { planId: 'pro_lifetime', maxSlots: 50, soldSlots: 12 },
  ]
  for (const pq of planQuotas) {
    await prisma.planQuota.upsert({
      where: { planId: pq.planId },
      update: {},
      create: pq,
    })
  }

  // Active Pro Subscription for learner1 & adminUser
  const proUsers = [
    { user: learner1, planId: 'pro_yearly', amount: 1290000, days: 365 },
    { user: adminUser, planId: 'pro_lifetime', amount: 2990000, days: 3650 },
  ]

  for (const pu of proUsers) {
    const existingSub = await prisma.userSubscription.findUnique({ where: { userId: pu.user.id } })
    if (!existingSub) {
      const order = await prisma.paymentOrder.create({
        data: {
          userId: pu.user.id,
          planId: pu.planId,
          amount: pu.amount,
          idempotencyKey: `seed-order-${pu.user.id}`,
          status: 'paid',
          sepayTransactionId: `SEPAY_${pu.user.id.slice(0, 8).toUpperCase()}`,
          paidAt: new Date(),
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        }
      })

      await prisma.userSubscription.create({
        data: {
          userId: pu.user.id,
          planId: pu.planId,
          orderId: order.id,
          status: 'active',
          startedAt: new Date(),
          expiresAt: new Date(Date.now() + pu.days * 24 * 60 * 60 * 1000),
        }
      })
    }
  }
  console.log('   ✅ 3 Plan Quotas & 2 Active Pro Subscriptions (Learner1 & Admin)')

  console.log('\n✨ Seed hoàn tất!')
  console.log('\n📌 Tài khoản demo:')
  console.log('   Admin:    admin@techenglish.pro         / Demo@123456  [PRO Lifetime]')
  console.log('   Teacher1: nguyen.thanh@techenglish.pro  / Demo@123456  (Cloud & DevOps)')
  console.log('   Teacher2: tran.minh@techenglish.pro     / Demo@123456  (Security & Networking)')
  console.log('   Learner1: learner1@techenglish.pro      / Demo@123456  [PRO Yearly] (Backend dev, AWS-SAA)')
  console.log('   Learner2: learner2@techenglish.pro      / Demo@123456  (DevOps intern, CKA)')
  console.log('   Learner3: learner3@techenglish.pro      / Demo@123456  (Security analyst, Security+)')
  console.log('   Learner4: learner4@techenglish.pro      / Demo@123456  (Data engineer, GCP-ACE)')
  console.log('   Learner5: learner5@techenglish.pro      / Demo@123456  (Fresh grad)')
}

main()
  .catch((e) => { console.error('❌ Seed thất bại:', e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
