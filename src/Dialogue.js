var Convos = {
  "Flirts":
  {
    "Bapi":
    {
      "Sweet": [
                 {
                  "speaker": "<FLIRTER>",
                  "line": "Hey, I'm Bapi and I'm sweet."
                 }
              ],
      "Bold": [
                   {
                    "speaker": "<FLIRTER>",
                    "line": "This is another one! Hmm, it has a little more punctuation too to see how things look."
                   }
                ],
      "Brash": [
                 {
                  "speaker": "<FLIRTER>",
                  "line": "Hey, I'm Bapi and I'm brash."
                 }
              ],
    },
    "Chet":
    {
      "Sweet": [
                 {
                  "speaker": "<FLIRTER>",
                  "line": "Hey, I'm Chet and I'm talking."
                 }
              ],
      "Bold": [
                 {
                  "speaker": "<FLIRTER>",
                  "line": "Chet's bold line."
                 }
              ],
      "Brash": [
                 {
                  "speaker": "<FLIRTER>",
                  "line": "Chet's brash line"
                 }
              ],
    },
    "Locke":
    {
      "Sweet": [
                 {
                  "speaker": "<FLIRTER>",
                  "line": "I AM A FISH"
                 }
              ],
      "Bold": [
                 {
                  "speaker": "<FLIRTER>",
                  "line": "Fish's bold line."
                 }
              ],
      "Brash": [
                 {
                  "speaker": "<FLIRTER>",
                  "line": "Fish's brash line"
                 }
              ],
    },
    "Yang":
    {
      "Sweet": [
                 {
                  "speaker": "<FLIRTER>",
                  "line": "Daniel's a big fan of Final Fantasy IV."
                 }
              ],
      "Bold": [
                 {
                  "speaker": "<FLIRTER>",
                  "line": "Yang's bold line."
                 }
              ],
      "Brash": [
                 {
                  "speaker": "<FLIRTER>",
                  "line": "Yang's brash line"
                 }
              ],
    },
    "Joss":
    {
      "Sweet": [
                 {
                  "speaker": "<FLIRTER>",
                  "line": "Flirt flirt flirt! I'm not Joss Whedon."
                 }
              ],
      "Bold": [
                 {
                  "speaker": "<FLIRTER>",
                  "line": "Joss's bold line."
                 }
              ],
      "Brash": [
                 {
                  "speaker": "<FLIRTER>",
                  "line": "Joss's brash line"
                 }
              ],
    },
    "Sanders":
    {
      "Sweet": [
                 {
                  "speaker": "<FLIRTER>",
                  "line": "I was the first name Daniel wrote that wasn't four letters long."
                 }
              ],
      "Bold": [
                 {
                  "speaker": "<FLIRTER>",
                  "line": "Sanders' bold line."
                 }
              ],
      "Brash": [
                 {
                  "speaker": "<FLIRTER>",
                  "line": "Sanders' brash line"
                 }
              ],
    },
    "Neil":
    {
      "Sweet": [
               {
                "speaker": "<FLIRTER>",
                "line": "On your knees! Kneel before Neil!"
               }
              ],
      "Bold": [
                 {
                  "speaker": "<FLIRTER>",
                  "line": "Neil's bold line."
                 }
              ],
      "Brash": [
                 {
                  "speaker": "<FLIRTER>",
                  "line": "Neil's brash line"
                 }
              ],
    },
    "Jace":
    {
      "Sweet": [
                 {
                  "speaker": "<FLIRTER>",
                  "line": "How is this? Am I a cool sly flirter now?"
                 }
              ],
      "Bold": [
                 {
                  "speaker": "<FLIRTER>",
                  "line": "Jace's bold line."
                 }
              ],
      "Brash": [
                 {
                  "speaker": "<FLIRTER>",
                  "line": "Jace's brash line"
                 }
              ],
    },
    "Lester":
    {
      "Sweet": [
                 {
                  "speaker": "<FLIRTER>",
                  "line": "Daniel's running out of names now."
                 }
              ],
      "Bold": [
                 {
                  "speaker": "<FLIRTER>",
                  "line": "Lester's bold line."
                 }
              ],
      "Brash": [
                 {
                  "speaker": "<FLIRTER>",
                  "line": "Lester's brash line"
                 }
              ],
    },
  },
  "Responses": {
    "Generic" : {
      // Disgust
      "-1": [
              [
                {
                  "speaker": "<TARGET>",
                  "line": "Eugghh! What's wrong with you?!"
                }
              ],
              [
                {
                  "speaker": "<TARGET>",
                  "line": "Geez! Get out of here!"
                }
              ],
            ],

      // Unmoved
      "0": [
              [
                {
                  "speaker": "<TARGET>",
                  "line": "Eh... what?"
                }
              ],
              [
                {
                  "speaker": "<TARGET>",
                  "line": "Huh?"
                }
              ],
           ],

      // Successful flurt
      "1": [
              [
                {
                  "speaker": "<TARGET>",
                  "line": "Oh, well, I, um... *blush*",
                  "targetStagger": true
                }
              ],
              [
                {
                  "speaker": "<TARGET>",
                  "line": "Heh, heh... where did you come from?",
                  "targetStagger": true
                }
              ],
           ],

      // Flattered
      "2": [
              [
                {
                  "speaker": "<TARGET>",
                  "line": "Hot damn...",
                  "targetSwoon" : true
                }
              ],
              [
                {
                  "speaker": "<TARGET>",
                  "line": "Are you always this hunky?", //LOLOLOLOL I NEED SLEEP WHAT DID I WRITE
                  "targetSwoon" : true
                }
              ],
           ],

      // Infatuating Blow
      "3": [
              [
                {
                  "speaker": "<TARGET>",
                  "line": "*gasp* ...I don't think I've ever met someone that's made me feel this way."
                }
              ],
              [
                {
                  "speaker": "<TARGET>",
                  "line": "My heart aflutter at the sound of your breath!"
                }
              ],
           ],
    }
  },
  "Success": {
    "Generic":
              [
                [
                  {
                   "speaker": "<FLIRTER>",
                   "line": "Hey let's date."
                  },
                  {
                   "speaker": "<TARGET>",
                   "line": "Yeah. I gotta go get ready!"
                  }
                ],
                [
                  {
                   "speaker": "<TARGET>",
                   "line": "Uhhh..."
                  },
                  {
                    speaker: "<FLIRTER>",
                    "line": "You free later?"
                  },
                  {
                    speaker: "<TARGET>",
                    "line": "Yeah, I'll see you then!"
                  }
                ],
                [
                  {
                    speaker: "<FLIRTER>",
                    "line": "Hey, I was wondering..."
                  },
                  {
                    speaker: "<TARGET>",
                    "line": "..."
                  },
                  {
                    speaker: "<FLIRTER>",
                    "line": "You should skip all this raiding. Meet me later?"
                  },
                  {
                    speaker: "<TARGET>",
                    "line": "OH YES YOU FINALLY ASKED."
                  },
                ]
              ]
  },
  "Failure": {
    "Generic": [
                  [
                    {
                      speaker: "<FLIRTER>",
                      "line": "Man, I feel awful! I'm out of here...",
                    },
                  ],
               ]
  },
  "Dissing": {
    "Generic": [
                  [
                    {
                      speaker: "<TARGET>",
                      "line": "What's your deal? Why are you even here?"
                    },
                  ],
                  [
                    {
                      speaker: "<TARGET>",
                      "line": "Get outta here! Can't you see I'm in the middle of something?"
                    },
                  ],
                  [
                    {
                      speaker: "<TARGET>",
                      "line": "I don't understand your getup at all."
                    },
                  ],
               ]
  },
  "DissResponse": {
    "Generic": [
                  [
                    {
                      speaker: "<FLIRTER>",
                      "line": "Ugh...",
                      "flirterStagger": true
                    },
                  ],
                  [
                    {
                      speaker: "<FLIRTER>",
                      "line": "This is discouraging...",
                      "flirterStagger": true
                    },
                  ],
                  [
                    {
                      speaker: "<FLIRTER>",
                      "line": "Oh...",
                      "flirterStagger": true
                    },
                  ],
               ],
    "NoDamage": [
                  [
                    {
                      speaker: "<FLIRTER>",
                      "line": "Whatever! I'm fabulous! "
                    },
                  ],
                  [
                    {
                      speaker: "<FLIRTER>",
                      "line": "Is that supposed to leave me discouraged?"
                    },
                  ],
                  [
                    {
                      speaker: "<FLIRTER>",
                      "line": "Man, you play hard to get!"
                    },
                  ],
               ],
  },
  "Other": {
    //
  },
};