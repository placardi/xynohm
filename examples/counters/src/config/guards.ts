import { GuardDefinition } from '../../../../src/types/guard';
import { LanguageGuard } from '../guards/language.guard';
import { TitleGuard } from '../guards/title.guard';

export const guards: GuardDefinition[] = [LanguageGuard, TitleGuard];
