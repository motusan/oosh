# oosh

Oosh is a declarative, visual, distributed music-making platform.

Built on [Node](https://nodejs.org/), [Sails](http://sailsjs.org/), [Mongo](https://www.mongodb.com/),
SocketIO, WebAudio and WebMIDI.

A project is a set of screens, i.e. devices running oosh in a web browser.

Each screen can have any number of event emitters attached to it, e.g. computer keyboards, pointing devices, MIDI instruments, audio input devices, touch screens, accelerometers, etc. Screens connected to the project can send and receive messages to and from all other screens in the project.

Each screen can be configured with any number of widgets. A widget can handle events broadcast to the project,
generate its own events, or both. Widgets can handle messages any number of ways, e.g. play musical notes or
audio samples, generate visualizations, ...

For example, a project might consist of a laptop computer and a mobile smartphone. The phone's accelerometer
broadcasts movement events to the project. The laptop computer can set up a widget to interpret those movement
events and map them to MIDI notes that will be transmitted to an attached MIDI-enabled workstation. At the
same time, another widget on the laptop can map the movement event data to audio samples on the keyboard...
