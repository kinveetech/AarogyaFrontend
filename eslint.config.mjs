import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import prettierConfig from 'eslint-config-prettier'

const config = [
  ...nextCoreWebVitals,
  prettierConfig,
  {
    ignores: ['.next/**', 'node_modules/**', 'coverage/**'],
  },
]

export default config
