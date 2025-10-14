//Defines the default data to bootstrapo the application

'use strict';

class Bootstrap {
    constructor() {
        this.players = {
            "players": [
                {
                "lastName": "Klein",
                "firstName": "Ian",
                "gender": "male",
                "email": "ian.klein14@gmail.com"
                }
            ]
        };
        this.admins = [ "ian.klein14@gmail.com" ];
        this.diary = {
            "events": [
                { "date": "2025-10-08", "name": "Stableford",       "type": "stableford" },
                { "date": "2025-10-15", "name": "Stableford",       "type": "stableford" },
                { "date": "2025-10-22", "name": "6B/6W/6G",         "type": "other" },
                { "date": "2025-10-29", "name": "Stableford",       "type": "stableford" },
                { "date": "2025-11-05", "name": "Greensomes",       "type": "other" },
                { "date": "2025-11-12", "name": "Turkey Trot",      "type": "other" },
                { "date": "2025-11-19", "name": "Hidden Pairs",     "type": "stableford" },
                { "date": "2025-11-26", "name": "Stableford",       "type": "stableford" },
                { "date": "2025-12-03", "name": "Team Waltz",       "type": "other" },
                { "date": "2025-12-10", "name": "Stableford",       "type": "stableford" },
                { "date": "2025-12-17", "name": "Stableford",       "type": "stableford" },
                { "date": "2025-12-24", "name": "Christmas Eve",    "type": "other" },
                { "date": "2025-12-31", "name": "Sign up and play", "type": "other" }
            ]
        };
        this.course = {
            "male": {
                "black": {
                    "parTotal": 72,
                    "sr": 129,
                    "cr": 71.4,
                    "par": [ 5, 3, 4, 4,  5,  3, 5,  4,  3, 5,  4, 4,  4, 3, 4,  4, 4,  4],
                    "si":  [12, 4, 2, 8, 16, 18, 6, 10, 14, 7, 17, 3, 15, 9, 1, 13, 5, 11]
                },
                "white": {
                    "parTotal": 72,
                    "sr": 119,
                    "cr": 68.6,
                    "par": [ 5, 3, 4, 4,  5,  3, 5,  4,  3, 5,  4, 4,  4, 3, 4,  4, 4,  4],
                    "si":  [12, 4, 2, 8, 16, 18, 6, 10, 14, 7, 17, 3, 15, 9, 1, 13, 5, 11]
                },
                "gold": {
                    "parTotal": 69,
                    "sr": 113,
                    "cr": 66.6,
                    "par": [ 5,  3, 4, 4, 4,  3, 4,  4,  3,  4, 4,  4,  4,  3, 4, 4, 4,  4],
                    "si":  [ 7, 15, 3, 5, 9, 17, 1, 11, 13, 12, 6, 14, 16, 18, 2, 8, 4, 10]
            }
            },
            "female": {
                "white": {
                    "parTotal": 72,
                    "sr": 137,
                    "cr": 74.5,
                    "par": [ 5, 3, 4, 4,  5,  3, 5,  4,  3, 5,  4, 4,  4, 3, 4,  4, 4,  4],
                    "si":  [12, 4, 2, 8, 16, 18, 6, 10, 14, 7, 17, 3, 15, 9, 1, 13, 5, 11]
                },
                "gold": {
                    "parTotal": 72,
                    "sr": 129,
                    "cr": 72.4,
                    "par": [ 5, 3,  4, 4, 5,  3, 5,  4,  3,  5, 4,  4,  4,  3, 4, 4, 4,  4],
                    "si":  [ 7, 15, 3, 5, 9, 17, 1, 11, 13, 12, 6, 14, 16, 18, 2, 8, 4, 10]
                }
            }
        };
    }

}

export const bootstrap = new Bootstrap();
