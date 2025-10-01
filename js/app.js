// Main application entry point
import { ScoreEntryController } from './scoreEntryController.js';

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const scoreEntryController = new ScoreEntryController();
    scoreEntryController.init();
});
