// @ts-nocheck

import * as React from 'react';
import HomePage from './pages/index';

const modules = import.meta.glob('./pages/*/index.tsx', { eager: true });

const pages = Object.keys(modules)
  .map((path) => path.match(/^\.\/pages\/(.+)\/index\.tsx$/)?.[1])
  .filter((page) => page != null)
  .sort();

function getPageFromHash() {
  return window.location.hash.replace(/^#\/?/, '').replace(/\/$/, '');
}

export default function App() {
  const [page, setPage] = React.useState(getPageFromHash);

  React.useEffect(() => {
    const onHashChange = () => setPage(getPageFromHash());
    window.addEventListener('hashchange', onHashChange);

    return () => {
      window.removeEventListener('hashchange', onHashChange);
    };
  }, []);

  const module = modules[`./pages/${page}/index.tsx`];
  const Page = module && module.default;

  if (!Page) {
    return <HomePage pages={pages} />;
  }

  return <Page />;
}
