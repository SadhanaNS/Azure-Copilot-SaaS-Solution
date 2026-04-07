import { useMemo, useState } from 'react'
import { useEffect } from 'react'
import { getDashboardData } from './services/api'
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  FileCode2,
  Gauge,
  Lock,
  Play,
  Search,
  Server,
  Shield,
  Sparkles,
  TerminalSquare,
  TrendingDown,
  Wand2,
  Zap,
} from 'lucide-react'
import { motion } from 'framer-motion'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from 'recharts'

const spendTrend = [
  { month: 'Jan', cost: 18200, savings: 1200 },
  { month: 'Feb', cost: 19600, savings: 1800 },
  { month: 'Mar', cost: 18850, savings: 2200 },
  { month: 'Apr', cost: 20100, savings: 2600 },
  { month: 'May', cost: 19300, savings: 3200 },
  { month: 'Jun', cost: 18640, savings: 4100 },
]

const resourceWaste = [
  { name: 'Idle VMs', value: 34 },
  { name: 'Oversized DBs', value: 22 },
  { name: 'Unused IPs', value: 18 },
  { name: 'Old Snapshots', value: 26 },
]

const securityFindings = [
  { service: 'Storage', critical: 4, high: 9, medium: 12 },
  { service: 'VMs', critical: 2, high: 6, medium: 15 },
  { service: 'Key Vault', critical: 1, high: 3, medium: 4 },
  { service: 'AKS', critical: 3, high: 7, medium: 10 },
]

const recommendations = [
  {
    title: 'Downsize underutilized VM fleet',
    impact: '$3,840/mo',
    severity: 'High',
    description: '14 VMs are below 12% CPU for 30 days.',
    action: 'Generate Terraform change',
    icon: TrendingDown,
  },
  {
    title: 'Enable private endpoints on storage',
    impact: 'Reduce exposure',
    severity: 'Critical',
    description: '3 storage accounts allow public access.',
    action: 'Create remediation plan',
    icon: Shield,
  },
  {
    title: 'Rotate stale service principals',
    impact: 'Tighten IAM',
    severity: 'Medium',
    description: '7 secrets are older than 180 days.',
    action: 'Draft rotation workflow',
    icon: Lock,
  },
]

const promptTemplates = [
  'Show me the top 10 Azure resources wasting money this week',
  'Which subscriptions have public exposure risks right now?',
  'Generate Terraform to fix high-severity storage misconfigurations',
  'Summarize cost spikes by resource group and recommend savings',
]

const activityFeed = [
  { time: '2 min ago', text: 'AI detected abnormal spend increase in rg-payments-prod.', type: 'warning' },
  { time: '9 min ago', text: 'Terraform plan generated for VM rightsizing across 3 subscriptions.', type: 'success' },
  { time: '14 min ago', text: 'Defender alert correlated with exposed NSG rule on vm-gateway-02.', type: 'critical' },
  { time: '26 min ago', text: 'Idle public IPs identified and queued for review.', type: 'info' },
]

const terraformPreview = `resource "azurerm_linux_virtual_machine" "app01" {
  name                = "app01-prod"
  size                = "Standard_B4ms"
  resource_group_name = "rg-app-prod"

  tags = {
    optimized_by = "azure-copilot"
    savings_tier = "recommended"
  }
}

resource "azurerm_storage_account" "logs" {
  name                          = "stlogsprod01"
  public_network_access_enabled = false
}`



const metricCards = [
  { title: 'Monthly Spend', value: '$18,640', change: '-8.1%', detail: 'vs last month', icon: CreditCard },
  { title: 'Optimization Score', value: '79/100', change: '+11', detail: 'this quarter', icon: Gauge },
  { title: 'Security Risk', value: '27 open', change: '-6', detail: 'critical + high', icon: Shield },
  { title: 'Auto Remediations', value: '12', change: '+4', detail: 'last 7 days', icon: Zap },
]

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

function Card({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn('rounded-3xl border border-slate-200 bg-white shadow-sm', className)}>{children}</div>
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="text-lg font-semibold tracking-tight text-slate-900">{title}</h2>
      <p className="text-sm text-slate-500">{description}</p>
    </div>
  )
}

function SeverityBadge({ value }: { value: string }) {
  const map: Record<string, string> = {
    Critical: 'bg-red-100 text-red-700 border-red-200',
    High: 'bg-orange-100 text-orange-700 border-orange-200',
    Medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    Low: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  }

  return (
    <span className={cn('rounded-full border px-2.5 py-1 text-xs font-medium', map[value] || 'bg-slate-100 text-slate-700 border-slate-200')}>
      {value}
    </span>
  )
}

