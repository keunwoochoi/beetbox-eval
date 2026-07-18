# BEETBOX - Beat sequencing • channel desk.

A faithful recreation of the Beetbox drum machine sequencer web application.

## Features

- **16-Step Sequencer Grid**: Click cells to add or remove beats
- **12 Drum Tracks**: Lead, Bass, Kick, Snare, Clap, Hi-hat, Open hat, Rimshot, Tom, Cowbell, Shaker, Crash
- **Playback Controls**: Play/Stop button with space bar shortcut
- **Tempo Control**: Adjust BPM from 60-200
- **Swing**: Add swing to the beat (0-50%)
- **Volume**: Master volume control
- **Channel Selection**: 5 drum kit channels to choose from
- **Pitch Selection**: Choose from 7 different notes (A, C, D, E, G, A+, C+)
- **Track Muting**: Click track names to mute individual tracks
- **Clear/Randomize**: Clear all beats or generate a random pattern
- **Visualizer**: Real-time audio visualization
- **Responsive Design**: Dark theme with monospace font styling

## Usage

Open `index.html` in a web browser to start using Beetbox.

### Keyboard Shortcuts
- **Space**: Play/Stop

### Mouse Interactions
- **Click Grid Cells**: Toggle beat on/off
- **Click Track Names**: Mute/unmute track
- **Click Chord Buttons**: Select note pitch
- **Click Channel Buttons**: Switch drum kit

## File Structure

- `index.html` - Main HTML structure
- `styles.css` - Styling and layout
- `script.js` - Core sequencer logic and interactions

## Technical Details

- Built with vanilla HTML, CSS, and JavaScript
- No external dependencies
- Web Audio API for sound generation
- Responsive canvas-based visualizer
- Monospace font design matching the Beetbox aesthetic
