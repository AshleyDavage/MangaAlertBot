import { Command } from './command';
import { Ping } from './commands/Ping';
import { Manga } from './commands/Manga';

export const Commands: Command[] = [Ping, Manga];