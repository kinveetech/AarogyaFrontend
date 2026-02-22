import {
  createSystem,
  defaultConfig,
  defineConfig,
  defineGlobalStyles,
} from '@chakra-ui/react'
import { tokens, semanticTokens } from './tokens'

const globalCss = defineGlobalStyles({
  body: {
    bg: 'bg.canvas',
    color: 'text.primary',
    fontFamily: 'body',
    minHeight: '100vh',
    backgroundImage: {
      base: 'linear-gradient(165deg, #FFF8F0 0%, #F0FAF0 40%, #E0F5F0 70%, #D5F0EA 100%)',
      _dark: 'linear-gradient(165deg, #0B1A1A 0%, #0F2020 40%, #112626 70%, #142B2B 100%)',
    },
    backgroundAttachment: 'fixed',
  },
  '::selection': {
    bg: { base: '{colors.brand.100}', _dark: '{colors.brand.700}' },
    color: { base: '{colors.brand.700}', _dark: '{colors.brand.300}' },
  },
})

const config = defineConfig({
  globalCss,
  theme: {
    tokens,
    semanticTokens,
  },
})

export const system = createSystem(defaultConfig, config)
