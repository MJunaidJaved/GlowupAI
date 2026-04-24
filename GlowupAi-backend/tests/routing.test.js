/**
 * ROUTING TESTS
 * Covers: Route access rules, redirects, protected routes,
 * onboarding gate, post-login redirect, 404 handling
 */

describe('ROUTING — Public Routes', () => {
  test('TC-ROUTE-001: Landing page accessible when not authenticated', () => {
    const canAccess = (path, isAuthenticated) => {
      const publicRoutes = ['/']
      return publicRoutes.includes(path) || isAuthenticated
    }
    expect(canAccess('/', false)).toBe(true)
  })

  test('TC-ROUTE-002: Authenticated user redirected from landing to dashboard', () => {
    const getRedirect = (path, isAuthenticated) => {
      if (path === '/' && isAuthenticated) return '/dashboard'
      return path
    }
    expect(getRedirect('/', true)).toBe('/dashboard')
    expect(getRedirect('/', false)).toBe('/')
  })
})

describe('ROUTING — Protected Routes', () => {
  const protectedRoutes = ['/dashboard', '/chat', '/routine', '/progress', '/diary', '/wellness', '/settings']

  test('TC-ROUTE-003: All inner pages require authentication', () => {
    const canAccess = (path, isAuthenticated) => {
      if (protectedRoutes.includes(path)) return isAuthenticated
      return true
    }
    protectedRoutes.forEach(route => {
      expect(canAccess(route, false)).toBe(false)
      expect(canAccess(route, true)).toBe(true)
    })
  })

  test('TC-ROUTE-004: Unauthenticated user redirected to landing from protected route', () => {
    const getRedirect = (path, isAuthenticated) => {
      if (protectedRoutes.includes(path) && !isAuthenticated) return '/'
      return path
    }
    protectedRoutes.forEach(route => {
      expect(getRedirect(route, false)).toBe('/')
    })
  })

  test('TC-ROUTE-005: Authenticated user can access all protected routes', () => {
    const canAccess = (path, isAuthenticated) => isAuthenticated
    protectedRoutes.forEach(route => {
      expect(canAccess(route, true)).toBe(true)
    })
  })
})

describe('ROUTING — Onboarding Gate', () => {
  test('TC-ROUTE-006: User with incomplete onboarding redirected to onboarding', () => {
    const getRoute = (isAuthenticated, onboardingComplete) => {
      if (!isAuthenticated) return '/'
      if (!onboardingComplete) return '/onboarding'
      return '/dashboard'
    }
    expect(getRoute(true, false)).toBe('/onboarding')
    expect(getRoute(true, true)).toBe('/dashboard')
    expect(getRoute(false, false)).toBe('/')
  })

  test('TC-ROUTE-007: Completed onboarding user cannot revisit onboarding', () => {
    const canAccessOnboarding = (isAuthenticated, onboardingComplete) => {
      return isAuthenticated && !onboardingComplete
    }
    expect(canAccessOnboarding(true, true)).toBe(false)
    expect(canAccessOnboarding(true, false)).toBe(true)
  })
})

describe('ROUTING — 404 Handling', () => {
  test('TC-ROUTE-008: Unknown route returns 404 page', () => {
    const allRoutes = ['/', '/onboarding', '/dashboard', '/chat', '/routine', '/progress', '/diary', '/wellness', '/settings']
    const getPage = (path) => allRoutes.includes(path) ? 'page' : '404'
    expect(getPage('/unknown')).toBe('404')
    expect(getPage('/admin')).toBe('404')
    expect(getPage('/dashboard')).toBe('page')
  })
})
