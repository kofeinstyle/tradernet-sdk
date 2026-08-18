import { TradernetApiClient } from '../dist/index.js'

const reportTypes = new Set([
  'corporate_actions',
  'account_at_end',
  'commissions',
  'trades',
  'cash_flows',
  'securities_flows',
])
const reportPeriods = new Set(['23:59:59', '08:40:00'])

const usage = `Tradernet SDK live playground

Usage:
  npm run playground -- user-profile
  npm run playground -- portfolio [--full]
  npm run playground -- cash-flows [take] [--full]
  npm run playground -- broker-report <type> [dateFrom] [dateTo] [timePeriod] [--full]

Examples:
  npm run playground -- user-profile
  npm run playground -- portfolio
  npm run playground -- cash-flows 20 --full
  npm run playground -- broker-report corporate_actions 2026-01-01 2026-12-31

The default output is a summary. --full prints real account data to the local terminal.
`

const rawArgs = process.argv.slice(2)
const fullOutput = rawArgs.includes('--full')
const [command, ...args] = rawArgs.filter(argument => argument !== '--full')

if (!command || command === 'help' || command === '--help' || command === '-h') {
  console.log(usage)
  process.exit(0)
}

await import('dotenv/config')

const { API_KEY: apiKey, API_SECRET: apiSecret } = process.env
if (!apiKey || !apiSecret) {
  console.error('API_KEY and API_SECRET must be set in .env')
  process.exit(1)
}

const retries = Number(process.env.PLAYGROUND_RETRIES ?? 0)
const timeout = Number(process.env.PLAYGROUND_TIMEOUT ?? 60000)
const client = new TradernetApiClient({
  apiKey,
  apiSecret,
  retries: Number.isInteger(retries) && retries >= 0 ? retries : 0,
  timeout: Number.isFinite(timeout) && timeout > 0 ? timeout : 60000,
  verbose: process.env.PLAYGROUND_VERBOSE === 'true',
})

const today = new Date().toISOString().slice(0, 10)
const yearStart = `${today.slice(0, 4)}-01-01`

function printResult(result, summary) {
  if (!result.success) {
    console.error(
      JSON.stringify(
        {
          success: false,
          error: result.error,
          message: result.message,
        },
        null,
        2
      )
    )
    process.exitCode = 1
    return
  }

  console.log(JSON.stringify(fullOutput ? result : { success: true, ...summary(result.data) }, null, 2))
}

async function runPortfolio() {
  const result = await client.getPortfolio()
  printResult(result, data => ({
    command: 'portfolio',
    loaded: data.loaded,
    accounts: data.accounts.length,
    positions: data.positions.length,
    currencies: [...new Set([...data.accounts.map(item => item.curr), ...data.positions.map(item => item.curr)])],
  }))
}

async function runUserProfile() {
  const result = await client.getUserProfile()
  printResult(result, data => ({
    command: 'user-profile',
    homeCurrency: data.homeCurrency,
    main_curr: data.main_curr,
  }))
}

async function runCashFlows() {
  const take = args[0] === undefined ? 20 : Number(args[0])
  if (!Number.isInteger(take) || take <= 0) {
    throw new Error('cash-flows take must be a positive integer')
  }

  const result = await client.getUserCashFlows({ take })
  printResult(result, data => ({
    command: 'cash-flows',
    total: data.total,
    returned: data.cashflow.length,
  }))
}

async function runBrokerReport() {
  const [type, dateFrom = yearStart, dateTo = today, timePeriod = '23:59:59'] = args
  if (!reportTypes.has(type)) {
    throw new Error(`broker-report type must be one of: ${[...reportTypes].join(', ')}`)
  }
  if (!reportPeriods.has(timePeriod)) {
    throw new Error(`broker-report timePeriod must be one of: ${[...reportPeriods].join(', ')}`)
  }

  const result = await client.getBrokerReport({ dateFrom, dateTo, timePeriod }, type)
  printResult(result, data => ({
    command: 'broker-report',
    type,
    dateFrom,
    dateTo,
    timePeriod,
    rows: data.report.detailed.length,
  }))
}

try {
  if (command === 'user-profile') {
    await runUserProfile()
  } else if (command === 'portfolio') {
    await runPortfolio()
  } else if (command === 'cash-flows') {
    await runCashFlows()
  } else if (command === 'broker-report') {
    await runBrokerReport()
  } else {
    throw new Error(`Unknown command: ${command}\n\n${usage}`)
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
}
