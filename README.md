# Infodemic Inc.

An interactive game about platform governance, misinformation, and digital ethics.

## Overview

Infodemic Inc. is an educational game that puts players in the role of a social media platform manager navigating the challenges of content moderation, misinformation, and platform governance.

The game features a branching narrative where each decision impacts your platform's profit and reputation scores, creating meaningful consequences for player choices.

The game can be played at [https://infodemic.gg](https://infodemic.gg).

The game engine is designed to be customizable and can be used with other contents, allowing educators and researchers to adapt the platform for different narratives and educational objectives.

The game is responsive and runs in a browser without the need of a backend, so its simple and cheap to deploy.

## Creating Your Own Stories

1. **Create a Twine Story**: Use [Twine](https://twinery.org/) to create your interactive story
   - Twine is a free, open-source tool for creating interactive fiction
   - Design your branching narrative with choices
   - Export your story as a `.twee` file

2. **Convert to JSON**: Use the included Python script to convert your Twine story to the game's JSON format
   ```
   python convert_twee_to_json.py <input_twee_file> <output_json_file>
   ```

### Twee File Format Guidelines

The game engine expects a specific format in your Twee files:

- Each passage becomes a game node with an ID
- Include two choices for every game node
- Score changes can be added with `(set: $profit to it +5)` or `(set: $legitimacy to it -10)`
- Section breaks can be indicated with `<!--Section break-->`
- Section breaks can include background images with:
  ```
  (set: $mobileImage to "images/your-mobile-image.png")
  (set: $desktopImage to "images/your-desktop-image.png")
  ```

See the included sample Twee files for examples.

## Project Structure

- `/images` - Game graphics and illustrations
- `/templates` - HTML templates for game components
- `data.json` / `data-spanish.json` - Game content in JSON format
- `script.js` - Game logic and interaction handling
- `style.css` - Game styling with responsive design
- `convert_twee_to_json.py` - Conversion utility for Twine/Twee stories

## Credits

Infodemic Inc. was developed by a consortium of the University of Helsinki, the University of Oxford and the University of Florence. The game is part of the project [InfoLead – Information and media literacy programme for judges and policymakers](https://gulbenkian.pt/emifund/projects/infolead-information-and-media-literacy-programme-for-judges-and-policymakers/), funded by the European Media and Information Fund. [Big Blue Comms](https://bigbluecomms.com) handled the technical implementation and graphic design.

## License

This project is released under the [Creative Commons Attribution 4.0 International License (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/). This means you are free to:

- Share — copy and redistribute the material in any medium or format
- Adapt — remix, transform, and build upon the material for any purpose, even commercially

Under the following terms:
- Attribution — You must give appropriate credit, provide a link to the license, and indicate if changes were made.