// Navigation fix utility for Polyclinic HMS system
// This utility helps identify and fix navigation issues

export const navigationFix = {
  // Check for common navigation issues
  checkNavigationIssues() {
    console.log('🔍 Checking for navigation issues...');
    
    const issues = [];
    
    // Check for JavaScript errors
    if (window.navigationErrors && window.navigationErrors.length > 0) {
      issues.push('JavaScript errors detected: ' + window.navigationErrors.length);
    }
    
    // Check for React Router context
    if (!window.ReactRouterDOM) {
      issues.push('React Router DOM not found');
    }
    
    // Check for navigation elements
    const navElements = document.querySelectorAll('a[href], [role="menuitem"], .MuiListItemButton-root');
    if (navElements.length === 0) {
      issues.push('No navigation elements found');
    }
    
    // Check for event listeners that might interfere
    const clickElements = document.querySelectorAll('[onclick]');
    if (clickElements.length > 0) {
      issues.push('Found ' + clickElements.length + ' elements with onclick handlers');
    }
    
    return issues;
  },
  
  // Fix common navigation issues
  fixNavigationIssues() {
    console.log('🔧 Fixing navigation issues...');
    
    // Ensure all navigation links work properly
    const navigationElements = document.querySelectorAll('a[href], [role="menuitem"], .MuiListItemButton-root');
    
    navigationElements.forEach((element) => {
      // Remove any problematic event handlers
      if (element.onclick && element.onclick.toString().includes('preventDefault')) {
        console.log('⚠️ Removing problematic onclick handler from:', element);
        element.onclick = null;
      }
      
      // Ensure href attributes are properly set
      if (element.href && element.href.includes('javascript:')) {
        console.log('⚠️ Found javascript: href, removing:', element);
        element.removeAttribute('href');
      }
    });
    
    // Fix any broken navigation
    this.ensureNavigationWorks();
  },
  
  // Ensure navigation works properly
  ensureNavigationWorks() {
    console.log('✅ Ensuring navigation works...');
    
    // Add proper click handlers to navigation elements
    const navigationElements = document.querySelectorAll('[role="menuitem"], .MuiListItemButton-root');
    
    navigationElements.forEach((element) => {
      if (!element.onclick) {
        element.addEventListener('click', (event) => {
          console.log('🖱️ Navigation click detected:', element);
          
          // Check if this is a navigation element
          const href = element.getAttribute('href') || element.getAttribute('to');
          if (href) {
            console.log('🔄 Navigating to:', href);
            
            // Use React Router navigation if available
            if (window.navigate) {
              window.navigate(href);
            } else {
              // Fallback to window.location
              window.location.href = href;
            }
          }
        });
      }
    });
  },
  
  // Monitor navigation and report issues
  monitorNavigation() {
    console.log('👀 Monitoring navigation...');
    
    let navigationAttempts = 0;
    let successfulNavigations = 0;
    
    // Monitor navigation attempts
    const originalPushState = history.pushState;
    history.pushState = function(state, title, url) {
      navigationAttempts++;
      console.log('🔄 Navigation attempt #' + navigationAttempts + ' to:', url);
      return originalPushState.call(this, state, title, url);
    };
    
    // Monitor successful navigations
    window.addEventListener('popstate', () => {
      successfulNavigations++;
      console.log('✅ Navigation successful #' + successfulNavigations);
    });
    
    // Report after 10 seconds
    setTimeout(() => {
      console.log('📊 Navigation report:');
      console.log('  - Attempts: ' + navigationAttempts);
      console.log('  - Successful: ' + successfulNavigations);
      
      if (navigationAttempts > 0 && successfulNavigations === 0) {
        console.log('⚠️ Navigation attempts detected but no successful navigation');
      }
    }, 10000);
  },
  
  // Run all fixes
  runAllFixes() {
    console.log('🚀 Running all navigation fixes...');
    
    const issues = this.checkNavigationIssues();
    if (issues.length > 0) {
      console.log('⚠️ Issues found:', issues);
      this.fixNavigationIssues();
    } else {
      console.log('✅ No issues found');
    }
    
    this.ensureNavigationWorks();
    this.monitorNavigation();
  }
};

// Auto-run fixes when imported - DISABLED to prevent interference with React Router
// The navigationFix should only be called explicitly when needed
// if (typeof window !== 'undefined') {
//   // Run fixes after DOM is ready
//   if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', () => {
//       navigationFix.runAllFixes();
//     });
//   } else {
//     navigationFix.runAllFixes();
//   }
// }

export default navigationFix;
