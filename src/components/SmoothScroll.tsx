import React, { createContext, useContext, useCallback, forwardRef, ComponentPropsWithoutRef } from 'react';
import { ReactLenis, useLenis, LenisRef } from 'lenis/react';
import type Lenis from 'lenis';

export interface SmoothScrollOptions {
  lerp?: number;
  duration?: number;
  smoothWheel?: boolean;
  wheelMultiplier?: number;
  touchMultiplier?: number;
  infinite?: boolean;
  orientation?: 'vertical' | 'horizontal';
  gestureOrientation?: 'vertical' | 'horizontal' | 'both';
}

interface SmoothScrollContextType {
  lenis: Lenis | undefined;
  scrollTo: (
    target: string | number | HTMLElement,
    options?: {
      offset?: number;
      duration?: number;
      immediate?: boolean;
      lock?: boolean;
      easing?: (t: number) => number;
    }
  ) => void;
  scrollToTop: (options?: { duration?: number; immediate?: boolean }) => void;
  scrollToSection: (sectionId: string, options?: { offset?: number; duration?: number }) => void;
}

const SmoothScrollContext = createContext<SmoothScrollContextType | null>(null);

interface SmoothScrollProviderProps {
  children: React.ReactNode;
  options?: SmoothScrollOptions;
}

/**
 * Root Lenis Smooth Scroll Provider for high-performance physics-based scrolling
 */
export const SmoothScrollProvider: React.FC<SmoothScrollProviderProps> = ({
  children,
  options = {},
}) => {
  const mergedOptions = {
    lerp: 0.09,
    duration: 1.2,
    smoothWheel: true,
    wheelMultiplier: 1.0,
    touchMultiplier: 1.8,
    infinite: false,
    ...options,
  };

  return (
    <ReactLenis root options={mergedOptions}>
      <SmoothScrollInternalConsumer>{children}</SmoothScrollInternalConsumer>
    </ReactLenis>
  );
};

const SmoothScrollInternalConsumer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const lenis = useLenis();

  const scrollTo = useCallback(
    (
      target: string | number | HTMLElement,
      options?: {
        offset?: number;
        duration?: number;
        immediate?: boolean;
        lock?: boolean;
        easing?: (t: number) => number;
      }
    ) => {
      if (lenis) {
        lenis.scrollTo(target, options);
      } else {
        if (typeof target === 'string') {
          const el = document.querySelector(target);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        } else if (typeof target === 'number') {
          window.scrollTo({ top: target, behavior: 'smooth' });
        } else if (target instanceof HTMLElement) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    },
    [lenis]
  );

  const scrollToTop = useCallback(
    (options?: { duration?: number; immediate?: boolean }) => {
      scrollTo(0, options);
    },
    [scrollTo]
  );

  const scrollToSection = useCallback(
    (sectionId: string, options?: { offset?: number; duration?: number }) => {
      const target = sectionId.startsWith('#') ? sectionId : `#${sectionId}`;
      scrollTo(target, { offset: -70, duration: 1.2, ...options });
    },
    [scrollTo]
  );

  return (
    <SmoothScrollContext.Provider
      value={{
        lenis,
        scrollTo,
        scrollToTop,
        scrollToSection,
      }}
    >
      {children}
    </SmoothScrollContext.Provider>
  );
};

/**
 * Custom hook to control Lenis smooth scroll within any frontend component
 */
export function useSmoothScroll() {
  const context = useContext(SmoothScrollContext);
  const directLenis = useLenis();

  const fallbackScrollTo = useCallback(
    (
      target: string | number | HTMLElement,
      options?: {
        offset?: number;
        duration?: number;
        immediate?: boolean;
        lock?: boolean;
        easing?: (t: number) => number;
      }
    ) => {
      const activeLenis = context?.lenis || directLenis;
      if (activeLenis) {
        activeLenis.scrollTo(target, options);
      } else if (typeof target === 'string') {
        const el = document.querySelector(target);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else if (typeof target === 'number') {
        window.scrollTo({ top: target, behavior: 'smooth' });
      } else if (target instanceof HTMLElement) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    },
    [context?.lenis, directLenis]
  );

  const fallbackScrollToTop = useCallback(
    (options?: { duration?: number; immediate?: boolean }) => {
      fallbackScrollTo(0, options);
    },
    [fallbackScrollTo]
  );

  const fallbackScrollToSection = useCallback(
    (sectionId: string, options?: { offset?: number; duration?: number }) => {
      const target = sectionId.startsWith('#') ? sectionId : `#${sectionId}`;
      fallbackScrollTo(target, { offset: -70, duration: 1.2, ...options });
    },
    [fallbackScrollTo]
  );

  if (context) {
    return context;
  }

  return {
    lenis: directLenis,
    scrollTo: fallbackScrollTo,
    scrollToTop: fallbackScrollToTop,
    scrollToSection: fallbackScrollToSection,
  };
}

/**
 * Component-level Lenis smooth scroll wrapper for isolated scrolling containers
 */
export const SmoothScrollContainer = forwardRef<
  LenisRef,
  ComponentPropsWithoutRef<typeof ReactLenis>
>(({ children, options, className, ...props }, ref) => {
  return (
    <ReactLenis
      ref={ref}
      root={false}
      options={{
        lerp: 0.1,
        duration: 1.2,
        smoothWheel: true,
        ...options,
      }}
      className={className}
      {...props}
    >
      {children}
    </ReactLenis>
  );
});

SmoothScrollContainer.displayName = 'SmoothScrollContainer';

export { ReactLenis, useLenis };
export default SmoothScrollProvider;
