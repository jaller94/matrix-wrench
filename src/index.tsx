import { createRoot } from 'react-dom/client';
import React from 'react';
import { App } from './app';
const rootDiv = document.getElementById('app');
if (!rootDiv) {
    throw Error('#app not found');
}
const root = createRoot(rootDiv);
root.render(<App />);
