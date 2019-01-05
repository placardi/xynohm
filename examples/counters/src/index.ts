import './styles/main.css';

import { App } from '@placardi/xynohm';

import { components } from './config/components';
import { configuration } from './config/configuration';
import { routes } from './config/routes';

const app: App = new App(components, configuration, routes);

app.run();
