// These are broad domain preferences, not a claim that a dedicated career course exists.
// Unknown/admin-created careers receive no guessed mapping.
const domainsByCareer: Record<string, readonly string[]> = {
  CLOUD_ENGINEER: ['CLOUD'],
  SECURITY_ENGINEER: ['CYBERSEC'],
  NETWORK_ENGINEER: ['CLOUD', 'CYBERSEC'],
  DATA_ENGINEER: ['SOFTWARE_ENG', 'CLOUD'],
  BUSINESS_ANALYST: ['SOFTWARE_ENG'],
  SOFTWARE_ENGINEER: ['SOFTWARE_ENG'],
  DEVOPS_ENGINEER: ['CLOUD', 'SOFTWARE_ENG'],
}

type GoalLink = { careerGoal?: { code: string; name: string; isActive?: boolean } }

export function careerDomainCodes(code: string): readonly string[] {
  return domainsByCareer[code] ?? []
}

export function careerFocus(links: readonly GoalLink[] = []) {
  const goals = links.flatMap(link => link.careerGoal && link.careerGoal.isActive !== false ? [link.careerGoal] : [])
  const matching = (domainCode?: string) => goals.filter(goal => careerDomainCodes(goal.code).includes(domainCode ?? ''))
  return {
    goals: goals.map(goal => ({ code: goal.code, name: goal.name })),
    score: (domainCode?: string) => matching(domainCode).length ? 1 : 0,
    reason: (domainCode?: string) => {
      const names = matching(domainCode).map(goal => goal.name)
      return names.length ? `Ưu tiên chuyên ngành liên quan đến mục tiêu nghề nghiệp ${names.join(', ')}.` : ''
    },
  }
}
