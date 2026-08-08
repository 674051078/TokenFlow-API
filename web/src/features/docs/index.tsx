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
  ExternalLink,
  FileText,
  Image,
  KeyRound,
  Route,
  ShieldCheck,
  SlidersHorizontal,
  TerminalSquare,
  Users,
  Video,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
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

const OFFICIAL_DOC_GROUPS = [
  {
    id: 'qwen',
    provider: 'Qwen',
    docs: [
      [
        'Qwen API quick start',
        'Create a Qwen API key, choose a region, and make the first OpenAI-compatible request.',
        'https://help.aliyun.com/zh/model-studio/first-api-call-to-qwen',
      ],
      [
        'Qwen text generation reference',
        'Review chat, Responses, and native DashScope interfaces before mapping a model into TokenFlow.',
        'https://help.aliyun.com/zh/model-studio/qwen-api-reference/',
      ],
      [
        'Qwen text-to-image reference',
        'Check prompt, size, reference image, asynchronous task, and result fields for image generation.',
        'https://help.aliyun.com/zh/model-studio/text-to-image-api-reference',
      ],
      [
        'Qwen text-to-video reference',
        'Check regional endpoints, async task creation, polling, duration, resolution, and prompt fields.',
        'https://help.aliyun.com/zh/model-studio/text-to-video-api-reference',
      ],
    ],
  },
  {
    id: 'deepseek',
    provider: 'DeepSeek',
    docs: [
      [
        'DeepSeek first API call',
        'Use the official OpenAI-compatible endpoint to verify an API key and a text generation request.',
        'https://api-docs.deepseek.com/zh-cn/guides/reasoning_model',
      ],
      [
        'DeepSeek chat completion reference',
        'Review streaming, reasoning, tool calls, response format, and model-specific request fields.',
        'https://api-docs.deepseek.com/zh-cn/api/create-chat-completion/',
      ],
      [
        'DeepSeek JSON output guide',
        'Use structured JSON responses for extraction, workflow automation, and downstream business systems.',
        'https://api-docs.deepseek.com/zh-cn/guides/json_mode/',
      ],
    ],
  },
  {
    id: 'doubao',
    provider: 'Doubao / Volcengine Ark',
    docs: [
      [
        'Doubao and Ark documentation center',
        'Find model services, authentication, endpoint configuration, and enterprise deployment guidance.',
        'https://www.volcengine.com/docs?lang=zh',
      ],
      [
        'Ark model inference API',
        'Review chat, Responses, image, video, and embedding capabilities available through Ark.',
        'https://www.volcengine.com/docs/82379/66619f8df281250274ef4f88?lang=zh',
      ],
    ],
  },
  {
    id: 'kimi',
    provider: 'Kimi / Moonshot AI',
    docs: [
      [
        'Kimi API concepts',
        'Understand Kimi models, API keys, context windows, and the OpenAI-compatible integration model.',
        'https://platform.kimi.com/docs/introduction',
      ],
      [
        'Kimi API overview',
        'Use the official endpoint and SDK examples when configuring a Kimi channel in TokenFlow.',
        'https://platform.kimi.com/docs/api/overview',
      ],
    ],
  },
  {
    id: 'glm',
    provider: 'GLM / Zhipu AI',
    docs: [
      [
        'GLM HTTP API quick start',
        'Create credentials and send an HTTP request to the official GLM model service.',
        'https://docs.bigmodel.cn/cn/guide/develop/http/introduction',
      ],
    ],
  },
  {
    id: 'qianfan',
    provider: 'Baidu Qianfan',
    docs: [
      [
        'Qianfan documentation center',
        'Browse enterprise model, Agent, multimodal, pricing, and authentication documentation.',
        'https://cloud.baidu.com/doc/qianfan/index.html',
      ],
      [
        'Qianfan text generation API',
        'Review the OpenAI-compatible chat endpoint, API key permissions, model field, and messages format.',
        'https://cloud.baidu.com/doc/qianfan-api/s/3m7of64lb',
      ],
      [
        'Qianfan multimodal inference API',
        'Check text, image, video, image editing, and embedding capabilities exposed by the V2 API.',
        'https://cloud.baidu.com/doc/qianfan/s/qmh4sv5vi',
      ],
    ],
  },
  {
    id: 'minimax',
    provider: 'MiniMax',
    docs: [
      [
        'MiniMax API overview',
        'Review text, speech, image, video, music, and file APIs in the official platform index.',
        'https://platform.minimaxi.com/docs/api-reference/api-overview',
      ],
      [
        'MiniMax API key and access FAQ',
        'Find official instructions for creating API keys, quotas, and account-level access.',
        'https://platform.minimaxi.com/docs/faq/about-apis',
      ],
    ],
  },
  {
    id: 'hunyuan',
    provider: 'Tencent Hunyuan',
    docs: [
      [
        'Hunyuan image generation API',
        'Review Tencent Cloud authentication, image generation tasks, parameters, and result polling.',
        'https://cloud.tencent.cn/document/api/1668/88077',
      ],
      [
        'Hunyuan video generation task API',
        'Review text-to-video and image-to-video task creation, status queries, and API Explorer usage.',
        'https://cloud.tencent.com/document/product/1616/126160',
      ],
    ],
  },
] as const

