import { Command } from './command';
import { Ping } from './commands/Ping';
import { Manga } from './commands/Manga';
import { Random } from './commands/Random';

export const Commands: Command[] = [Ping, Manga, Random];