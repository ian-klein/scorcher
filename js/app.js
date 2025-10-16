'use strict';

import { splashPage } from './splashPage.js';
import { data } from './data.js';

await data.loadData();
splashPage.init();