const MODEL_USE_CASES = [
  ['deepseek-chat', 'DeepSeek', 'Chat and coding'],
  ['deepseek-reasoner', 'DeepSeek', 'Reasoning tasks'],
  ['qwen-max', 'Qwen', 'Long context and Chinese understanding'],
  ['doubao-seed-1-6', 'Doubao', 'General conversation and content'],
  ['moonshot-v1-128k', 'Kimi', 'Long document processing'],
  ['glm-4.5', 'GLM', 'Conversation and agent tasks'],
] as const

const DOC_NAV_ITEMS = [
  ['#overview', 'Overview'],
  ['#scenarios', 'Enterprise scenarios'],
  ['#quick-start', 'Quick start'],
  ['#authentication', 'Authentication'],
  ['#api-surface', 'API surface'],
  ['#generation', 'Generation workflows'],
  ['#models', 'Domestic model guide'],
  ['#references', 'Official upstream references'],
  ['#governance', 'Enterprise governance'],
  ['#errors', 'Error handling'],
] as const

const ERROR_GUIDES = [
  [
    '400',
    'Invalid request parameters',
    'Check JSON syntax, required fields, model alias, content type, and media parameter ranges.',
  ],
  [
    '401',
    'API key is missing or invalid',
    'Confirm the Authorization header, key status, expiration, group access, and whether the key belongs to this TokenFlow instance.',
  ],
  [
    '402',
    'Insufficient quota',
    'Check the user balance, group quota, model price, and whether a media task was pre-charged before retrying.',
  ],
  [
    '404',
    'Model or endpoint not found',
    'Confirm the endpoint path and verify that the requested model alias is enabled in the selected group.',
  ],
  [
    '408',
    'Request timed out',
    'For media tasks, keep polling the task endpoint; for synchronous requests, retry with a bounded backoff and inspect the request ID.',
  ],
  [
    '413',
    'Request body is too large',
    'Reduce image size, prompt length, attachments, or conversation history, then retry with only the required fields.',
  ],
  [
    '429',
    'Rate limit exceeded',
    'Slow down retries, respect the returned retry hint, and ask an administrator to review RPM, TPM, or channel limits.',
  ],
  [
    '500',
    'Gateway internal error',
    'Use the request ID to inspect server logs and confirm that the configured channel and database are healthy.',
  ],
  [
    '502',
    'Upstream request failed',
    'Check the upstream response, provider endpoint, model permissions, and channel key before changing the client request.',
  ],
  [
    '503',
    'Upstream service is temporarily unavailable',
    'Check channel health and fallback routing, then retry after a short backoff or switch to an enabled model alias.',
  ],
] as const

const TASK_STATUS_GUIDE = [
  [
    'queued',
    'Queued',
    'The task has been accepted. Poll the task endpoint after a short delay.',
  ],
  [
    'processing',
    'Processing',
    'The upstream model is generating. Do not create duplicate tasks unless the request has expired.',
  ],
  [
    'succeeded',
    'Succeeded',
    'Read the result URL or output object, then download the asset from the returned endpoint.',
  ],
  [
    'failed',
    'Failed',
    'Keep the task ID and request ID, read the error detail, and fix the model or input before retrying.',
  ],
] as const