export default function App() {
  const [selectedScope, setSelectedScope] = useState('all')
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [activeTab, setActiveTab] = useState('billing')
  const [prompt, setPrompt] = useState('Show me the biggest cost leaks and the top security risks across all subscriptions.')


  useEffect(() => {
    async function load() {
      const data = await getDashboardData()
      console.log("Dashboard data:", data)
    }

    load()
  }, [])

  const headline = useMemo(() => {
    if (selectedScope === 'prod') return 'Production cloud posture at a glance'
    if (selectedScope === 'dev') return 'Development estate visibility'
    return 'Unified Azure cost, security, and remediation cockpit'
  }, [selectedScope])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-6"
        >
          <div className="overflow-hidden rounded-3xl border border-slate-300 bg-white shadow-xl">
            <div className="border-b border-slate-100 p-4 md:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white">Azure AI Copilot</span>
                    <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600">Multi-subscription</span>
                    <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600">Terraform-ready</span>
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-slate-900 !text-slate-900 md:text-6xl">{headline}</h1>
                    <p className="mt-4 max-w-3xl text-base text-slate-600 md:text-lg">
                      A SaaS control plane for billing, cost optimization, security posture, anomaly detection, and AI-generated remediation workflows.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 md:flex-row">
                  <select
                    value={selectedScope}
                    onChange={(e) => setSelectedScope(e.target.value)}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                  >
                    <option value="all">All Subscriptions</option>
                    <option value="prod">Production</option>
                    <option value="dev">Development</option>
                  </select>

                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                  >
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid gap-4 p-4 md:grid-cols-2 md:p-6 lg:grid-cols-4">
              {metricCards.map((item) => {
                const Icon = item.icon
                return (
                  <motion.div key={item.title} whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
                    <Card className="shadow-none">
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm text-slate-500">{item.title}</p>
                            <p className="mt-2 text-2xl font-semibold tracking-tight">{item.value}</p>
                            <p className="mt-1 text-sm text-slate-500">
                              <span className="font-medium text-emerald-600">{item.change}</span> {item.detail}
                            </p>
                          </div>
                          <div className="rounded-2xl bg-slate-100 p-3">
                            <Icon className="h-5 w-5 text-slate-700" />
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            <Card>
              <div className="p-6">
                <SectionHeader
                  title="AI Prompt Console"
                  description="Let users query billing, security, compliance, and infrastructure drift from one place."
                />
                <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex flex-col gap-3 md:flex-row">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none"
                        placeholder="Ask Azure Copilot anything..."
                      />
                    </div>
                    <button className="flex h-12 items-center justify-center rounded-2xl bg-slate-900 px-6 text-white">
                      <Sparkles className="mr-2 h-4 w-4" />
                      Run Prompt
                    </button>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {promptTemplates.map((item) => (
                      <button
                        key={item}
                        onClick={() => setPrompt(item)}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 transition hover:border-slate-300 hover:bg-slate-100"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex flex-wrap gap-2">
              {['billing', 'security', 'resources', 'iac'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    'rounded-2xl px-4 py-2 text-sm font-medium capitalize',
                    activeTab === tab
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-600 border border-slate-200'
                  )}
                >
                  {tab === 'iac' ? 'IaC Actions' : tab}
                </button>
              ))}
            </div>

            {activeTab === 'billing' && (
              <div className="grid gap-4 xl:grid-cols-3">
                <Card className="xl:col-span-2">
                  <div className="p-6">
                    <SectionHeader title="Cloud Spend Trend" description="Track total Azure spend and projected savings from AI actions." />
                    <div className="mt-4 h-[320px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={spendTrend}>
                          <defs>
                            <linearGradient id="costFill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                              <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="month" tickLine={false} axisLine={false} />
                          <YAxis tickLine={false} axisLine={false} />
                          <Tooltip />
                          <Area type="monotone" dataKey="cost" stroke="#2563eb" fill="url(#costFill)" strokeWidth={2} />
                          <Area type="monotone" dataKey="savings" stroke="#16a34a" fillOpacity={0} strokeDasharray="6 6" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="p-6">
                    <SectionHeader title="Waste Breakdown" description="Where the money is quietly burning." />
                    <div className="mt-4 h-[320px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={resourceWaste} dataKey="value" nameKey="name" innerRadius={62} outerRadius={100} paddingAngle={4}>
                            {resourceWaste.map((_, index) => (
                              <Cell key={index} fill={['#2563eb', '#0f172a', '#16a34a', '#f59e0b'][index % 4]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'security' && (
              <Card>
                <div className="p-6">
                  <SectionHeader title="Security Findings by Service" description="Critical, high, and medium issues across the estate." />
                  <div className="mt-4 h-[340px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={securityFindings}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="service" tickLine={false} axisLine={false} />
                        <YAxis tickLine={false} axisLine={false} />
                        <Tooltip />
                        <Bar dataKey="critical" fill="#dc2626" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="high" fill="#f97316" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="medium" fill="#eab308" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === 'resources' && (
              <div className="grid gap-4 md:grid-cols-2">
                {recommendations.map((item) => {
                  const Icon = item.icon
                  return (
                    <Card key={item.title}>
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="rounded-2xl bg-slate-100 p-3">
                              <Icon className="h-5 w-5 text-slate-700" />
                            </div>
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="font-semibold tracking-tight">{item.title}</h3>
                                <SeverityBadge value={item.severity} />
                              </div>
                              <p className="mt-2 text-sm text-slate-500">{item.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs uppercase tracking-wide text-slate-400">Impact</p>
                            <p className="font-semibold text-slate-900">{item.impact}</p>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-50 p-3">
                          <p className="text-sm text-slate-500">Action suggested by copilot</p>
                          <button className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
                            {item.action}
                          </button>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}

            {activeTab === 'iac' && (
              <Card>
                <div className="p-6">
                  <SectionHeader title="Terraform Remediation Preview" description="AI proposes IaC changes before approval." />
                  <div className="mt-4 rounded-3xl bg-slate-950 p-4 text-sm text-slate-100">
                    <div className="mb-3 flex items-center justify-between gap-3 border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2 text-slate-300">
                        <TerminalSquare className="h-4 w-4" />
                        terraform-plan.tf
                      </div>
                      <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-medium text-white">Generated by AI</span>
                    </div>
                    <pre className="overflow-x-auto whitespace-pre-wrap break-words text-xs leading-6">{terraformPreview}</pre>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button className="flex items-center rounded-2xl bg-slate-900 px-4 py-3 text-white">
                      <Play className="mr-2 h-4 w-4" />
                      Approve and Export
                    </button>
                    <button className="flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700">
                      <Wand2 className="mr-2 h-4 w-4" />
                      Explain Changes
                    </button>
                  </div>
                </div>
              </Card>
            )}
          </div>

          <div className="space-y-6 lg:col-span-4">
            <Card>
              <div className="p-6">
                <SectionHeader title="Environment Health" description="Fast scorecards for leadership and operators." />
                <div className="mt-5 space-y-5">
                  {[
                    ['Cost Efficiency', 79],
                    ['Security Posture', 68],
                    ['Automation Coverage', 54],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-slate-500">{label}</span>
                        <span className="font-medium">{value}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-200">
                        <div className="h-2 rounded-full bg-slate-900" style={{ width: `${value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <SectionHeader title="Live Activity" description="Correlated events surfaced by the assistant." />
                <div className="mt-4 max-h-[320px] space-y-3 overflow-auto pr-2">
                  {activityFeed.map((item, index) => (
                    <div key={index} className="rounded-2xl border border-slate-200 p-3">
                      <div className="mb-2 flex items-center gap-2 text-xs text-slate-400">
                        {item.type === 'critical' ? (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        ) : item.type === 'success' ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        ) : item.type === 'warning' ? (
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                        ) : (
                          <Server className="h-4 w-4 text-slate-500" />
                        )}
                        <span>{item.time}</span>
                      </div>
                      <p className="text-sm text-slate-700">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <SectionHeader title="Quick Actions" description="One-click operator workflows." />
                <div className="mt-4 space-y-3">
                  {[
                    { label: 'Analyze spend anomaly', icon: CreditCard },
                    { label: 'Review exposed resources', icon: Shield },
                    { label: 'Generate Terraform fix', icon: FileCode2 },
                    { label: 'Open executive summary', icon: ChevronRight },
                  ].map((action) => {
                    const Icon = action.icon
                    return (
                      <button
                        key={action.label}
                        className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white p-3 text-left transition hover:bg-slate-50"
                      >
                        <span className="flex items-center gap-3 text-sm font-medium text-slate-700">
                          <span className="rounded-xl bg-slate-100 p-2">
                            <Icon className="h-4 w-4" />
                          </span>
                          {action.label}
                        </span>
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </button>
                    )
                  })}
                </div>
              </div>
            </Card>

            <Card className="bg-slate-900 text-white border-slate-800">
              <div className="p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-white/10 p-2">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-300">Copilot Mode</p>
                    <p className="font-semibold">Autonomous Advisor</p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-slate-300">
                  Correlates Azure billing, Defender findings, and telemetry into one operator-ready view.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}