import { readdir, readFile } from 'node:fs/promises'
import { join, relative } from 'node:path'

const root = process.cwd()
const canonicalUrl = 'https://cal.com/jake-emvyai/ai-consult'
const obsoleteUrl = 'https://cal.com/jake-emvy/discovery-call'
const sourceExtensions = new Set(['.ts', '.tsx', '.js', '.jsx'])
const ignoredDirectories = new Set(['node_modules', '.next', '.git', 'dist'])
const mappedFiles = [
  'app/about/page.tsx',
  'app/api/assessment/route.tsx',
  'app/contact/page.tsx',
  'app/page.tsx',
  'app/services/ai-builds/page.tsx',
  'app/services/ai-strategy-call/page.tsx',
  'app/services/discovery-call/page.tsx',
  'app/services/page.tsx',
  'app/services/systems-maintenance/page.tsx',
  'app/use-cases/page.tsx',
  'components/Footer.tsx',
  'components/Header.tsx',
]

async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    if (ignoredDirectories.has(entry.name)) continue
    const path = join(directory, entry.name)
    if (entry.isDirectory()) files.push(...await sourceFiles(path))
    else if (sourceExtensions.has(entry.name.slice(entry.name.lastIndexOf('.')))) files.push(path)
  }
  return files
}

const files = await sourceFiles(root)
const contents = await Promise.all(files.map(async (path) => [path, await readFile(path, 'utf8')]))
const production = contents.filter(([, text]) => !text.includes('docs/specs/') && !text.includes('.scratch/'))
const obsolete = production.filter(([, text]) => text.includes(obsoleteUrl))
const canonicalLiteralFiles = production.filter(([path, text]) => relative(root, path) !== 'lib/cal-links.ts' && text.includes(canonicalUrl))
const missingMappedImports = []
for (const file of mappedFiles) {
  const text = await readFile(join(root, file), 'utf8')
  if (!text.includes("import { CAL_CONSULT_URL } from '@/lib/cal-links'")) missingMappedImports.push(file)
  if (!text.includes('CAL_CONSULT_URL')) missingMappedImports.push(`${file} (unused)`)
}

if (obsolete.length) throw new Error(`Obsolete consult URL remains in production source: ${obsolete.map(([path]) => relative(root, path)).join(', ')}`)
if (canonicalLiteralFiles.length) throw new Error(`Canonical URL is hardcoded outside lib/cal-links.ts: ${canonicalLiteralFiles.map(([path]) => relative(root, path)).join(', ')}`)
if (missingMappedImports.length) throw new Error(`Mapped CTA files are not consuming CAL_CONSULT_URL: ${missingMappedImports.join(', ')}`)

const config = await readFile(join(root, 'lib/cal-links.ts'), 'utf8')
if (!config.includes(`export const CAL_CONSULT_URL = '${canonicalUrl}'`)) throw new Error('Canonical URL config is missing or incorrect')

const gate = await readFile(join(root, 'components/CalBookingGate.tsx'), 'utf8')
const sparkSettings = await readFile(join(root, 'app/spark-response/settings/page.tsx'), 'utf8')
const sector = await readFile(join(root, 'app/lp/[sector]/page.tsx'), 'utf8')
if (!gate.includes("const CAL_BASE = 'https://cal.com/jake-emvy'")) throw new Error('Unrelated CalBookingGate account changed')
if (!gate.includes("const DEFAULT_EVENT_SLUG = '15-min-ai-chat'")) throw new Error('Unrelated CalBookingGate event changed')
if (!sparkSettings.includes('https://cal.com/jake-emvy/...')) throw new Error('Spark Response settings placeholder changed')
if (sector.includes('calUrl="https://cal.com/jake-emvyai/ai-consult"')) throw new Error('Unmapped sector demo flow changed')

console.log(JSON.stringify({ canonicalUrl, configuredIn: 'lib/cal-links.ts', mappedFiles: mappedFiles.length, obsoleteReferences: 0, unrelatedFlowsPreserved: true }))
