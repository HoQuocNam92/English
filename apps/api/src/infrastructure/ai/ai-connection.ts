type Settings = { get<T = string>(key: string): T | undefined }

/** Keep each provider's credentials and URL together; never reuse a key across providers. */
export function aiConnection(config: Settings) {
  const explicit = config.get<string>('AI_PROVIDER')?.trim().toLowerCase()
  const provider = explicit ?? (config.get<string>('OPENAI_API_KEY')?.trim() ? 'openai' : config.get<string>('APIVN_API_KEY')?.trim() ? 'apivn' : 'openai')
  if (provider !== 'openai' && provider !== 'apivn') return null
  const prefix = provider === 'openai' ? 'OPENAI' : 'APIVN'
  const apiKey = config.get<string>(`${prefix}_API_KEY`)?.trim()
  const baseUrl = (config.get<string>(`${prefix}_BASE_URL`)?.trim() || (provider === 'openai' ? 'https://api.openai.com/v1' : 'https://apivn.vn/v1')).replace(/\/$/, '')
  const model = config.get<string>(`${prefix}_MODEL`)?.trim() || 'gpt-6-luna'
  return { provider, apiKey: apiKey && !/^sk-x+$/i.test(apiKey) ? apiKey : undefined, baseUrl, model,
    requestOptions: provider === 'openai' && model === 'gpt-6-luna' ? { reasoning_effort: 'none' as const } : {},
  }
}
