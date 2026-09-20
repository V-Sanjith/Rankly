const fs = require('fs');
const path = require('path');

const generateComponent = (name, type = 'page') => {
  return `import React from 'react';

const ${name} = () => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">${name}</h1>
      <p className="text-text-muted">This is a placeholder for ${name}.</p>
    </div>
  );
};

export default ${name};
`;
};

const filesToCreate = [
  // Public
  ['src/pages/public/ProjectPage.tsx', 'ProjectPage'],
  ['src/pages/public/CategoriesPage.tsx', 'CategoriesPage'],
  ['src/pages/public/AboutPage.tsx', 'AboutPage'],
  ['src/pages/public/PricingPage.tsx', 'PricingPage'],
  // Dashboard
  ['src/pages/dashboard/DashboardOverview.tsx', 'DashboardOverview'],
  ['src/pages/dashboard/MyProjects.tsx', 'MyProjects'],
  ['src/pages/dashboard/SubmitProject.tsx', 'SubmitProject'],
  ['src/pages/dashboard/BidHistory.tsx', 'BidHistory'],
  ['src/pages/dashboard/Analytics.tsx', 'Analytics'],
  ['src/pages/dashboard/Settings.tsx', 'Settings'],
  // Admin
  ['src/pages/admin/AdminDashboard.tsx', 'AdminDashboard'],
  ['src/pages/admin/AdminProjects.tsx', 'AdminProjects'],
  ['src/pages/admin/AdminUsers.tsx', 'AdminUsers'],
  ['src/pages/admin/AdminBids.tsx', 'AdminBids'],
  ['src/pages/admin/AdminPayments.tsx', 'AdminPayments'],
  ['src/pages/admin/AdminReports.tsx', 'AdminReports'],
];

const basePath = 'd:/Rankly/client';

filesToCreate.forEach(([relPath, componentName]) => {
  const fullPath = path.join(basePath, relPath);
  const dir = path.dirname(fullPath);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  if (!fs.existsSync(fullPath)) {
    fs.writeFileSync(fullPath, generateComponent(componentName));
    console.log(`Created ${fullPath}`);
  }
});
