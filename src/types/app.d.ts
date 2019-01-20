import { Executable } from './common';

interface AppInterface extends Runnable, Completable {}

interface Completable {
  ready(executable: Executable): void;
}

interface Runnable {
  run(): Completable;
}

export { AppInterface, Runnable, Completable };
