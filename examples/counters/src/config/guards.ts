import { GuardDefinition } from '@placardi/xynohm';
import { LanguageGuard } from '../guards/language.guard';
import { TitleGuard } from '../guards/title.guard';

export const guards: GuardDefinition[] = [LanguageGuard, TitleGuard];
