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
import { DeepSeek, Doubao, Moonshot, Qwen, Wenxin, Zhipu } from '@lobehub/icons'
import { Link } from '@tanstack/react-router'
import {
  Activity,
  ArrowRight,
  BarChart3,
  Check,
  Code2,
  FileText,
  Gauge,
  Image,
  KeyRound,
  Layers3,
  Route,
  ShieldCheck,
  SlidersHorizontal,
  TerminalSquare,
  Users,
  Video,
  WalletCards,
} from 'lucide-react'

import { Footer } from '@/components/layout/components/footer'
import { TokenFlowMark } from '@/components/token-flow-mark'

import './domestic-landing.css'

interface DomesticLandingProps {
  brandName: string
  docsUrl: string
  isAuthenticated?: boolean
}

const DOMESTIC_MODELS = [
  {
    name: 'DeepSeek',
    cnName: '深度求索',
    detail: '推理 / 编码',
    tone: 'coral',
    icon: <DeepSeek.Color size={28} />,
  },
  {
    name: 'Qwen',
    cnName: '通义千问',
    detail: '全模态 / 长上下文',
    tone: 'blue',
    icon: <Qwen.Color size={28} />,
  },
  {
    name: 'Doubao',
    cnName: '豆包',
    detail: '对话 / 图像',
    tone: 'green',
    icon: <Doubao.Color size={28} />,
  },
  {
    name: 'Kimi',
    cnName: '月之暗面',
    detail: '长文本 / 搜索',
    tone: 'ink',
    icon: <Moonshot size={28} />,
  },
  {
    name: 'GLM',
    cnName: '智谱清言',
    detail: '对话 / 智能体',
    tone: 'blue',
    icon: <Zhipu.Color size={28} />,
  },
  {
    name: 'ERNIE',
    cnName: '文心一言',
    detail: '中文理解 / 生成',
    tone: 'green',
    icon: <Wenxin.Color size={28} />,
  },
] as const

const CAPABILITIES = [
  '文本对话',
  '深度推理',
  '代码生成',
  '视觉理解',
  '图像生成',
  'Embedding',
  'Rerank',
] as const

const ENTERPRISE_WORKFLOWS = [
  {
    icon: <FileText aria-hidden />,
    eyebrow: 'CONTENT OPS',
    title: '内容与营销生产',
    text: '统一生成商品文案、广告脚本、长文和多版本内容，让团队共享模型策略和额度。',
  },
  {
    icon: <Image aria-hidden />,
    eyebrow: 'VISUAL STUDIO',
    title: '图片与视觉资产',
    text: '接入文生图、图像编辑和参考图工作流，服务商品上新、活动海报和品牌素材。',
  },
  {
    icon: <Video aria-hidden />,
    eyebrow: 'VIDEO PIPELINE',
    title: '视频与创意流程',
    text: '用异步任务统一管理文生视频、图生视频、轮询、下载和失败重试。',
  },
  {
    icon: <Users aria-hidden />,
    eyebrow: 'TEAM AI',
    title: '知识库与业务助手',
    text: '为客服、销售和内部知识库提供可控的模型访问、日志追踪和成本边界。',
  },
] as const

const REQUEST_LOGS = [
  ['10:42:18', 'deepseek-reasoner', '200', '682ms'],
  ['10:42:21', 'qwen-max', '200', '441ms'],
  ['10:42:24', 'doubao-seed', '200', '376ms'],
  ['10:42:28', 'kimi-k2', '200', '593ms'],
  ['10:42:31', 'glm-4.5', 'retry', '1.2s'],
] as const

