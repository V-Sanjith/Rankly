const fs = require('fs');
const files = [
  'src/components/layout/AdminLayout.tsx',
  'src/components/layout/DashboardLayout.tsx',
  'src/components/layout/Footer.tsx',
  'src/components/project/BidModal.tsx',
  'src/components/project/ProjectCard.tsx',
  'src/components/ui/Avatar.tsx',
  'src/components/ui/CustomCursor.tsx',
  'src/components/ui/Dropdown.tsx',
  'src/components/ui/Pagination.tsx',
  'src/components/ui/Spinner.tsx',
  'src/components/ui/Toast.tsx',
  'src/pages/admin/AdminBids.tsx',
  'src/pages/admin/AdminDashboard.tsx',
  'src/pages/admin/AdminPayments.tsx',
  'src/pages/admin/AdminProjects.tsx',
  'src/pages/admin/AdminReports.tsx',
  'src/pages/admin/AdminUsers.tsx',
  'src/pages/dashboard/Analytics.tsx',
  'src/pages/dashboard/BidHistory.tsx',
  'src/pages/dashboard/DashboardOverview.tsx',
  'src/pages/dashboard/MyProjects.tsx',
  'src/pages/dashboard/SubmitProject.tsx',
  'src/pages/public/AboutPage.tsx',
  'src/pages/public/CategoriesPage.tsx',
  'src/pages/public/ExplorePage.tsx',
  'src/pages/public/HomePage.tsx',
  'src/pages/public/LeaderboardPage.tsx',
  'src/pages/public/PricingPage.tsx',
  'src/pages/public/ProjectPage.tsx',
  'src/components/ui/Button.tsx',
  'src/App.tsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace React.xxx usages with direct imports
  const usesState = /React\.useState/.test(content);
  const usesEffect = /React\.useEffect/.test(content);
  const usesRef = /React\.useRef/.test(content);
  const usesCallback = /React\.useCallback/.test(content);
  const usesMemo = /React\.useMemo/.test(content);
  const usesForwardRef = /React\.forwardRef/.test(content);
  const usesReactNode = /React\.ReactNode/.test(content);
  const usesFC = /React\.FC/.test(content);

  let imports = [];
  if (usesState) imports.push('useState');
  if (usesEffect) imports.push('useEffect');
  if (usesRef) imports.push('useRef');
  if (usesCallback) imports.push('useCallback');
  if (usesMemo) imports.push('useMemo');
  if (usesForwardRef) imports.push('forwardRef');
  
  let typeImports = [];
  if (usesReactNode) typeImports.push('ReactNode');
  if (usesFC) typeImports.push('FC');

  if (imports.length > 0 || typeImports.length > 0) {
    let importStr = '';
    if (imports.length > 0) importStr += `import { ${imports.join(', ')} } from 'react';\n`;
    if (typeImports.length > 0) importStr += `import type { ${typeImports.join(', ')} } from 'react';\n`;
    
    // add it after the first line if there's no react import, or we can just append at the top
    content = importStr + content;
  }

  // Remove React. prefix
  content = content.replace(/React\.useState/g, 'useState');
  content = content.replace(/React\.useEffect/g, 'useEffect');
  content = content.replace(/React\.useRef/g, 'useRef');
  content = content.replace(/React\.useCallback/g, 'useCallback');
  content = content.replace(/React\.useMemo/g, 'useMemo');
  content = content.replace(/React\.forwardRef/g, 'forwardRef');
  content = content.replace(/React\.ReactNode/g, 'ReactNode');
  content = content.replace(/React\.FC/g, 'FC');

  // Also replace `import React, { ReactNode } from 'react';` or similar to just `import { ReactNode }` etc if we aren't using React.
  // Actually, wait, it's easier to just match `import React from 'react';` and remove it.
  content = content.replace(/^import React(,?.*?)? from ['"]react['"];?\r?\n/m, (match, p1) => {
    if (p1 && p1.trim() !== '') {
      let rest = p1.replace(/^,\s*/, '').trim();
      if (rest.startsWith('{') && rest.endsWith('}')) {
          // Check for ReactNode
          if (rest.includes('ReactNode') && !rest.includes('useState')) {
             if (rest === '{ ReactNode }') return `import type { ReactNode } from 'react';\n`;
             return `import { ${rest.replace('{', '').replace('}', '').replace('ReactNode', '').replace(/,\s*,/g, ',').trim()} } from 'react';\nimport type { ReactNode } from 'react';\n`;
          }
          return `import ${rest} from 'react';\n`;
      }
      return `import ${rest} from 'react';\n`;
    }
    return '';
  });

  fs.writeFileSync(file, content, 'utf8');
}
