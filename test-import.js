import { createRequire } from 'module'

const require = createRequire(import.meta.url)

async function verifyImport(label, loadModule) {
  const sdk = await loadModule()

  if (typeof sdk.TradernetApiClient !== 'function') {
    throw new Error(`${label}: TradernetApiClient export is missing`)
  }

  if (!sdk.CorporateActionTypes || sdk.CorporateActionTypes.DIVIDEND !== 'dividend') {
    throw new Error(`${label}: CorporateActionTypes export is missing`)
  }

  console.log(`${label}: ok`)
}

await verifyImport('ESM dist import', () => import('./dist/index.js'))
await verifyImport('CJS dist require', () => require('./dist/index.cjs'))
await verifyImport('Package self-reference import', () => import('@kofeinstyle/tradernet-sdk'))
