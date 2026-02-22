import { extendTheme, type ThemeConfig, type StyleFunctionProps } from '@chakra-ui/react'
import {
  colors,
  semanticTokens,
  fonts,
  fontSizes,
  fontWeights,
  radii,
  shadows,
} from './tokens'

const config: ThemeConfig = {
  initialColorMode: 'system',
  useSystemColorMode: true,
}

const theme = extendTheme({
  config,
  colors,
  semanticTokens,
  fonts,
  fontSizes,
  fontWeights,
  radii,
  shadows,

  styles: {
    global: (props: StyleFunctionProps) => ({
      body: {
        bg: 'bg.canvas',
        color: 'text.primary',
        fontFamily: 'body',
        minHeight: '100vh',
        // Ambient gradient background — matches the loading screen
        backgroundImage: props.colorMode === 'dark'
          ? 'linear-gradient(165deg, #0B1A1A 0%, #0F2020 40%, #112626 70%, #142B2B 100%)'
          : 'linear-gradient(165deg, #FFF8F0 0%, #F0FAF0 40%, #E0F5F0 70%, #D5F0EA 100%)',
        backgroundAttachment: 'fixed',
      },
      '::selection': {
        bg: props.colorMode === 'dark' ? 'brand.700' : 'brand.100',
        color: props.colorMode === 'dark' ? 'brand.300' : 'brand.700',
      },
    }),
  },

  components: {
    // ── Button ─────────────────────────────────────────────────
    Button: {
      baseStyle: {
        fontFamily: 'body',
        fontWeight: 'medium',
        borderRadius: 'full',
        letterSpacing: '0.01em',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        _focusVisible: {
          boxShadow: '0 0 0 3px rgba(14, 107, 102, 0.35)',
          outline: 'none',
        },
      },
      variants: {
        solid: (props: StyleFunctionProps) => ({
          bg: 'action.primary',
          color: 'white',
          _hover: {
            bg: 'action.primary.hover',
            transform: 'translateY(-1px)',
            boxShadow: props.colorMode === 'dark'
              ? '0 4px 20px rgba(26, 158, 151, 0.35)'
              : '0 4px 20px rgba(14, 107, 102, 0.30)',
          },
          _active: { transform: 'translateY(0)' },
        }),
        outline: {
          borderColor: 'border.default',
          color: 'text.primary',
          bg: 'transparent',
          _hover: {
            bg: 'bg.overlay',
            borderColor: 'border.strong',
          },
        },
        ghost: {
          color: 'text.secondary',
          _hover: { bg: 'bg.overlay' },
        },
        // Soft tinted variant for secondary actions
        soft: (props: StyleFunctionProps) => ({
          bg: props.colorMode === 'dark'
            ? 'rgba(26, 158, 151, 0.15)'
            : 'rgba(14, 107, 102, 0.08)',
          color: 'action.primary',
          _hover: {
            bg: props.colorMode === 'dark'
              ? 'rgba(26, 158, 151, 0.25)'
              : 'rgba(14, 107, 102, 0.14)',
          },
        }),
        // Glass variant — for use on gradient/image backgrounds
        glass: (props: StyleFunctionProps) => ({
          bg: props.colorMode === 'dark'
            ? 'rgba(26, 53, 53, 0.6)'
            : 'rgba(255, 255, 255, 0.55)',
          backdropFilter: 'blur(12px)',
          border: '1px solid',
          borderColor: 'border.subtle',
          color: 'text.primary',
          _hover: {
            bg: props.colorMode === 'dark'
              ? 'rgba(26, 53, 53, 0.8)'
              : 'rgba(255, 255, 255, 0.75)',
          },
        }),
      },
      sizes: {
        sm: { h: '32px', px: '14px', fontSize: 'sm' },
        md: { h: '40px', px: '20px', fontSize: 'sm' },
        lg: { h: '48px', px: '28px', fontSize: 'md' },
      },
      defaultProps: { variant: 'solid', size: 'md' },
    },

    // ── Card ───────────────────────────────────────────────────
    Card: {
      baseStyle: {
        container: {
          bg: 'bg.card',
          borderRadius: 'xl',
          border: '1px solid',
          borderColor: 'border.subtle',
          boxShadow: 'md',
          backdropFilter: 'blur(20px)',
          overflow: 'hidden',
          transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
          _hover: {
            boxShadow: 'lg',
            borderColor: 'border.default',
          },
        },
        header: {
          pt: '20px',
          px: '24px',
          pb: '0',
        },
        body: {
          px: '24px',
          py: '16px',
        },
        footer: {
          px: '24px',
          pt: '0',
          pb: '20px',
        },
      },
      variants: {
        // Glass card — used on gradient backgrounds (matches web loading screen)
        glass: {
          container: {
            bg: 'bg.glass',
            backdropFilter: 'blur(30px)',
            border: '1px solid',
            borderColor: { default: 'rgba(255,255,255,0.6)', _dark: 'rgba(168,213,174,0.12)' },
            boxShadow: 'glass',
          },
        },
        // Elevated — for modals, popovers
        elevated: {
          container: {
            bg: 'bg.card',
            boxShadow: 'xl',
          },
        },
      },
      defaultProps: { variant: 'outline' },
    },

    // ── Input / Select / Textarea ──────────────────────────────
    Input: {
      variants: {
        outline: {
          field: {
            bg: 'bg.glass',
            backdropFilter: 'blur(8px)',
            borderColor: 'border.default',
            borderRadius: 'lg',
            color: 'text.primary',
            fontFamily: 'body',
            _placeholder: { color: 'text.muted' },
            _hover: { borderColor: 'border.strong' },
            _focus: {
              borderColor: 'action.primary',
              boxShadow: '0 0 0 3px rgba(14, 107, 102, 0.18)',
            },
          },
        },
      },
      defaultProps: { variant: 'outline' },
    },

    // ── Badge ──────────────────────────────────────────────────
    Badge: {
      baseStyle: {
        fontFamily: 'body',
        fontWeight: 'medium',
        borderRadius: 'full',
        letterSpacing: '0.02em',
        textTransform: 'none',
        fontSize: 'xs',
        px: '10px',
        py: '3px',
      },
      variants: {
        solid: {},
        subtle: {},
        // Status variants
        success: {
          bg: { default: 'sage.100',   _dark: 'rgba(127, 178, 133, 0.2)' },
          color: { default: 'sage.600',   _dark: 'sage.300' },
        },
        warning: {
          bg: { default: 'amber.100',  _dark: 'rgba(255, 179, 71, 0.2)' },
          color: { default: 'amber.600',  _dark: 'amber.300' },
        },
        error: {
          bg: { default: 'coral.100',  _dark: 'rgba(255, 107, 107, 0.2)' },
          color: { default: 'coral.600',  _dark: 'coral.300' },
        },
        info: {
          bg: { default: 'brand.100',  _dark: 'rgba(14, 107, 102, 0.25)' },
          color: { default: 'brand.600',  _dark: 'brand.300' },
        },
      },
    },

    // ── Progress ───────────────────────────────────────────────
    Progress: {
      baseStyle: {
        track: {
          bg: 'bg.overlay',
          borderRadius: 'full',
        },
        filledTrack: {
          // teal → sage → amber gradient from the loading screen
          bgGradient: 'linear(to-r, brand.500, sage.400, amber.300)',
          borderRadius: 'full',
        },
      },
    },

    // ── Heading ────────────────────────────────────────────────
    Heading: {
      baseStyle: {
        fontFamily: 'heading',
        fontWeight: 'normal', // DM Serif Display looks best at 400
        color: 'text.primary',
        letterSpacing: '-0.02em',
        lineHeight: '1.1',
      },
    },

    // ── Text ───────────────────────────────────────────────────
    Text: {
      baseStyle: {
        fontFamily: 'body',
        color: 'text.primary',
        lineHeight: '1.65',
      },
      variants: {
        muted: { color: 'text.muted', fontWeight: 'light' },
        caption: { color: 'text.muted', fontSize: 'xs', letterSpacing: '0.05em' },
        overline: {
          color: 'text.muted',
          fontSize: 'xs',
          fontWeight: 'semibold',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
        },
      },
    },

    // ── Divider ────────────────────────────────────────────────
    Divider: {
      baseStyle: {
        borderColor: 'border.subtle',
        opacity: 1,
      },
    },

    // ── Modal ──────────────────────────────────────────────────
    Modal: {
      baseStyle: {
        overlay: {
          bg: { default: 'rgba(10, 77, 74, 0.35)', _dark: 'rgba(0, 0, 0, 0.6)' },
          backdropFilter: 'blur(4px)',
        },
        dialog: {
          bg: 'bg.card',
          backdropFilter: 'blur(20px)',
          border: '1px solid',
          borderColor: 'border.subtle',
          boxShadow: 'xl',
          borderRadius: 'xl',
        },
        header: {
          fontFamily: 'heading',
          fontWeight: 'normal',
          fontSize: '2xl',
          color: 'text.primary',
        },
      },
    },

    // ── Tooltip ────────────────────────────────────────────────
    Tooltip: {
      baseStyle: {
        fontFamily: 'body',
        fontSize: 'xs',
        fontWeight: 'medium',
        borderRadius: 'md',
        bg: { default: 'brand.700', _dark: 'bg.card' },
        color: { default: 'white', _dark: 'text.primary' },
        border: '1px solid',
        borderColor: 'border.subtle',
        px: '10px',
        py: '5px',
      },
    },

    // ── Tabs ───────────────────────────────────────────────────
    Tabs: {
      variants: {
        // Pill tabs
        soft: {
          tablist: {
            bg: 'bg.overlay',
            borderRadius: 'full',
            p: '4px',
            gap: '2px',
          },
          tab: {
            borderRadius: 'full',
            fontFamily: 'body',
            fontWeight: 'medium',
            fontSize: 'sm',
            color: 'text.muted',
            px: '16px',
            py: '6px',
            transition: 'all 0.2s ease',
            _selected: {
              bg: 'bg.card',
              color: 'text.primary',
              boxShadow: 'sm',
            },
            _hover: { color: 'text.secondary' },
          },
          tabpanel: { px: 0, pt: '16px' },
        },
      },
    },
  },
})

export default theme
