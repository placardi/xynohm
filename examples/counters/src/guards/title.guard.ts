import { Guard } from '@placardi/xynohm';

export class TitleGuard extends Guard {
  public check(): Promise<object> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          title: 'Counters'
        });
      }, 500);
    });
  }
}
