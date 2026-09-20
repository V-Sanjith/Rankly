const fs = require('fs');
const path = require('path');

const generateService = (name) => {
  return `import { fetchApi } from './api';

export const ${name}Service = {
  getAll: () => fetchApi('/${name.toLowerCase()}s'),
  getById: (id) => fetchApi('/${name.toLowerCase()}s/' + id),
  create: (data) => fetchApi('/${name.toLowerCase()}s', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => fetchApi('/${name.toLowerCase()}s/' + id, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => fetchApi('/${name.toLowerCase()}s/' + id, { method: 'DELETE' }),
};
`;
};

const servicesToCreate = [
  'project', 'bid', 'leaderboard', 'analytics', 'admin', 'auth'
];

const basePath = 'd:/Rankly/client/src/services';

servicesToCreate.forEach((name) => {
  const fullPath = path.join(basePath, name + '.service.ts');
  if (!fs.existsSync(fullPath)) {
    fs.writeFileSync(fullPath, generateService(name));
    console.log('Created ' + fullPath);
  }
});

// Write missing ui/project components
const generateComponent = (name) => {
  return `import React from 'react';

export const ${name} = () => {
  return <div>${name} Component</div>;
};
`;
}
const projectComponents = ['ProjectCard', 'BidModal', 'ProjectForm'];
projectComponents.forEach((name) => {
  const fullPath = path.join('d:/Rankly/client/src/components/project', name + '.tsx');
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(fullPath, generateComponent(name));
});

const missingUi = ['Spinner', 'EmptyState', 'Pagination', 'Stat', 'Toast', 'Dropdown', 'Avatar'];
missingUi.forEach((name) => {
  const fullPath = path.join('d:/Rankly/client/src/components/ui', name + '.tsx');
  fs.writeFileSync(fullPath, generateComponent(name));
});
