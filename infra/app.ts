import * as cdk from 'aws-cdk-lib'

import { MomAbaStack } from './stack'

const app = new cdk.App()

new MomAbaStack(app, 'MomAba', {
  env: {
    region: 'eu-central-1',
  },
})
