import { Guard } from '@placardi/xynohm';

export class LanguageGuard extends Guard {
  public check(): Promise<object> {
    return Promise.resolve({
      language: {
        code: 'en',
        name: 'English'
      }
    });
  }
}
