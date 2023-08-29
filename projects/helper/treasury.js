const ADDRESSES = require('./coreAssets.json')
const { sumTokensExport, nullAddress, } = require('./sumTokens')
const { ankrChainMapping } = require('./token')

const ARB = ADDRESSES.arbitrum.ARB;

function treasuryExports(config) {
  const chains = Object.keys(config)
  const exportObj = {}
  chains.forEach(chain => {
    let { ownTokenOwners = [], ownTokens = [], owners = [], tokens = [], blacklistedTokens = [] } = config[chain]
    if (chain === 'solana') config[chain].solOwners = owners
    if (chain === 'solana') config[chain].solOwners = owners
    const tvlConfig = { ...config[chain], }
    if (config[chain].fetchCoValentTokens !== false && ankrChainMapping[chain]) {
      tvlConfig.fetchCoValentTokens = true
      const { tokenConfig } = config[chain]
      if (!tokenConfig) {
        tvlConfig.tokenConfig = { onlyWhitelisted: false, }
      }
    }

    tvlConfig.blacklistedTokens = [...ownTokens, ...blacklistedTokens]

    if (chain === 'arbitrum') {
      tvlConfig.tokens = [...tokens, ARB]
    }
    exportObj[chain] = { tvl: sumTokensExport(tvlConfig) }

    if (ownTokens.length > 0) {
      const { solOwners, ...otherOptions } = config[chain]
      const options = { ...otherOptions, owners: [...owners, ...ownTokenOwners], tokens: ownTokens, chain, uniV3WhitelistedTokens: ownTokens }
      exportObj[chain].ownTokens = sumTokensExport(options)
    }
  })
  return exportObj
}

function ohmStaking(exports) {
  const dummyTvl = () => ({})
  const newExports = {}
  Object.entries(exports).forEach(([chain, value]) => {
    if (typeof value === 'object' && typeof value.tvl === 'function') {
      newExports[chain] = { ...value, tvl: dummyTvl }
    } else {
      newExports[chain] = value
    }
  })
  return newExports
}

function ohmTreasury(exports) {
  const dummyTvl = () => ({})
  const newExports = {}
  Object.entries(exports).forEach(([chain, value]) => {
    if (typeof value === 'object' && typeof value.staking === 'function') {
      newExports[chain] = { ...value, }
      delete newExports[chain].staking
    } else {
      newExports[chain] = value
    }
  })
  return newExports
}

module.exports = {
  nullAddress,
  treasuryExports,
  ohmTreasury,
  ohmStaking,
}
