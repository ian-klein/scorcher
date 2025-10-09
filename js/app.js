'use strict';

import { splashPage } from './splashPage.js';
import { loadEventDiary } from './data.js';

await loadEventDiary();
splashPage.init();
