/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { Link } from '@tanstack/react-router'
import {
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  Clapperboard,
  Copy,
  FileText,
  KeyRound,
  Route,
  ShieldCheck,
  SlidersHorizontal,
  TerminalSquare,
  Users,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { PublicLayout } from '@/components/layout'
import { Footer } from '@/components/layout/components/footer'
import { TOKEN_FLOW_BRAND, TokenFlowMark } from '@/components/token-flow-mark'
import { cn } from '@/lib/utils'

type CodeLanguage = 'curl' | 'python' | 'node'

const CODE_LANGUAGES: Array<{ id: CodeLanguage; label: string }> = [
  { id: 'curl', label: 'cURL' },
  { id: 'python', label: 'Python' },
  { id: 'node', label: 'Node.js' },
]

const ENTERPRISE_SCENARIOS = [
  [
    'content',
    FileText,
    'Content and marketing production',
    'Create product copy, campaign variants, scripts, and long-form content with a shared team gateway.',
  ],
  [
    'video',
    Clapperboard,
    'Video and creative workflows',
    'Connect text-to-video and image-to-video models for product demos, short videos, and creative review pipelines.',
  ],
  [
    'knowledge',
    Users,
    'Knowledge and customer service',
    'Build internal assistants, document Q&A, and customer support flows with controlled model access.',
  ],
  [
    'automation',
    SlidersHorizontal,
    'Agents and business automation',
    'Give internal tools one stable API for structured output, reasoning, extraction, and workflow automation.',
  ],
] as const

const API_SURFACE = [
  [
    'POST',
    '/v1/chat/completions',
    'Text generation, reasoning, structured output, and multimodal chat',
  ],
  [
    'POST',
    '/v1/images/generations',
    'Image generation and creative asset production',
  ],
  ['POST', '/v1/videos', 'Asynchronous text-to-video and image-to-video tasks'],
  [
    'POST',
    '/v1/audio/speech',
    'Speech synthesis for narration and voice workflows',
  ],
  [
    'POST',
    '/v1/embeddings',
    'Text vectors for search, RAG, and knowledge bases',
  ],
  [
    'GET',
    '/v1/models',
    'Discover the models and aliases enabled for your workspace',
  ],
] as const

const MODEL_USE_CASES = [
  ['deepseek-chat', 'DeepSeek', 'Chat and coding'],
  ['deepseek-reasoner', 'DeepSeek', 'Reasoning tasks'],
  ['qwen-max', 'Qwen', 'Long context and Chinese understanding'],
  ['doubao-seed-1-6', 'Doubao', 'General conversation and content'],
  ['moonshot-v1-128k', 'Kimi', 'Long document processing'],
  ['glm-4.5', 'GLM', 'Conversation and agent tasks'],
] as const

const ERROR_CODES = [
  ['400', 'Invalid request parameters'],
  ['401', 'API key is missing or invalid'],
  ['402', 'Insufficient quota'],
  ['429', 'Rate limit exceeded'],
  ['500', 'Upstream service is temporarily unavailable'],
] as const

export function DeveloperDocs() {
  const { t } = useTranslation()
  const [language, setLanguage] = useState<CodeLanguage>('curl')
  const [copied, setCopied] = useState(false)
  const apiBaseUrl = `${window.location.origin}/v1`
  const codeExamples = useMemo(
    () => ({
      curl: `curl ${apiBaseUrl}/chat/completions \\\n+  -H "Authorization: Bearer $TOKENFLOW_API_KEY" \\\n+  -H "Content-Type: application/json" \\\n+  -d '{
    "model": "qwen-max",
    "messages": [{"role": "user", "content": "请为新品写一段发布文案"}],
    "stream": true
  }'`,
      python: `import os
import requests

response = requests.post(
    "${apiBaseUrl}/chat/completions",
    headers={
        "Authorization": f"Bearer {os.environ['TOKENFLOW_API_KEY']}",
        "Content-Type": "application/json",
    },
    json={
        "model": "qwen-max",
        "messages": [{"role": "user", "content": "请为新品写一段发布文案"}],
    },
    timeout=60,
)
print(response.json())`,
      node: `const response = await fetch(
  "${apiBaseUrl}/chat/completions",
  {
    method: "POST",
    headers: {
      Authorization: \`Bearer \${process.env.TOKENFLOW_API_KEY}\`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "qwen-max",
      messages: [{ role: "user", content: "请为新品写一段发布文案" }],
    }),
  },
)

console.log(await response.json())`,
    }),
    [apiBaseUrl]
  )

  const copyCode = async () => {
    await navigator.clipboard.writeText(codeExamples[language])
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <PublicLayout
      logo={<TokenFlowMark />}
      showMainContainer={false}
      siteName={TOKEN_FLOW_BRAND}
    >
      <main className='bg-background min-h-svh pt-24'>
        <div className='mx-auto grid w-full max-w-7xl gap-12 px-6 pb-20 lg:grid-cols-[210px_minmax(0,1fr)] lg:px-8'>
          <aside className='hidden lg:block'>
            <nav className='sticky top-24 space-y-1 text-sm'>
              <p className='text-muted-foreground mb-3 px-3 text-xs font-semibold uppercase'>
                {t('Developer docs')}
              </p>
              <DocNavLink href='#overview' label={t('Overview')} />
              <DocNavLink href='#scenarios' label={t('Enterprise scenarios')} />
              <DocNavLink href='#quick-start' label={t('Quick start')} />
              <DocNavLink href='#authentication' label={t('Authentication')} />
              <DocNavLink href='#api-surface' label={t('API surface')} />
              <DocNavLink href='#models' label={t('Domestic model guide')} />
              <DocNavLink
                href='#governance'
                label={t('Enterprise governance')}
              />
              <DocNavLink href='#errors' label={t('Error handling')} />
            </nav>
          </aside>

          <article className='min-w-0'>
            <header
              id='overview'
              className='border-border scroll-mt-24 border-b pb-12'
            >
              <div className='text-muted-foreground mb-5 flex items-center gap-2 font-mono text-xs uppercase'>
                <span className='size-2 rounded-full bg-[#66806a]' />
                {t('TokenFlow API · Enterprise AI Gateway')}
              </div>
              <h1 className='max-w-4xl text-4xl leading-tight font-semibold tracking-tight sm:text-6xl'>
                {t('Put every AI production workflow behind one gateway')}
              </h1>
              <p className='text-muted-foreground mt-5 max-w-3xl text-base leading-8'>
                {t(
                  'TokenFlow API gives enterprise teams one stable interface for domestic text, image, video, speech, and embedding models, with unified keys, routing, quotas, billing, and operational visibility.'
                )}
              </p>
              <div className='mt-7 flex flex-wrap gap-3'>
                <Link
                  to='/keys'
                  className='bg-foreground text-background inline-flex h-10 items-center gap-2 rounded-md px-4 text-sm font-medium'
                >
                  {t('Create API key')} <ArrowRight className='size-4' />
                </Link>
                <Link
                  to='/pricing'
                  className='border-border hover:bg-muted inline-flex h-10 items-center rounded-md border px-4 text-sm font-medium'
                >
                  {t('View model pricing')}
                </Link>
              </div>
              <div className='text-muted-foreground mt-8 flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs'>
                <span>{t('Text generation')}</span>
                <span>{t('Image generation')}</span>
                <span>{t('Video tasks')}</span>
                <span>{t('Speech')}</span>
                <span>{t('Embeddings')}</span>
              </div>
            </header>

            <div className='border-border flex flex-wrap items-center gap-x-8 gap-y-3 border-b py-5 font-mono text-xs'>
              <span className='text-muted-foreground'>{t('Base URL')}</span>
              <code className='text-foreground break-all'>{apiBaseUrl}</code>
              <span className='ml-auto flex items-center gap-2 text-[#66806a] dark:text-[#8ca68f]'>
                <CheckCircle2 className='size-4' />{' '}
                {t('OpenAI-compatible gateway')}
              </span>
            </div>

            <DocSection
              id='scenarios'
              eyebrow='01'
              title={t('Enterprise scenarios')}
            >
              <p className='text-muted-foreground mb-6 max-w-3xl text-sm leading-7'>
                {t(
                  'Designed for teams that turn AI capability into repeatable business workflows, not one-off experiments.'
                )}
              </p>
              <div className='bg-border grid gap-px overflow-hidden rounded-md border sm:grid-cols-2'>
                {ENTERPRISE_SCENARIOS.map(([id, Icon, title, text]) => (
                  <div key={id} className='bg-background min-h-48 p-5'>
                    <Icon
                      className='size-5 text-[#d85f3f]'
                      aria-hidden='true'
                    />
                    <h3 className='mt-8 font-semibold'>{t(title)}</h3>
                    <p className='text-muted-foreground mt-2 text-sm leading-6'>
                      {t(text)}
                    </p>
                  </div>
                ))}
              </div>
            </DocSection>

            <DocSection id='quick-start' eyebrow='02' title={t('Quick start')}>
              <div className='bg-border grid gap-px overflow-hidden rounded-md border md:grid-cols-3'>
                <QuickStep
                  icon={<KeyRound />}
                  number='01'
                  title={t('Create an API key')}
                  text={t(
                    'Create a key in Token Management and keep it on your server.'
                  )}
                />
                <QuickStep
                  icon={<Route />}
                  number='02'
                  title={t('Set the Base URL')}
                  text={t('Point requests to the v1 address shown above.')}
                />
                <QuickStep
                  icon={<TerminalSquare />}
                  number='03'
                  title={t('Send your first request')}
                  text={t(
                    'Start with qwen-max or deepseek-chat, then switch models by task.'
                  )}
                />
              </div>
            </DocSection>

            <DocSection
              id='authentication'
              eyebrow='03'
              title={t('Authentication')}
            >
              <div className='border-border grid gap-8 border-y py-7 md:grid-cols-[1fr_1.1fr]'>
                <div>
                  <div className='mb-4 flex size-9 items-center justify-center rounded-md bg-[#66806a]/10 text-[#66806a] dark:text-[#8ca68f]'>
                    <ShieldCheck className='size-5' />
                  </div>
                  <p className='text-muted-foreground text-sm leading-7'>
                    {t(
                      'Send the API key in the Authorization header for every request.'
                    )}
                  </p>
                </div>
                <pre className='bg-foreground text-background overflow-x-auto rounded-md p-5 font-mono text-xs leading-6'>
                  <code>Authorization: Bearer $TOKENFLOW_API_KEY</code>
                </pre>
              </div>
              <p className='text-muted-foreground mt-4 flex items-start gap-2 text-sm leading-6'>
                <Check className='mt-1 size-4 shrink-0 text-[#66806a]' />
                {t(
                  'Never expose API keys in browser code or public repositories.'
                )}
              </p>
            </DocSection>

            <DocSection id='api-surface' eyebrow='04' title={t('API surface')}>
              <div className='border-border overflow-hidden rounded-md border'>
                {API_SURFACE.map(([method, endpoint, purpose]) => (
                  <div
                    key={endpoint}
                    className='border-border grid gap-2 border-b px-4 py-4 text-sm last:border-b-0 md:grid-cols-[64px_250px_1fr]'
                  >
                    <strong className='font-mono text-xs text-[#d85f3f]'>
                      {method}
                    </strong>
                    <code className='font-mono text-xs'>{endpoint}</code>
                    <span className='text-muted-foreground'>{t(purpose)}</span>
                  </div>
                ))}
              </div>
              <div className='border-border mt-8 overflow-hidden rounded-md border'>
                <div className='border-border bg-muted/30 flex items-center justify-between border-b px-4 py-3'>
                  <div>
                    <p className='font-mono text-xs uppercase'>
                      {t('Video task example')}
                    </p>
                    <p className='text-muted-foreground mt-1 text-xs'>
                      {t(
                        'Video generation is asynchronous: create a task, poll its status, then download the result.'
                      )}
                    </p>
                  </div>
                  <Clapperboard
                    className='size-5 text-[#d85f3f]'
                    aria-hidden='true'
                  />
                </div>
                <pre className='overflow-x-auto bg-[#171816] p-5 font-mono text-xs leading-6 text-[#f2f2ec]'>
                  <code>{`curl ${apiBaseUrl}/videos \\
  -H "Authorization: Bearer $TOKENFLOW_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "video-model-alias",
    "prompt": "为新品制作一段 10 秒产品展示视频",
    "seconds": 10
  }'

# Response returns a video task ID
curl ${apiBaseUrl}/videos/{video_id} \\
  -H "Authorization: Bearer $TOKENFLOW_API_KEY"`}</code>
                </pre>
              </div>

              <h3 className='mt-10 text-lg font-semibold'>
                {t('Chat completions')}
              </h3>
              <div className='border-border mt-4 overflow-hidden rounded-md border'>
                <div className='border-border bg-muted/30 flex items-center justify-between gap-3 border-b px-3 py-2'>
                  <div className='flex items-center gap-1' role='tablist'>
                    {CODE_LANGUAGES.map((item) => (
                      <button
                        key={item.id}
                        type='button'
                        role='tab'
                        aria-selected={language === item.id}
                        onClick={() => setLanguage(item.id)}
                        className={cn(
                          'h-8 rounded-md px-3 font-mono text-xs transition-colors',
                          language === item.id
                            ? 'bg-foreground text-background'
                            : 'text-muted-foreground hover:text-foreground'
                        )}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                  <button
                    type='button'
                    onClick={copyCode}
                    className='text-muted-foreground hover:text-foreground inline-flex size-8 items-center justify-center rounded-md'
                    aria-label={copied ? t('Copied') : t('Copy code')}
                    title={copied ? t('Copied') : t('Copy code')}
                  >
                    {copied ? (
                      <Check className='size-4' />
                    ) : (
                      <Copy className='size-4' />
                    )}
                  </button>
                </div>
                <pre className='overflow-x-auto bg-[#171816] p-6 font-mono text-xs leading-6 text-[#f2f2ec]'>
                  <code>{codeExamples[language]}</code>
                </pre>
              </div>
            </DocSection>

            <DocSection
              id='models'
              eyebrow='05'
              title={t('Domestic model guide')}
            >
              <p className='text-muted-foreground mb-6 max-w-2xl text-sm leading-7'>
                {t(
                  'Choose a model by task and keep the request format unchanged.'
                )}
              </p>
              <div className='border-border overflow-hidden rounded-md border'>
                {MODEL_USE_CASES.map(([model, provider, purpose]) => (
                  <div
                    key={model}
                    className='border-border grid gap-2 border-b px-4 py-4 text-sm last:border-b-0 md:grid-cols-[1.4fr_0.8fr_1.5fr]'
                  >
                    <code className='font-mono text-xs'>{model}</code>
                    <strong>{provider}</strong>
                    <span className='text-muted-foreground'>{t(purpose)}</span>
                  </div>
                ))}
              </div>
            </DocSection>

            <DocSection
              id='governance'
              eyebrow='06'
              title={t('Enterprise governance')}
            >
              <div className='grid gap-8 md:grid-cols-2'>
                <GovernanceItem
                  icon={<Users />}
                  title={t('Teams and API keys')}
                  text={t(
                    'Separate applications and teams with independent keys, groups, quotas, and access policies.'
                  )}
                />
                <GovernanceItem
                  icon={<Route />}
                  title={t('Routing and failover')}
                  text={t(
                    'Keep model aliases stable while administrators control upstream channels, priorities, and fallback paths.'
                  )}
                />
                <GovernanceItem
                  icon={<BarChart3 />}
                  title={t('Usage and cost visibility')}
                  text={t(
                    'Track requests, tokens, media tasks, quotas, and billing records from one operational console.'
                  )}
                />
                <GovernanceItem
                  icon={<ShieldCheck />}
                  title={t('Production controls')}
                  text={t(
                    'Protect credentials, limit traffic, retain request records, and keep sensitive model access behind the gateway.'
                  )}
                />
              </div>
            </DocSection>

            <DocSection id='errors' eyebrow='07' title={t('Error handling')}>
              <div className='border-border overflow-hidden rounded-md border'>
                {ERROR_CODES.map(([code, description]) => (
                  <div
                    key={code}
                    className='border-border grid grid-cols-[70px_1fr] gap-4 border-b px-4 py-4 text-sm last:border-b-0'
                  >
                    <code className='font-mono font-semibold'>{code}</code>
                    <span className='text-muted-foreground'>
                      {t(description)}
                    </span>
                  </div>
                ))}
              </div>
              <div className='bg-muted/40 mt-6 rounded-md px-5 py-4 text-sm leading-7'>
                <strong>{t('Troubleshooting order')}</strong>
                <p className='text-muted-foreground mt-1'>
                  {t(
                    'Check the request ID, API key status, remaining quota, model access, and upstream channel status in that order.'
                  )}
                </p>
              </div>
            </DocSection>
          </article>
        </div>
      </main>
      <Footer brandMark={<TokenFlowMark />} name={TOKEN_FLOW_BRAND} />
    </PublicLayout>
  )
}

function DocNavLink(props: { href: string; label: string }) {
  return (
    <a
      href={props.href}
      className='text-muted-foreground hover:bg-muted hover:text-foreground block rounded-md px-3 py-2 transition-colors'
    >
      {props.label}
    </a>
  )
}

function DocSection(props: {
  children: React.ReactNode
  eyebrow: string
  id: string
  title: string
}) {
  return (
    <section id={props.id} className='scroll-mt-24 py-14'>
      <div className='mb-7 flex items-center gap-4'>
        <span className='text-muted-foreground font-mono text-xs'>
          {props.eyebrow}
        </span>
        <h2 className='text-2xl font-semibold'>{props.title}</h2>
      </div>
      {props.children}
    </section>
  )
}

function QuickStep(props: {
  icon: React.ReactNode
  number: string
  text: string
  title: string
}) {
  return (
    <div className='bg-background min-h-52 p-5'>
      <div className='flex items-center justify-between'>
        <span className='text-[#d85f3f] [&>svg]:size-5'>{props.icon}</span>
        <span className='text-muted-foreground font-mono text-xs'>
          {props.number}
        </span>
      </div>
      <h3 className='mt-10 font-semibold'>{props.title}</h3>
      <p className='text-muted-foreground mt-2 text-sm leading-6'>
        {props.text}
      </p>
    </div>
  )
}

function GovernanceItem(props: {
  icon: React.ReactNode
  text: string
  title: string
}) {
  return (
    <div className='border-border border-t pt-5'>
      <div className='text-[#66806a] [&>svg]:size-5'>{props.icon}</div>
      <h3 className='mt-5 font-semibold'>{props.title}</h3>
      <p className='text-muted-foreground mt-2 text-sm leading-6'>
        {props.text}
      </p>
    </div>
  )
}
