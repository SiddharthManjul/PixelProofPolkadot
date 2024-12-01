
import { TrueApi, testnet } from '@truenetworkio/sdk'
import { TrueConfig } from '@truenetworkio/sdk/dist/utils/cli-config'

// If you are not in a NodeJS environment, please comment the code following code:
import dotenv from 'dotenv'
dotenv.config()

export const getTrueNetworkInstance = async (): Promise<TrueApi> => {
  const trueApi = await TrueApi.create(config.account.secret)

  await trueApi.setIssuer(config.issuer.hash)

  return trueApi;
}

export const config: TrueConfig = {
  network: testnet,
  account: {
    address: 'noj5nKRfM7vrkATrF1bTRYenyiTME5KwK4woB2LVL72Q32J',
    secret: process.env.TRUE_NETWORK_SECRET_KEY ?? ''
  },
  issuer: {
    name: 'PixelProofBrooklyn',
    hash: '0x4cb2ff2546ab7bb2ab9c418477bdb5c00f6b787d0198f9c11ccb1a24a64b6932'
  },
  algorithm: {
    id: undefined,
    path: undefined,
    schemas: []
  },
}
  