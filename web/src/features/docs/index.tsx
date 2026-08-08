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
  Check,
  CheckCircle2,
  Copy,
  KeyRound,
  Route,
  ShieldCheck,
  TerminalSquare,
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

const DOMESTIC_MODELS = [
  ['deepseek-chat', 'DeepSeek', 'Chat and coding'],
  ['deepseek-reasoner', 'DeepSeek', 'Reasoning tasks'],
  ['qwen-max', 'Qwen', 'Long context and Chinese understanding'],
  ['doubao-seed-1-6', 'Doubao', 'General conversation and content'],
  ['moonshot-v1-128k', 'Kimi', 'Long document processing'],
  ['glm-4.5', 'GLM', 'Conversation and agent tasks'],
] as const

const ENDPOINTS = [
  ['POST', '/v1/chat/completions', 'Chat and reasoning'],
  ['GET', '/v1/models', 'List available models'],
  ['POST', '/v1/embeddings', 'Create text embeddings'],
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
      curl: `curl ${apiBaseUrl}/chat/completions \\\n  -H "Authorization: Bearer $TOKENFLOW_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{
    "model": "deepseek-chat",
    "messages": [{"role": "user", "content": "你好"}],
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
        "model": "deepseek-chat",
        "messages": [{"role": "user", "content": "你好"}],
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
      model: "deepseek-chat",
      messages: [{ role: "user", content: "你好" }],
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
              <DocNavLink href='#quick-start' label={t('Quick start')} />
              <DocNavLink href='#authentication' label={t('Authentication')} />
              <DocNavLink href='#chat' label={t('Chat completions')} />
              <DocNavLink href='#models' label={t('Domestic model guide')} />
              <DocNavLink href='#errors' label={t('Error handling')} />
            </nav>
          </aside>

          <article className='min-w-0'>
            <header className='border-border border-b pb-12'>
              <div className='text-muted-foreground mb-5 flex items-center gap-2 font-mono text-xs uppercase'>
                <span className='size-2 rounded-full bg-[#66806a]' />
                {TOKEN_FLOW_BRAND} · API v1
              </div>
              <h1 className='max-w-3xl text-4xl leading-tight font-semibold sm:text-5xl'>
                {t('Integrate domestic models through one stable API')}
              </h1>
              <p className='text-muted-foreground mt-5 max-w-2xl text-base leading-8'>
                {t(
                  'Use one API key to manage authentication, routing, usage, and billing for domestic model requests.'
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
            </header>

            <div className='border-border flex flex-wrap items-center gap-x-8 gap-y-3 border-b py-5 font-mono text-xs'>
              <span className='text-muted-foreground'>{t('Base URL')}</span>
              <code className='text-foreground break-all'>{apiBaseUrl}</code>
              <span className='ml-auto flex items-center gap-2 text-[#66806a] dark:text-[#8ca68f]'>
                <CheckCircle2 className='size-4' />{' '}
                {t('Unified request format')}
              </span>
            </div>

            <DocSection id='quick-start' eyebrow='01' title={t('Quick start')}>
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
                    'Start with deepseek-chat, then switch models by task.'
                  )}
                />
              </div>
            </DocSection>

            <DocSection
              id='authentication'
              eyebrow='02'
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

            <DocSection id='chat' eyebrow='03' title={t('Chat completions')}>
              <div className='border-border overflow-hidden rounded-md border'>
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

              <h3 className='mt-10 text-lg font-semibold'>
                {t('Available endpoints')}
              </h3>
              <div className='border-border mt-4 overflow-hidden rounded-md border'>
                {ENDPOINTS.map(([method, endpoint, purpose]) => (
                  <div
                    key={endpoint}
                    className='border-border grid gap-2 border-b px-4 py-4 text-sm last:border-b-0 md:grid-cols-[64px_220px_1fr]'
                  >
                    <strong className='font-mono text-xs text-[#d85f3f]'>
                      {method}
                    </strong>
                    <code className='font-mono text-xs'>{endpoint}</code>
                    <span className='text-muted-foreground'>{t(purpose)}</span>
                  </div>
                ))}
              </div>
            </DocSection>

            <DocSection
              id='models'
              eyebrow='04'
              title={t('Domestic model guide')}
            >
              <p className='text-muted-foreground mb-6 max-w-2xl text-sm leading-7'>
                {t(
                  'Choose a model by task and keep the request format unchanged.'
                )}
              </p>
              <div className='border-border overflow-hidden rounded-md border'>
                {DOMESTIC_MODELS.map(([model, provider, purpose]) => (
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

            <DocSection id='errors' eyebrow='05' title={t('Error handling')}>
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
