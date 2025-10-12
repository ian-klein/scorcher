'use strict';

import { splashPage } from './splashPage.js';
import { loadEventDiary, loadPlayers } from './data.js';

await loadEventDiary();
await loadPlayers();
splashPage.init();
