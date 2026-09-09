import { Injectable, ServiceUnavailableException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios from 'axios'

@Injectable()
export class EmbeddingService {
  constructor(private readonly config: ConfigService) {}

  model() { return this.config.get<string>('EMBEDDING_MODEL', 'embed-v4.0') }

  async embed(inputs: string[], inputType: 'search_document' | 'search_query' = 'search_document') {
    if (!inputs.length) return []
    if (!this.config.get<string>('COHERE_API_KEY')) throw new ServiceUnavailableException('COHERE_API_KEY chưa được cấu hình.')
    const outputDimension = Number(this.config.get('EMBEDDING_DIMENSIONS', 1024)) as 256 | 512 | 1024 | 1536
    const response = await axios.post('https://api.cohere.com/v2/embed', {
      model: this.model(), texts: inputs, input_type: inputType, embedding_types: ['float'], output_dimension: outputDimension,
    }, { headers: { Authorization: `Bearer ${this.config.get<string>('COHERE_API_KEY')}`, 'Content-Type': 'application/json' }, timeout: 60_000 })
    const vectors = response.data?.embeddings?.float as number[][]
    if (!Array.isArray(vectors) || vectors.length !== inputs.length) throw new ServiceUnavailableException('Cohere không trả đủ embedding.')
    if (vectors.some((vector) => vector.length !== outputDimension)) throw new ServiceUnavailableException('Cohere trả vector sai số chiều cấu hình.')
    return vectors
  }

  embedDocuments(inputs: string[]) { return this.embed(inputs, 'search_document') }
  async embedQuery(input: string) { return (await this.embed([input], 'search_query'))[0] }
}
