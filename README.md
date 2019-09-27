# SVG Maze Maker

![A piece of wood with a maze pattern laser engraved in the shape of the word MIKE.](https://github.com/mikewheel/svg-maze-maker/blob/master/result_laser_cut.jpg?raw=true)

This is a simple MVC web app that creates SVG mazes in the browser.
The app uses Kruskal's algorithm to generate the mazes; my code 
mirrors the pseudocode found on Wikipedia's pages for 
[Kruskal's Algorithm](https://en.wikipedia.org/wiki/Kruskal%27s_algorithm) and
[Disjoint-Set Data Structures](https://en.wikipedia.org/wiki/Disjoint-set_data_structure).
I used D3.js for the view, but the model and controller are vanilla JavaScript.

This code exists because I wanted to laser cut a sign with my name on it,
and I thought that a randomly generated maze would look cool filling the
space around the letters. Those of you who have taken Fundies 2 at 
Northeastern will recognize the project as pretty much the same as the 
maze-generator assignment in that class -- only this time in the browser
and without the animated depth-first search.

Enjoy!
