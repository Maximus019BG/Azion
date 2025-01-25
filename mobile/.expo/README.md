> Why do I have a folder named ".expo" in my task?

The ".expo" folder is created when an Expo task is started using "expo start" command.

> What do the taskFiles contain?

- "devices.json": contains information about devices that have recently opened this task. This is used to populate the "Development sessions" list in your development builds.
- "packager-info.json": contains port numbers and process PIDs that are used to serve the application to the mobile device/simulator.
- "settings.json": contains the server configuration that is used to serve the application manifest.

> Should I commit the ".expo" folder?

No, you should not share the ".expo" folder. It does not contain any information that is relevant for other developers working on the task, it is specific to your machine.

Upon task creation, the ".expo" folder is already added to your ".gitignore" file.
