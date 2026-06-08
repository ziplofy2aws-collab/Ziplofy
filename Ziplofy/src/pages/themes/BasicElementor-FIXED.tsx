// COMPLETE REWRITE OF INJECTION FUNCTION - SIMPLIFIED AND FIXED
// This is a standalone version to test

const injectSelectionHandlerFixed = (doc: Document, win: Window, iframe: HTMLIFrameElement) => {
  console.log('🚀 Starting FIXED injection...');
  
  // Helper to convert RGB to hex
  const rgbToHex = (rgb: string): string => {
    if (!rgb || rgb === 'transparent' || rgb === 'rgba(0, 0, 0, 0)') return '';
    if (rgb.startsWith('#')) return rgb;
    const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      const r = parseInt(match[1]).toString(16).padStart(2, '0');
      const g = parseInt(match[2]).toString(16).padStart(2, '0');
      const b = parseInt(match[3]).toString(16).padStart(2, '0');
      return `#${r}${g}${b}`;
    }
    return rgb;
  };
  
  // Inject CSS
  const style = doc.createElement('style');
  style.id = 'ziplofy-style';
  style.textContent = `
    .ziplofy-section-highlight {
      outline: 3px solid #008060 !important;
      outline-offset: -3px !important;
      position: relative !important;
      box-shadow: 0 0 0 3px rgba(0, 128, 96, 0.3) !important;
      animation: ziplofy-pulse 2s ease-in-out infinite !important;
    }
    @keyframes ziplofy-pulse {
      0%, 100% { box-shadow: 0 0 0 3px rgba(0, 128, 96, 0.3); }
      50% { box-shadow: 0 0 0 3px rgba(0, 128, 96, 0.6); }
    }
    .ziplofy-section-highlight::after {
      content: attr(data-section-name);
      position: absolute;
      top: -35px;
      left: 0;
      background: #008060;
      color: white;
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 600;
      border-radius: 4px;
      z-index: 10000;
      pointer-events: none;
    }
    body.ziplofy-edit-mode * {
      cursor: pointer !important;
    }
    body.ziplofy-edit-mode *:hover {
      outline: 2px dashed rgba(0, 128, 96, 0.5) !important;
    }
  `;
  doc.head.appendChild(style);
  doc.body.classList.add('ziplofy-edit-mode');
  
  // Select element function
  const selectElement = (element: HTMLElement) => {
    // Remove old highlights
    doc.querySelectorAll('.ziplofy-section-highlight').forEach(el => {
      el.classList.remove('ziplofy-section-highlight');
    });
    
    // Highlight new element
    element.classList.add('ziplofy-section-highlight');
    element.setAttribute('data-section-name', 'Selected Element');
    (win as any).ziplofySelectedElement = element;
    
    // Get styles
    const computed = win.getComputedStyle(element);
    const inline = element.style;
    const getVal = (prop: string) => {
      const inlineVal = inline.getPropertyValue(prop);
      if (inlineVal && inlineVal.trim()) return inlineVal.trim();
      const computedVal = computed.getPropertyValue(prop);
      if (computedVal && computedVal !== 'none' && computedVal !== '0px') return computedVal.trim();
      return '';
    };
    
    const styles = {
      backgroundColor: getVal('background-color') || rgbToHex(computed.backgroundColor) || '',
      color: getVal('color') || rgbToHex(computed.color) || '',
      fontSize: getVal('font-size') || computed.fontSize || '',
      fontWeight: getVal('font-weight') || computed.fontWeight || '',
      fontFamily: getVal('font-family') || computed.fontFamily.split(',')[0].replace(/['"]/g, '').trim() || '',
      padding: getVal('padding') || computed.padding || '',
      margin: getVal('margin') || computed.margin || '',
      width: getVal('width') || computed.width || '',
      height: getVal('height') || computed.height || '',
      border: getVal('border') || computed.border || '',
      borderRadius: getVal('border-radius') || computed.borderRadius || '',
      textAlign: getVal('text-align') || computed.textAlign || '',
      display: getVal('display') || computed.display || '',
    };
    
    // Send message
    const message = {
      type: 'element-selected',
      styles,
      elementTag: element.tagName,
      elementClasses: element.className,
      elementId: element.id,
      sectionName: 'Selected Element'
    };
    
    try {
      if (win.parent && win.parent !== win) {
        win.parent.postMessage(message, '*');
        console.log('✅ Message sent');
      }
    } catch (e) {
      console.error('Message error:', e);
    }
    
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return { element, styles };
  };
  
  // Click handler - SIMPLE AND DIRECT
  const handleClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    
    if (!target || target === doc.body || target === doc.documentElement) return;
    if (target.closest('.ziplofy-section-highlight')) return;
    
    const tag = target.tagName.toLowerCase();
    if (['script', 'style', 'meta', 'link', 'title', 'head'].includes(tag)) return;
    
    // STOP EVERYTHING
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    
    console.log('🖱️ CLICK:', target.tagName, target.className);
    
    try {
      selectElement(target);
    } catch (err) {
      console.error('Select error:', err);
    }
    
    return false;
  };
  
  // Attach handler - CAPTURE PHASE IS CRITICAL
  doc.addEventListener('click', handleClick, { capture: true, passive: false });
  win.addEventListener('click', handleClick, { capture: true, passive: false });
  if (doc.body) {
    doc.body.addEventListener('click', handleClick, { capture: true, passive: false });
  }
  
  // Disable navigation
  doc.querySelectorAll('a[href]').forEach((link: any) => {
    if (link.href && !link.href.startsWith('#')) {
      link._origHref = link.href;
      link.href = 'javascript:void(0)';
    }
  });
  
  console.log('✅ FIXED handler attached - clicks should work now!');
  
  // Expose function
  (win as any).ziplofySelectElement = selectElement;
};
