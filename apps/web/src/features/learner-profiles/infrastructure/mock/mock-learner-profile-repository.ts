import type { PaginatedResult } from '@techenglish/contracts';
import type {
  LearnerProfileDetail,
  LearnerProfileFilterOptions,
  LearnerProfileListFilters,
  LearnerProfileListItem,
  LearnerProfileRepository
} from '../../application/ports/learner-profile-repository';

export const mockLearnerProfilesDetail: LearnerProfileDetail[] = [
  {
    id: 'learner-1',
    displayName: 'Lan Nguyễn',
    email: 'lan.nguyen@techenglish.pro',
    avatarInitials: 'LN',
    level: 'Intermediate',
    itField: 'Cloud Computing',
    interests: ['Cloud Computing', 'DevOps', 'AWS'],
    careerGoal: 'Cloud Solutions Architect',
    certificateGoal: 'AWS Certified Solutions Architect Associate',
    certificateLevelLabel: 'Associate',
    progressPercent: 78,
    joinedAtLabel: '15/01/2026',
    lastActiveLabel: '10 phút trước',
    status: 'active',
    estimatedCompletionLabel: '28/03/2026',
    completedLessons: 32,
    totalLessons: 45,
    lessonGrowthLabel: '+5 bài tuần này',
    averageScore: 86.5,
    averageScoreDeltaLabel: '+3.2 pts',
    topicProgress: [
      { id: 't1', title: 'AWS IAM & Security Policies', progressPercent: 90, tone: 'primary' },
      { id: 't2', title: 'VPC & Hybrid Networking', progressPercent: 75, tone: 'secondary' },
      { id: 't3', title: 'High Availability & Auto Scaling', progressPercent: 68, tone: 'ai' }
    ],
    recentAssessments: [
      {
        id: 'a1',
        title: 'AWS SAA Practice Exam #1',
        submittedAtLabel: '22/08/2026',
        durationLabel: '45 phút',
        score: 58,
        maxScore: 65,
        status: 'passed'
      },
      {
        id: 'a2',
        title: 'Cloud Architecture Scenario Quiz',
        submittedAtLabel: '18/08/2026',
        durationLabel: '20 phút',
        score: 18,
        maxScore: 20,
        status: 'passed'
      }
    ]
  },
  {
    id: 'learner-2',
    displayName: 'Minh Trần',
    email: 'minh.tran@techenglish.pro',
    avatarInitials: 'MT',
    level: 'Beginner',
    itField: 'Cybersecurity',
    interests: ['Cybersecurity', 'Networking', 'Ethical Hacking'],
    careerGoal: 'Security Analyst',
    certificateGoal: 'CompTIA Security+',
    certificateLevelLabel: 'Fundamental',
    progressPercent: 46,
    joinedAtLabel: '02/02/2026',
    lastActiveLabel: '2 giờ trước',
    status: 'active',
    estimatedCompletionLabel: '15/05/2026',
    completedLessons: 18,
    totalLessons: 40,
    lessonGrowthLabel: '+2 bài tuần này',
    averageScore: 72.0,
    averageScoreDeltaLabel: '+1.5 pts',
    topicProgress: [
      { id: 't4', title: 'Network Vulnerabilities & Threats', progressPercent: 60, tone: 'primary' },
      { id: 't5', title: 'Cryptography Terminology', progressPercent: 40, tone: 'secondary' }
    ],
    recentAssessments: [
      {
        id: 'a3',
        title: 'Security+ Acronyms & Terms Quiz',
        submittedAtLabel: '20/08/2026',
        durationLabel: '15 phút',
        score: 14,
        maxScore: 20,
        status: 'needs-review'
      }
    ]
  },
  {
    id: 'learner-3',
    displayName: 'Phúc Lê',
    email: 'phuc.le@techenglish.pro',
    avatarInitials: 'PL',
    level: 'Advanced',
    itField: 'Data Engineering',
    interests: ['Data Engineering', 'Big Data', 'Distributed Systems'],
    careerGoal: 'Principal Data Engineer',
    certificateGoal: 'Google Professional Data Engineer',
    certificateLevelLabel: 'Professional',
    progressPercent: 88,
    joinedAtLabel: '10/12/2025',
    lastActiveLabel: 'Hôm qua',
    status: 'active',
    estimatedCompletionLabel: '01/09/2026',
    completedLessons: 48,
    totalLessons: 52,
    lessonGrowthLabel: '+4 bài tuần này',
    averageScore: 94.0,
    averageScoreDeltaLabel: '+0.8 pts',
    topicProgress: [
      { id: 't6', title: 'BigQuery Data Warehousing', progressPercent: 95, tone: 'primary' },
      { id: 't7', title: 'Apache Beam & Spark Streaming', progressPercent: 85, tone: 'ai' }
    ],
    recentAssessments: [
      {
        id: 'a4',
        title: 'Google Data Engineer Mock Test #3',
        submittedAtLabel: '21/08/2026',
        durationLabel: '60 phút',
        score: 47,
        maxScore: 50,
        status: 'passed'
      }
    ]
  }
];

export class MockLearnerProfileRepository implements LearnerProfileRepository {
  async list(input: LearnerProfileListFilters): Promise<PaginatedResult<LearnerProfileListItem>> {
    let items: LearnerProfileListItem[] = mockLearnerProfilesDetail;

    if (input.search) {
      const q = input.search.toLowerCase();
      items = items.filter(
        (p) => p.displayName.toLowerCase().includes(q) || p.email.toLowerCase().includes(q)
      );
    }

    if (input.level) {
      items = items.filter((p) => p.level.toLowerCase() === input.level?.toLowerCase());
    }

    if (input.itField) {
      items = items.filter((p) => p.itField.toLowerCase() === input.itField?.toLowerCase());
    }

    const page = input.page || 1;
    const limit = input.limit || 10;
    const total = items.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const paginatedItems = items.slice((page - 1) * limit, page * limit);

    return {
      items: paginatedItems,
      page,
      limit,
      total,
      totalPages
    };
  }

  async getFilterOptions(): Promise<LearnerProfileFilterOptions> {
    return {
      levels: ['Beginner', 'Intermediate', 'Advanced', 'Professional'],
      itFields: ['Cloud Computing', 'Cybersecurity', 'Data Engineering', 'DevOps', 'Software Engineering'],
      careerGoals: ['Cloud Engineer', 'Security Analyst', 'Data Engineer', 'DevOps Specialist'],
      certificateGoals: [
        'AWS Certified Cloud Practitioner',
        'AWS Certified Solutions Architect Associate',
        'CompTIA Security+',
        'Google Professional Data Engineer'
      ]
    };
  }

  async findById(id: string): Promise<LearnerProfileDetail | null> {
    return mockLearnerProfilesDetail.find((profile) => profile.id === id) ?? null;
  }
}
