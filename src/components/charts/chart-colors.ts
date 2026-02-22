/**
 * Resolved hex colors for Recharts SVG elements.
 * Recharts cannot consume CSS variables, so we resolve colors
 * based on the current theme at render time.
 */

export interface ChartColors {
  /** Line stroke colors per vital type */
  vitals: {
    systolic: string
    diastolic: string
    pulse: string
    spo2: string
  }
  /** Bar fill colors per parameter status */
  status: {
    normal: string
    borderline: string
    abnormal: string
  }
  /** Axis tick and label text */
  axisText: string
  /** Cartesian grid lines */
  gridLine: string
  /** Tooltip background */
  tooltipBg: string
  /** Tooltip border */
  tooltipBorder: string
  /** Tooltip text */
  tooltipText: string
  /** Reference area fill (translucent normal range) */
  referenceArea: string
  /** Reference line stroke (dashed min/max) */
  referenceLine: string
  /** Timeline vertical line */
  timelineLine: string
  /** Timeline dot */
  timelineDot: string
}

const lightColors: ChartColors = {
  vitals: {
    systolic: '#0E6B66',  // teal-mid (brand.500)
    diastolic: '#1A9E97', // teal-light (brand.400)
    pulse: '#7FB285',     // sage (sage.400)
    spo2: '#FFB347',      // amber (amber.300)
  },
  status: {
    normal: '#7FB285',    // sage.400
    borderline: '#FFB347', // amber.300
    abnormal: '#FF6B6B',  // coral.400
  },
  axisText: '#0E6B66',    // teal-mid
  gridLine: 'rgba(10, 77, 74, 0.08)',
  tooltipBg: 'rgba(255, 255, 255, 0.92)',
  tooltipBorder: 'rgba(10, 77, 74, 0.10)',
  tooltipText: '#0A4D4A', // teal-deep
  referenceArea: 'rgba(127, 178, 133, 0.10)',
  referenceLine: 'rgba(10, 77, 74, 0.25)',
  timelineLine: 'rgba(10, 77, 74, 0.15)',
  timelineDot: '#0E6B66',
}

const darkColors: ChartColors = {
  vitals: {
    systolic: '#4FB4B0',  // brand.300
    diastolic: '#1A9E97', // brand.400
    pulse: '#9DC5A1',     // sage.300
    spo2: '#FFB347',      // amber.300
  },
  status: {
    normal: '#9DC5A1',    // sage.300
    borderline: '#FFB347', // amber.300
    abnormal: '#FF8A8A',  // coral.300
  },
  axisText: '#A8D5AE',    // sage-light
  gridLine: 'rgba(168, 213, 174, 0.08)',
  tooltipBg: 'rgba(26, 53, 53, 0.92)',
  tooltipBorder: 'rgba(168, 213, 174, 0.10)',
  tooltipText: '#E8F5F0',
  referenceArea: 'rgba(157, 197, 161, 0.08)',
  referenceLine: 'rgba(168, 213, 174, 0.25)',
  timelineLine: 'rgba(168, 213, 174, 0.15)',
  timelineDot: '#1A9E97',
}

export function getChartColors(isDark: boolean): ChartColors {
  return isDark ? darkColors : lightColors
}