export function DomesticLanding(props: DomesticLandingProps) {
  const docsExternal = props.docsUrl.startsWith('http')

  return (
    <div className='domestic-landing'>
      <section className='nl-hero' aria-labelledby='landing-title'>
        <div className='nl-shell nl-hero-grid'>
          <div className='nl-hero-copy'>
            <div className='nl-eyebrow'>
              <span className='nl-live-dot' />
              {props.brandName} · CHINA MODEL API FOR THE WORLD
            </div>

            <h1 id='landing-title'>
              中国模型，全球可用
              <br />
              <span>面向海外团队的 AI API</span>
            </h1>

            <p className='nl-lead'>
              TokenFlow API 帮助海外企业以更具成本优势的方式接入 DeepSeek、
              Qwen、豆包、Kimi、GLM 等中国模型。使用熟悉的 OpenAI 兼容接口，
              通过一个网关完成模型路由、额度、计费与稳定性治理。
            </p>

            <div className='nl-actions'>
              <Link
                to={props.isAuthenticated ? '/dashboard' : '/sign-up'}
                className='nl-button nl-button-primary'
              >
                {props.isAuthenticated ? '进入控制台' : '开始接入'}
                <ArrowRight aria-hidden />
              </Link>
              <Link to='/pricing' className='nl-button nl-button-secondary'>
                查看模型价格
              </Link>
              {docsExternal ? (
                <a
                  href={props.docsUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='nl-text-link'
                >
                  接入文档 <ArrowRight aria-hidden />
                </a>
              ) : (
                <Link to={props.docsUrl} className='nl-text-link'>
                  接入文档 <ArrowRight aria-hidden />
                </Link>
              )}
            </div>

            <div className='nl-proof-list' aria-label='网关核心能力'>
              <span>
                <Check aria-hidden /> 海外团队快速接入
              </span>
              <span>
                <Check aria-hidden /> 中国模型低成本路由
              </span>
              <span>
                <Check aria-hidden /> 统一 API 与账单
              </span>
            </div>
          </div>

          <GatewayRouteBoard displayName={props.brandName} />
        </div>
        <div className='nl-hero-index' aria-hidden='true'>
          <span>REQUEST</span>
          <span>ROUTE</span>
          <span>OBSERVE</span>
          <span>BILL</span>
        </div>
      </section>

      <section
        className='nl-section nl-migration'
        aria-labelledby='migration-title'
      >
        <div className='nl-shell'>
          <div className='nl-section-heading nl-heading-split'>
            <div>
              <span className='nl-kicker'>5 MINUTES TO CHINA MODELS</span>
              <h2 id='migration-title'>五分钟接入中国模型</h2>
            </div>
            <p>
              不改现有 AI 应用，只需要替换 Base URL 和 API Key。
              海外团队可以先接入一款中国模型，再逐步扩展到图像、视频、语音和知识库场景。
            </p>
          </div>

          <div className='nl-migration-grid'>
            <article className='nl-tool-panel nl-config-panel'>
              <div className='nl-panel-title'>
                <TerminalSquare aria-hidden />
                <span>接入配置</span>
                <em>2 fields</em>
              </div>
              <div className='nl-field'>
                <span>API Key</span>
                <code>sk-newapi-••••••••••••</code>
              </div>
              <div className='nl-field'>
                <span>Base URL</span>
                <code>https://your-domain.com/v1</code>
              </div>
              <div className='nl-code-block' aria-label='curl 请求示例'>
                <span className='nl-code-comment'>
                  # Call a Chinese reasoning model through TokenFlow
                </span>
                <code>curl /v1/chat/completions \</code>
                <code>
                  &nbsp;&nbsp;-H &quot;Authorization: Bearer $KEY&quot; \
                </code>
                <code>
                  &nbsp;&nbsp;-d
                  &apos;&#123;&quot;model&quot;:&quot;deepseek-reasoner&quot;&#125;&apos;
                </code>
              </div>
            </article>

            <article className='nl-tool-panel nl-trace-panel'>
              <div className='nl-panel-title'>
                <Activity aria-hidden />
                <span>实时路由追踪</span>
                <em className='nl-status-ok'>streaming</em>
              </div>
              <div className='nl-trace-path' aria-label='请求路由过程'>
                <TraceStep
                  icon={<Code2 />}
                  label='Client'
                  detail='POST /v1/chat'
                />
                <TraceStep
                  icon={<Route />}
                  label={props.brandName}
                  detail='policy matched'
                />
                <TraceStep
                  icon={<DeepSeek.Color size={22} />}
                  label='DeepSeek'
                  detail='200 · 682ms'
                />
              </div>
              <div className='nl-response'>
                <span>response.chunk</span>
                <p>请求已完成鉴权、额度检查、跨境入口与中国模型路由。</p>
                <div>
                  <em>input 1,248</em>
                  <em>output 386</em>
                  <em>¥ 0.012</em>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className='nl-section nl-models' aria-labelledby='models-title'>
        <div className='nl-shell'>
          <div className='nl-section-heading nl-heading-split'>
            <div>
              <span className='nl-kicker'>CHINA MODELS FOR GLOBAL TEAMS</span>
              <h2 id='models-title'>为海外业务选择更有成本优势的模型</h2>
            </div>
            <p>
              从文本、视觉到视频和知识库能力，统一管理模型别名、分组、倍率与故障切换，
              让海外业务更容易接入中国模型生态。
            </p>
          </div>

          <div className='nl-model-rail'>
            {DOMESTIC_MODELS.map((model) => (
              <article
                key={model.name}
                className={`nl-model nl-tone-${model.tone}`}
              >
                <div className='nl-model-icon'>{model.icon}</div>
                <div>
                  <strong>{model.name}</strong>
                  <span>{model.cnName}</span>
                </div>
                <em>{model.detail}</em>
              </article>
            ))}
          </div>

          <div className='nl-capability-strip' aria-label='支持的模型能力'>
            {CAPABILITIES.map((capability) => (
              <span key={capability}>{capability}</span>
            ))}
          </div>
        </div>
      </section>

      <section
        className='nl-section nl-workflows'
        aria-labelledby='workflows-title'
      >
        <div className='nl-shell'>
          <div className='nl-section-heading nl-heading-split'>
            <div>
              <span className='nl-kicker'>BUILT FOR BUSINESS</span>
              <h2 id='workflows-title'>从模型能力，到可复用的业务流程</h2>
            </div>
            <p>
              面向海外企业真实生产场景设计。每个团队都能使用自己的 API
              Key、模型范围、额度和成本策略，在可控成本下扩展 AI 业务。
            </p>
          </div>

          <div className='nl-workflow-grid'>
            {ENTERPRISE_WORKFLOWS.map((workflow) => (
              <article className='nl-workflow-card' key={workflow.title}>
                <div className='nl-workflow-icon'>{workflow.icon}</div>
                <span>{workflow.eyebrow}</span>
                <h3>{workflow.title}</h3>
                <p>{workflow.text}</p>
                <ArrowRight aria-hidden />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className='nl-section nl-control'
        aria-labelledby='control-title'
      >
        <div className='nl-shell nl-control-grid'>
          <div className='nl-control-copy'>
            <span className='nl-kicker'>CONTROL PLANE</span>
            <h2 id='control-title'>让模型调用可运营、可审计、可扩展</h2>
            <p className='nl-control-lead'>
              从第一次请求开始记录路由、延迟、消耗和异常，让每一笔模型成本都有来源，让每一次故障都有线索。
            </p>

            <div className='nl-control-points'>
              <ControlPoint
                icon={<Gauge />}
                title='看得见'
                text='请求、首字延迟、Token 与失败原因集中追踪。'
              />
              <ControlPoint
                icon={<SlidersHorizontal />}
                title='管得住'
                text='按用户、分组和项目配置额度、倍率与模型范围。'
              />
              <ControlPoint
                icon={<ShieldCheck />}
                title='切得稳'
                text='用优先级、权重和自动重试编排中国上游渠道。'
              />
            </div>
          </div>

          <div
            className='nl-console'
            aria-label={`${props.brandName} 控制台能力示意`}
          >
            <div className='nl-console-head'>
              <div>
                <Layers3 aria-hidden />
                <strong>{props.brandName} Console</strong>
              </div>
              <span>
                <i /> routes healthy
              </span>
            </div>
            <div className='nl-console-stats'>
              <div>
                <span>今日请求</span>
                <strong>12,846</strong>
              </div>
              <div>
                <span>可用令牌</span>
                <strong>18</strong>
              </div>
              <div>
                <span>平均首字</span>
                <strong>428 ms</strong>
              </div>
            </div>
            <div className='nl-log-table'>
              <div className='nl-log-head'>
                <span>时间</span>
                <span>模型</span>
                <span>状态</span>
                <span>延迟</span>
              </div>
              {REQUEST_LOGS.map(([time, model, status, latency]) => (
                <div className='nl-log-row' key={`${time}-${model}`}>
                  <span>{time}</span>
                  <strong>{model}</strong>
                  <em className={status === 'retry' ? 'is-retry' : ''}>
                    {status}
                  </em>
                  <span>{latency}</span>
                </div>
              ))}
            </div>
            <div className='nl-console-foot'>
              <span>
                <BarChart3 aria-hidden /> 最近 24 小时
              </span>
              <span>自动刷新</span>
            </div>
          </div>
        </div>
      </section>

      <section
        className='nl-section nl-governance'
        aria-labelledby='governance-title'
      >
        <div className='nl-shell'>
          <div className='nl-governance-head'>
            <div>
              <span className='nl-kicker'>用量与成本</span>
              <h2 id='governance-title'>模型、额度、状态与成本放在同一处</h2>
            </div>
            <p>
              先看能力和价格，再决定让哪一类请求走哪条路由。策略对业务透明，成本对团队透明。
            </p>
          </div>

          <div
            className='nl-governance-table'
            role='table'
            aria-label='平台治理能力'
          >
            <div role='row' className='nl-governance-row nl-governance-header'>
              <span role='columnheader'>管理对象</span>
              <span role='columnheader'>配置内容</span>
              <span role='columnheader'>运行时动作</span>
              <span role='columnheader'>可观测结果</span>
            </div>
            <GovernanceRow
              icon={<KeyRound />}
              title='令牌与用户'
              config='额度、有效期、模型范围'
              action='鉴权与限流'
              result='调用与余额明细'
            />
            <GovernanceRow
              icon={<Route />}
              title='渠道与分组'
              config='优先级、权重、倍率'
              action='路由与故障切换'
              result='成功率与延迟'
            />
            <GovernanceRow
              icon={<WalletCards />}
              title='计费与价格'
              config='模型价格、分组倍率'
              action='实时计费'
              result='消费与成本趋势'
            />
          </div>

          <div className='nl-governance-actions'>
            <Link to='/pricing' className='nl-button nl-button-light'>
              打开模型广场 <ArrowRight aria-hidden />
            </Link>
            <Link
              to={props.isAuthenticated ? '/dashboard' : '/sign-in'}
              className='nl-inline-link'
            >
              查看控制台
            </Link>
          </div>
        </div>
      </section>

      <section className='nl-final-cta' aria-labelledby='cta-title'>
        <div className='nl-shell'>
          <span className='nl-kicker'>READY WHEN YOU ARE</span>
          <h2 id='cta-title'>把中国模型能力带到全球业务</h2>
          <p>
            从一个 API Key
            开始，先跑通一条请求，再把路由、成本和团队权限逐步收进同一个控制面。
          </p>
          <div className='nl-actions nl-actions-center'>
            <Link
              to={props.isAuthenticated ? '/dashboard' : '/sign-up'}
              className='nl-button nl-button-primary'
            >
              {props.isAuthenticated ? '进入控制台' : '创建账号'}
              <ArrowRight aria-hidden />
            </Link>
            <Link to='/pricing' className='nl-button nl-button-secondary'>
              查看模型价格
            </Link>
          </div>
        </div>
      </section>

      <Footer
        brandMark={<TokenFlowMark />}
        className='nl-footer'
        name={props.brandName}
      />
    </div>
  )
}

function GatewayRouteBoard(props: { displayName: string }) {
  return (
    <div
      className='nl-route-board'
      aria-label='中国模型面向海外业务的统一路由示意'
    >
      <div className='nl-board-head'>
        <div>
          <span className='nl-window-dot' />
          <span className='nl-window-dot' />
          <span className='nl-window-dot' />
        </div>
        <code>POST /v1/chat/completions</code>
        <span className='nl-board-live'>LIVE</span>
      </div>

      <div className='nl-route-map'>
        <div className='nl-route-source'>
          <Code2 aria-hidden />
          <div>
            <strong>Client Request</strong>
            <span>海外业务应用</span>
          </div>
        </div>

        <div className='nl-route-line' aria-hidden='true'>
          <i />
          <b />
        </div>

        <div className='nl-gateway-node'>
          <Route aria-hidden />
          <div>
            <strong>{props.displayName}</strong>
            <span>鉴权 · 路由 · 计费</span>
          </div>
        </div>

        <div className='nl-provider-grid'>
          {DOMESTIC_MODELS.slice(0, 4).map((model) => (
            <div className='nl-provider-node' key={model.name}>
              {model.icon}
              <span>{model.name}</span>
              <i />
            </div>
          ))}
        </div>
      </div>

      <div className='nl-board-code'>
        <span>route.policy</span>
        <code>reasoning → deepseek-reasoner</code>
        <em>200 OK · 682 ms</em>
      </div>
    </div>
  )
}

function TraceStep(props: {
  icon: React.ReactNode
  label: string
  detail: string
}) {
  return (
    <div className='nl-trace-step'>
      <div className='nl-trace-icon'>{props.icon}</div>
      <strong>{props.label}</strong>
      <span>{props.detail}</span>
    </div>
  )
}

function ControlPoint(props: {
  icon: React.ReactNode
  title: string
  text: string
}) {
  return (
    <article className='nl-control-point'>
      <div>{props.icon}</div>
      <h3>{props.title}</h3>
      <p>{props.text}</p>
    </article>
  )
}

function GovernanceRow(props: {
  icon: React.ReactNode
  title: string
  config: string
  action: string
  result: string
}) {
  return (
    <div role='row' className='nl-governance-row'>
      <strong role='cell'>
        {props.icon}
        {props.title}
      </strong>
      <span role='cell'>{props.config}</span>
      <span role='cell'>{props.action}</span>
      <span role='cell'>{props.result}</span>
    </div>
  )
}