export function DeveloperDocs() {
  const { t } = useTranslation()
  const [language, setLanguage] = useState<CodeLanguage>('curl')
  const [copied, setCopied] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState('qwen')
  const [activeSection, setActiveSection] = useState('overview')
  const apiBaseUrl = `${window.location.origin}/v1`
  const selectedProviderGroup =
    OFFICIAL_DOC_GROUPS.find((group) => group.id === selectedProvider) ??
    OFFICIAL_DOC_GROUPS[0]
  const codeExamples = useMemo(
    () => ({
      curl: `curl ${apiBaseUrl}/chat/completions \\\n+  -H "Authorization: Bearer $TOKENFLOW_API_KEY" \\\n+  -H "Content-Type: application/json" \\\n+  -d '{
    "model": "qwen-max",
    "messages": [{"role": "user", "content": "请为新品写一段发布文案"}],
    "stream": true
  }'`.replaceAll('\n+', '\n'),
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

  useEffect(() => {
    const sectionIds = DOC_NAV_ITEMS.map(([href]) => href.slice(1))
    const sections = sectionIds
      .map((id) => document.querySelector<HTMLElement>(`#${id}`))
      .filter((section): section is HTMLElement => section !== null)

    const updateActiveSection = () => {
      const marker = window.scrollY + 140
      let currentSection = sectionIds[0]
      for (const section of sections) {
        if (section.offsetTop <= marker) currentSection = section.id
      }
      setActiveSection(currentSection)
    }

    updateActiveSection()
    window.addEventListener('scroll', updateActiveSection, { passive: true })
    window.addEventListener('hashchange', updateActiveSection)
    return () => {
      window.removeEventListener('scroll', updateActiveSection)
      window.removeEventListener('hashchange', updateActiveSection)
    }
  }, [])

  const selectProvider = (providerId: string) => {
    setSelectedProvider(providerId)
    window.history.replaceState(null, '', `#provider-${providerId}`)
  }

  return (
    <PublicLayout
      logo={<TokenFlowMark />}
      showMainContainer={false}
      siteName={TOKEN_FLOW_BRAND}
    >
      <main className='bg-background min-h-svh pt-24'>
        <div className='mx-auto grid w-full max-w-7xl gap-8 px-4 pb-20 sm:grid-cols-[160px_minmax(0,1fr)] sm:px-6 lg:grid-cols-[210px_minmax(0,1fr)] lg:gap-12 lg:px-8'>
          <aside className='hidden sm:block'>
            <nav className='sticky top-24 space-y-1 text-sm'>
              <p className='text-muted-foreground mb-3 px-3 text-xs font-semibold uppercase'>
                {t('Developer docs')}
              </p>
              {DOC_NAV_ITEMS.map(([href, label]) => (
                <DocNavLink
                  key={href}
                  href={href}
                  label={t(label)}
                  active={activeSection === href.slice(1)}
                />
              ))}
            </nav>
          </aside>

          <article className='min-w-0'>
            <div className='border-border mb-8 rounded-md border p-3 sm:hidden'>
              <p className='text-muted-foreground mb-2 px-2 text-xs font-semibold uppercase'>
                {t('On this page')}
              </p>
              <nav className='grid grid-cols-2 gap-1 text-sm'>
                {DOC_NAV_ITEMS.map(([href, label]) => (
                  <DocNavLink
                    key={href}
                    href={href}
                    label={t(label)}
                    active={activeSection === href.slice(1)}
                  />
                ))}
              </nav>
            </div>
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
              id='generation'
              eyebrow='05'
              title={t('Generation workflows')}
            >
              <p className='text-muted-foreground mb-6 max-w-3xl text-sm leading-7'>
                {t(
                  'Use the same TokenFlow API key and gateway prefix for media generation. Configure the upstream channel and model alias in the console first.'
                )}
              </p>
              <div className='border-border mb-8 border-l-2 pl-4 text-sm leading-7'>
                <strong>{t('Model alias note')}</strong>
                <p className='text-muted-foreground mt-1'>
                  {t(
                    'The model value in these examples is your TokenFlow alias, such as qwen-image or wan-video. It does not need to equal the upstream model name.'
                  )}
                </p>
              </div>
              <div className='space-y-6'>
                <GenerationExample
                  endpoint='/v1/images/generations'
                  icon={<Image />}
                  title={t('Text to image')}
                  description={t(
                    'Create product visuals, campaign assets, or concept images from a prompt.'
                  )}
                  code={`curl ${apiBaseUrl}/images/generations \\
  -H "Authorization: Bearer $TOKENFLOW_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "qwen-image",
    "prompt": "一张适合企业官网首屏的智能制造产品海报，简洁、专业、留白充足",
    "size": "1024x1024",
    "n": 1
  }'`}
                />
                <GenerationExample
                  endpoint='/v1/videos'
                  icon={<Video />}
                  title={t('Text to video')}
                  description={t(
                    'Create a long-running video task, poll it until completion, then download the generated file.'
                  )}
                  code={`curl ${apiBaseUrl}/videos \\
  -H "Authorization: Bearer $TOKENFLOW_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "wan-video",
    "prompt": "为企业新品制作一段 10 秒产品展示视频，镜头稳定，光线自然",
    "seconds": 10
  }'

# Poll the task status
curl ${apiBaseUrl}/videos/{video_id} \\
  -H "Authorization: Bearer $TOKENFLOW_API_KEY"

# Download after the task succeeds
curl ${apiBaseUrl}/videos/{video_id}/content \\
  -H "Authorization: Bearer $TOKENFLOW_API_KEY" \\
  -o result.mp4`}
                />
              </div>
              <p className='text-muted-foreground mt-6 text-xs leading-6'>
                {t(
                  'Media requests can be asynchronous and may have provider-specific fields. Use the linked upstream reference and the channel test tool to confirm the exact model parameters before production rollout.'
                )}
              </p>
            </DocSection>

            <DocSection
              id='models'
              eyebrow='06'
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
              id='references'
              eyebrow='07'
              title={t('Official upstream references')}
            >
              <p className='text-muted-foreground mb-6 max-w-3xl text-sm leading-7'>
                {t(
                  'These are official provider documents for API keys, model capabilities, request fields, regional endpoints, and pricing. TokenFlow remains the stable gateway your applications call.'
                )}
              </p>
              <nav
                className='border-border mb-8 flex gap-2 overflow-x-auto border-b pb-3'
                aria-label={t('Provider directory')}
                role='tablist'
              >
                {OFFICIAL_DOC_GROUPS.map((group) => (
                  <button
                    key={group.id}
                    type='button'
                    role='tab'
                    aria-selected={selectedProvider === group.id}
                    aria-controls={`provider-${group.id}`}
                    onClick={() => selectProvider(group.id)}
                    className={cn(
                      'border-border shrink-0 rounded-md border px-3 py-2 text-sm whitespace-nowrap transition-colors',
                      selectedProvider === group.id
                        ? 'bg-foreground text-background border-foreground'
                        : 'hover:bg-muted'
                    )}
                  >
                    {group.provider}
                  </button>
                ))}
              </nav>
              <div
                id={`provider-${selectedProviderGroup.id}`}
                className='scroll-mt-24'
                role='tabpanel'
                aria-label={selectedProviderGroup.provider}
              >
                <div className='mb-4 flex flex-wrap items-baseline justify-between gap-2'>
                  <h3 className='text-lg font-semibold'>
                    {selectedProviderGroup.provider}
                  </h3>
                  <span className='text-muted-foreground text-xs'>
                    {t('Select an official API reference')}
                  </span>
                </div>
                <div className='border-border grid gap-px overflow-hidden rounded-md border sm:grid-cols-2'>
                  {selectedProviderGroup.docs.map(
                    ([title, description, href]) => (
                      <a
                        key={href}
                        href={href}
                        target='_blank'
                        rel='noreferrer'
                        className='bg-background hover:bg-muted/40 group p-5 transition-colors'
                      >
                        <div className='text-muted-foreground flex items-center justify-between font-mono text-xs uppercase'>
                          <span>{selectedProviderGroup.provider}</span>
                          <ExternalLink className='size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5' />
                        </div>
                        <h4 className='mt-8 font-semibold'>{t(title)}</h4>
                        <p className='text-muted-foreground mt-2 text-sm leading-6'>
                          {t(description)}
                        </p>
                      </a>
                    )
                  )}
                </div>
              </div>
            </DocSection>

            <DocSection
              id='governance'
              eyebrow='08'
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

            <DocSection id='errors' eyebrow='09' title={t('Error handling')}>
              <p className='text-muted-foreground mb-6 max-w-3xl text-sm leading-7'>
                {t(
                  'TokenFlow keeps the response shape predictable so your application can handle validation, authentication, quota, rate-limit, gateway, and upstream failures with one error path.'
                )}
              </p>
              <div className='border-border overflow-hidden rounded-md border'>
                <div className='bg-muted/30 text-muted-foreground grid gap-2 border-b px-4 py-3 text-xs font-semibold uppercase md:grid-cols-[70px_190px_1fr]'>
                  <span>{t('Code')}</span>
                  <span>{t('Meaning')}</span>
                  <span>{t('What to check')}</span>
                </div>
                {ERROR_GUIDES.map(([code, meaning, guidance]) => (
                  <div
                    key={code}
                    className='border-border grid gap-2 border-b px-4 py-4 text-sm last:border-b-0 md:grid-cols-[70px_190px_1fr]'
                  >
                    <code className='font-mono font-semibold'>{code}</code>
                    <strong>{t(meaning)}</strong>
                    <span className='text-muted-foreground'>{t(guidance)}</span>
                  </div>
                ))}
              </div>
              <div className='border-border mt-8 overflow-hidden rounded-md border'>
                <div className='bg-muted/30 border-border border-b px-4 py-3'>
                  <strong>{t('Asynchronous task statuses')}</strong>
                  <p className='text-muted-foreground mt-1 text-xs'>
                    {t(
                      'Image and video requests may return a task ID first. Poll the task endpoint and handle these normalized statuses.'
                    )}
                  </p>
                </div>
                {TASK_STATUS_GUIDE.map(([status, meaning, guidance]) => (
                  <div
                    key={status}
                    className='border-border grid gap-2 border-b px-4 py-3 text-sm last:border-b-0 md:grid-cols-[110px_150px_1fr]'
                  >
                    <code className='font-mono text-xs'>{status}</code>
                    <strong>{t(meaning)}</strong>
                    <span className='text-muted-foreground'>{t(guidance)}</span>
                  </div>
                ))}
              </div>
              <div className='bg-muted/40 mt-6 rounded-md px-5 py-4 text-sm leading-7'>
                <strong>{t('Troubleshooting order')}</strong>
                <p className='text-muted-foreground mt-1'>
                  {t(
                    'Check the request ID, API key status, remaining quota, model access, request parameters, and upstream channel status in that order.'
                  )}
                </p>
              </div>
              <pre className='mt-6 overflow-x-auto rounded-md bg-[#171816] p-5 font-mono text-xs leading-6 text-[#f2f2ec]'>
                <code>{`{
  "error": {
    "message": "具体错误信息",
    "type": "invalid_request_error",
    "code": "invalid_model",
    "request_id": "request_..."
  }
}`}</code>
              </pre>
            </DocSection>
          </article>
        </div>
      </main>
      <Footer brandMark={<TokenFlowMark />} name={TOKEN_FLOW_BRAND} />
    </PublicLayout>
  )
}

function DocNavLink(props: { active?: boolean; href: string; label: string }) {
  return (
    <a
      href={props.href}
      className={cn(
        'text-muted-foreground hover:bg-muted hover:text-foreground block rounded-md px-3 py-2 transition-colors',
        props.active && 'bg-muted text-foreground font-semibold'
      )}
      aria-current={props.active ? 'location' : undefined}
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

function GenerationExample(props: {
  code: string
  description: string
  endpoint: string
  icon: React.ReactNode
  title: string
}) {
  return (
    <div className='border-border overflow-hidden rounded-md border'>
      <div className='border-border bg-muted/30 flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3'>
        <div className='flex items-center gap-3'>
          <span className='text-[#d85f3f] [&>svg]:size-5'>{props.icon}</span>
          <div>
            <h3 className='font-semibold'>{props.title}</h3>
            <p className='text-muted-foreground mt-1 text-xs'>
              {props.description}
            </p>
          </div>
        </div>
        <code className='text-muted-foreground font-mono text-xs'>
          {props.endpoint}
        </code>
      </div>
      <pre className='overflow-x-auto bg-[#171816] p-5 font-mono text-xs leading-6 text-[#f2f2ec]'>
        <code>{props.code}</code>
      </pre>
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
