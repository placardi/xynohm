import './styles/main.css';

import { App } from '@placardi/xynohm';

import { components } from './config/components';
import { configuration } from './config/configuration';
import { guards } from './config/guards';
import { routes } from './config/routes';

const app: App = new App(components, configuration, routes, guards);

app.run().ready(() => {
  const loader: Element = document.getElementsByTagName('app-loader')[0];
  if (loader) {
    loader.classList.add('hidden');
  }
});
