"use client"

import { useEffect, useState, useCallback } from 'react'

interface PerformanceMetrics {
  // Core Web Vitals
  lcp?: number // Largest Contentful Paint
  fid?: number // First Input Delay
  cls?: number // Cumulative Layout Shift
  fcp?: number // First Contentful Paint
  ttfb?: number // Time to First Byte
  
  // Custom metrics
  pageLoadTime?: number
  domContentLoaded?: number
  resourceLoadTime?: number
  
  // Memory usage (if available)
  usedJSHeapSize?: number
  totalJSHeapSize?: number
  jsHeapSizeLimit?: number
}

interface PerformanceData {
  metrics: PerformanceMetrics
  isLoading: boolean
  error: string | null
}

export function usePerformanceMonitoring(): PerformanceData {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const measureWebVitals = useCallback(() => {
    try {
      // Measure Core Web Vitals using Performance Observer API
      if ('PerformanceObserver' in window) {
        // Largest Contentful Paint (LCP)
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1] as PerformanceEntry & { startTime: number }
          if (lastEntry) {
            setMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }))
          }
        })
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

        // First Input Delay (FID)
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry) => {
            const fidEntry = entry as PerformanceEntry & { processingStart?: number; startTime: number }
            if (fidEntry.processingStart) {
              setMetrics(prev => ({ ...prev, fid: fidEntry.processingStart! - fidEntry.startTime }))
            }
          })
        })
        fidObserver.observe({ entryTypes: ['first-input'] })

        // Cumulative Layout Shift (CLS)
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0
          const entries = list.getEntries()
          entries.forEach((entry) => {
            const clsEntry = entry as PerformanceEntry & { value?: number; hadRecentInput?: boolean }
            if (clsEntry.value && !clsEntry.hadRecentInput) {
              clsValue += clsEntry.value
            }
          })
          setMetrics(prev => ({ ...prev, cls: clsValue }))
        })
        clsObserver.observe({ entryTypes: ['layout-shift'] })

        // First Contentful Paint (FCP)
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry: PerformanceEntry & { name: string; startTime: number }) => {
            if (entry.name === 'first-contentful-paint') {
              setMetrics(prev => ({ ...prev, fcp: entry.startTime }))
            }
          })
        })
        fcpObserver.observe({ entryTypes: ['paint'] })
      }

      // Navigation Timing API for basic metrics
      if ('performance' in window && 'timing' in performance) {
        const timing = performance.timing
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        
        if (navigation) {
          setMetrics(prev => ({
            ...prev,
            pageLoadTime: navigation.loadEventEnd - navigation.fetchStart,
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
            ttfb: navigation.responseStart - navigation.requestStart,
            resourceLoadTime: navigation.loadEventEnd - navigation.domContentLoadedEventEnd
          }))
        } else {
          // Fallback to legacy timing API
          setMetrics(prev => ({
            ...prev,
            pageLoadTime: timing.loadEventEnd - timing.navigationStart,
            domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
            ttfb: timing.responseStart - timing.requestStart,
            resourceLoadTime: timing.loadEventEnd - timing.domContentLoadedEventEnd
          }))
        }
      }

      // Memory usage (Chrome only)
      if ('memory' in performance) {
        const memory = (performance as unknown as { memory: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory
        setMetrics(prev => ({
          ...prev,
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit
        }))
      }

      setIsLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error measuring performance')
      setIsLoading(false)
    }
  }, [])

  const logPerformanceMetrics = useCallback(() => {
    if (process.env.NODE_ENV === 'development') {
      console.group('🚀 Performance Metrics')
      console.log('Core Web Vitals:')
      console.log(`  LCP: ${metrics.lcp?.toFixed(2)}ms`)
      console.log(`  FID: ${metrics.fid?.toFixed(2)}ms`)
      console.log(`  CLS: ${metrics.cls?.toFixed(4)}`)
      console.log(`  FCP: ${metrics.fcp?.toFixed(2)}ms`)
      console.log(`  TTFB: ${metrics.ttfb?.toFixed(2)}ms`)
      console.log('Page Load Metrics:')
      console.log(`  Page Load Time: ${metrics.pageLoadTime?.toFixed(2)}ms`)
      console.log(`  DOM Content Loaded: ${metrics.domContentLoaded?.toFixed(2)}ms`)
      console.log(`  Resource Load Time: ${metrics.resourceLoadTime?.toFixed(2)}ms`)
      if (metrics.usedJSHeapSize) {
        console.log('Memory Usage:')
        console.log(`  Used JS Heap: ${(metrics.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`)
        console.log(`  Total JS Heap: ${(metrics.totalJSHeapSize! / 1024 / 1024).toFixed(2)}MB`)
      }
      console.groupEnd()
    }
  }, [metrics])

  useEffect(() => {
    // Wait for page to be fully loaded before measuring
    if (document.readyState === 'complete') {
      measureWebVitals()
    } else {
      window.addEventListener('load', measureWebVitals)
      return () => window.removeEventListener('load', measureWebVitals)
    }
  }, [measureWebVitals])

  useEffect(() => {
    if (!isLoading && Object.keys(metrics).length > 0) {
      logPerformanceMetrics()
    }
  }, [metrics, isLoading, logPerformanceMetrics])

  return {
    metrics,
    isLoading,
    error
  }
}

// Helper function to get performance grade based on Core Web Vitals
export function getPerformanceGrade(metrics: PerformanceMetrics): {
  lcp: 'good' | 'needs-improvement' | 'poor'
  fid: 'good' | 'needs-improvement' | 'poor'
  cls: 'good' | 'needs-improvement' | 'poor'
  overall: 'good' | 'needs-improvement' | 'poor'
} {
  const lcpGrade = !metrics.lcp ? 'good' : 
    metrics.lcp <= 2500 ? 'good' : 
    metrics.lcp <= 4000 ? 'needs-improvement' : 'poor'

  const fidGrade = !metrics.fid ? 'good' : 
    metrics.fid <= 100 ? 'good' : 
    metrics.fid <= 300 ? 'needs-improvement' : 'poor'

  const clsGrade = !metrics.cls ? 'good' : 
    metrics.cls <= 0.1 ? 'good' : 
    metrics.cls <= 0.25 ? 'needs-improvement' : 'poor'

  const grades = [lcpGrade, fidGrade, clsGrade]
  const overall = grades.includes('poor') ? 'poor' : 
    grades.includes('needs-improvement') ? 'needs-improvement' : 'good'

  return { lcp: lcpGrade, fid: fidGrade, cls: clsGrade, overall }
}