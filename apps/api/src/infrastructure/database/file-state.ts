import { AsyncLocalStorage } from 'node:async_hooks'
import { randomUUID } from 'node:crypto'
import * as fs from 'node:fs'
import * as path from 'node:path'

export const FILE_MODELS = ['adminMfa', 'auditLog', 'auditAlert', 'studyTimeSession'] as const
type State = Record<typeof FILE_MODELS[number], any[]>
type Scope = { tx: any; state: State; dirty: boolean }
const empty = (): State => ({ adminMfa: [], auditLog: [], auditAlert: [], studyTimeSession: [] })
const revive = (key: string, value: any) => typeof value === 'string' && /(At|Until)$/.test(key) && /^\d{4}-\d\d-\d\dT/.test(value) ? new Date(value) : value
const copy = (value: any) => JSON.parse(JSON.stringify(value), revive)
function match(row: any, where: any = {}): boolean {
  return Object.entries(where).every(([key, value]: [string, any]) => {
    if (key === 'AND') return (Array.isArray(value) ? value : [value]).every(v => match(row, v))
    if (key === 'OR') return value.some((v: any) => match(row, v))
    if (key === 'NOT') return !(Array.isArray(value) ? value : [value]).some(v => match(row, v))
    const actual = row[key] ?? null
    if (value instanceof Date) return Number(actual) === Number(value)
    if (value === null || typeof value !== 'object') return actual === value
    return Object.entries(value).every(([op, expected]: [string, any]) => {
      if (op === 'mode') return true
      if (op === 'equals') return actual === expected
      if (op === 'in') return expected.includes(actual)
      if (op === 'not') return actual !== expected
      if (op === 'contains') return String(actual ?? '').toLowerCase().includes(String(expected).toLowerCase())
      if (op === 'has') return Array.isArray(actual) && actual.includes(expected)
      if (op === 'gt') return actual > expected
      if (op === 'gte') return actual >= expected
      if (op === 'lt') return actual < expected
      if (op === 'lte') return actual <= expected
      throw new Error('Unsupported file filter: ' + op)
    })
  })
}
export class FileTask {
  constructor(private execute: () => Promise<any>) {}
  then(resolve: any, reject: any) { return this.execute().then(resolve, reject) }
  catch(reject: any) { return this.execute().catch(reject) }
  finally(callback: any) { return this.execute().finally(callback) }
}

/** PostgreSQL serializes writers; a durable transaction-id journal recovers the
 * JSON commit after a crash between the database commit and the file rename. */
