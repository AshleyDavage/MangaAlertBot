import { Command } from './command';
import { Ping } from './commands/Ping';
import { Search } from './commands/Search';
import { Random } from './commands/Random';

export const Commands: Command[] = [Ping, Search, Random];