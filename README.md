# dischord

The goal of Dischord is to generate near-completely random sequences of chords.
This is accomplished using two one-dimensional cellular automata.
The bottom automaton determines the timing and length of each chord.
The top automaton determines the frequencies of the notes that will be played in the chord, based on the provided scale.
Both automata generate patterns that cannot be reproduced without the seed and rules, except by NP processes.
Read more about the randomness at <a target="_blank" href="http://www.stephenwolfram.com/publications/cellular-automata-complexity/pdfs/random-sequence-generation-cellular-automata.pdf">http://www.stephenwolfram.com/publications/cellular-automata-complexity/pdfs/random-sequence-generation-cellular-automata.pdf</a>.
Created by <a href="http://reubenbrenneradams.com">Reuben Brenner-Adams</a> using <a target="_blank" href="https://github.com/abbernie/tune">Tune.js</a> and <a target="_blank" href="https://github.com/Theodeus/tuna">Tuna.js</a>
Copyright 2016.