export class FileState {
  readonly directory = path.resolve(process.env.TECHENGLISH_STATE_DIR || path.join(process.cwd(), '.runtime-state'))
  private context = new AsyncLocalStorage<Scope>()
  constructor(private transaction: any) {}
  get current() { return this.context.getStore() }
  private file(name: string) { return path.join(this.directory, name) }
  private read(name: string): any {
    return fs.existsSync(this.file(name)) ? JSON.parse(fs.readFileSync(this.file(name), 'utf8'), revive) : null
  }
  private write(name: string, data: any) {
    fs.mkdirSync(this.directory, { recursive: true, mode: 0o700 })
    const tmp = this.file(name + '.' + randomUUID() + '.tmp')
    const fd = fs.openSync(tmp, 'wx', 0o600)
    try { fs.writeFileSync(fd, JSON.stringify(data)); fs.fsyncSync(fd) } finally { fs.closeSync(fd) }
    fs.renameSync(tmp, this.file(name))
    if (process.platform !== 'win32') { const dir = fs.openSync(this.directory, 'r'); try { fs.fsyncSync(dir) } finally { fs.closeSync(dir) } }
  }
  private async recover(tx: any) {
    const pending = this.read('pending.json')
    if (!pending) return
    const rows = await tx.$queryRawUnsafe('SELECT pg_xact_status($1::xid8) AS status', pending.xid)
    if (rows[0]?.status === 'committed') this.write('state.json', pending.state)
    else if (rows[0]?.status !== 'aborted') throw new Error('Cannot resolve pending file-state transaction')
    fs.unlinkSync(this.file('pending.json'))
  }
  async run(invoke: (tx: any) => Promise<any>, options?: any): Promise<any> {
    if (this.current) return invoke(this.current.tx)
    const result = await this.transaction(async (tx: any) => {
      await tx.$queryRawUnsafe('SELECT pg_advisory_xact_lock(724309184)::text AS locked')
      await this.recover(tx)
      const scope: Scope = { tx, state: this.read('state.json') ?? empty(), dirty: false }
      return this.context.run(scope, async () => {
        const result = await invoke(tx)
        if (scope.dirty) {
          const rows = await tx.$queryRawUnsafe('SELECT pg_current_xact_id()::text AS xid')
          this.write('pending.json', { xid: rows[0].xid, state: scope.state })
        }
        return result
      })
    }, { timeout: 30000, maxWait: 10000, ...options })
    // Finalize under the same shared lock. A concurrent reader can recover first.
    await this.transaction(async (tx: any) => {
      await tx.$queryRawUnsafe('SELECT pg_advisory_xact_lock(724309184)::text AS locked')
      await this.recover(tx)
    }, { timeout: 30000, maxWait: 10000 })
    return result
  }
  model(name: typeof FILE_MODELS[number]): any {
    return new Proxy({}, { get: (_, operation: string) => (args: any = {}) => new FileTask(() => this.run(async () => {
      const scope = this.current!, rows = scope.state[name]
      const selected = () => {
        let result = rows.filter(row => match(row, args.where))
        for (const order of [...(Array.isArray(args.orderBy) ? args.orderBy : args.orderBy ? [args.orderBy] : [])].reverse()) {
          const [key, dir] = Object.entries(order)[0]
          result.sort((a, b) => (a[key] > b[key] ? 1 : a[key] < b[key] ? -1 : 0) * (dir === 'desc' ? -1 : 1))
        }
        return result
      }
      const project = (row: any) => row == null ? null : copy(args.select ? Object.fromEntries(Object.keys(args.select).filter(key => args.select[key]).map(key => [key, row[key] ?? null])) : row)
      if (operation === 'count') return selected().length
      if (operation === 'findMany') return selected().slice(args.skip ?? 0, args.take == null ? undefined : (args.skip ?? 0) + args.take).map(project)
      if (['findUnique', 'findFirst', 'findUniqueOrThrow', 'findFirstOrThrow'].includes(operation)) {
        const row = selected()[0]
        if (!row && operation.endsWith('OrThrow')) throw new Error('File record not found')
        return project(row)
      }
      if (name === 'auditLog' && !['create', 'createMany'].includes(operation)) throw new Error('Audit history is append-only')
      scope.dirty = true
      const create = (data: any) => {
        const now = new Date()
        const row = name === 'adminMfa'
          ? { enabledAt: null, lastStep: -1, recoveryHashes: [], failedAttempts: 0, lockedUntil: null, ...copy(data) }
          : { id: randomUUID(), createdAt: now, ...(name === 'studyTimeSession' ? { seconds: 0, startedAt: now } : {}), ...(name === 'auditLog' ? { actorId:null, actorEmail:null, action:null, eventKey:null, outcome:null, targetIds:[], severity:'info', oldValues:null, newValues:null, requestId:null } : {}), ...copy(data) }
        if (name === 'auditLog' && row.requestId && !/^[0-9a-f-]{36}$/i.test(row.requestId)) throw new Error('Invalid audit request UUID')
        const key = name === 'adminMfa' ? 'userId' : 'id'
        if (rows.some(item => item[key] === row[key] || (name === 'auditAlert' && item.dedupeKey === row.dedupeKey))) throw new Error('Duplicate file record')
        rows.push(row); return project(row)
      }
      if (operation === 'create') return create(args.data)
      if (operation === 'createMany') { for (const data of args.data) create(data); return { count: args.data.length } }
      if (operation === 'upsert') { const row = selected()[0]; if (!row) return create(args.create); Object.assign(row, copy(args.update)); return project(row) }
      if (operation === 'update' || operation === 'updateMany') {
        const found = selected(); if (operation === 'update' && !found.length) throw new Error('File record not found')
        for (const row of operation === 'update' ? found.slice(0, 1) : found) Object.assign(row, copy(args.data))
        return operation === 'update' ? project(found[0]) : { count: found.length }
      }
      if (operation === 'delete' || operation === 'deleteMany') {
        const found = selected(); if (operation === 'delete' && !found.length) throw new Error('File record not found')
        const removed = operation === 'delete' ? found.slice(0, 1) : found
        scope.state[name] = rows.filter(row => !removed.includes(row))
        return operation === 'delete' ? project(found[0]) : { count: removed.length }
      }
      throw new Error('Unsupported file operation: ' + operation)
    })) })
  }
}
