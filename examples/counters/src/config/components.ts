import { ComponentDefinition } from '@placardi/xynohm';
import { ButtonComponent } from '../components/button/button.component';
import { CounterColourComponent } from '../components/counter-colour/counter-colour.component';
import { CounterValueComponent } from '../components/counter-value/counter-value.component';
import { CounterComponent } from '../components/counter/counter.component';
import { CountersControlPanelComponent } from '../components/counters-control-panel/counters-control-panel.component';
import { CountersComponent } from '../components/counters/counters.component';

export const components: ComponentDefinition[] = [
  CountersComponent,
  CounterComponent,
  CounterValueComponent,
  CounterColourComponent,
  ButtonComponent,
  CountersControlPanelComponent
];
