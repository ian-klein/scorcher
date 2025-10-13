'use strict';

import { splashPage } from './splashPage.js';
import { loadData } from './data.js';

await loadData();
splashPage.init();
