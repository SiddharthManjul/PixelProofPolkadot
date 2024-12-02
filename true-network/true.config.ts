
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
    address: 'o2bGSpuWujp5ShQ6BZUQaYV4wwMwsJxgGuMtmc7hS8tt7x9',
    secret: process.env.NEXT_PUBLIC_TRUE_NETWORK_SECRET_KEY ?? ''
  },
  issuer: {
    name: 'PixelStorarc',
    hash: '0xc7c95135fbcc47129adc93260b21525db449371edaaafb3d1af8de4287bc8f72'
  },
  algorithm: {
    id: undefined,
    path: undefined,
    schemas: []
  },
}
  