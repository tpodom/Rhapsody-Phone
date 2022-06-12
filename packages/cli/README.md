oclif-hello-world
=================

oclif example Hello World CLI

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/oclif-hello-world.svg)](https://npmjs.org/package/oclif-hello-world)
[![CircleCI](https://circleci.com/gh/oclif/hello-world/tree/main.svg?style=shield)](https://circleci.com/gh/oclif/hello-world/tree/main)
[![Downloads/week](https://img.shields.io/npm/dw/oclif-hello-world.svg)](https://npmjs.org/package/oclif-hello-world)
[![License](https://img.shields.io/npm/l/oclif-hello-world.svg)](https://github.com/oclif/hello-world/blob/main/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g @rhapsody-connect/cli
$ rhapsody-connect-cli COMMAND
running command...
$ rhapsody-connect-cli (--version)
@rhapsody-connect/cli/0.0.0 darwin-x64 node-v16.15.0
$ rhapsody-connect-cli --help [COMMAND]
USAGE
  $ rhapsody-connect-cli COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`rhapsody-connect-cli hello PERSON`](#rhapsody-connect-cli-hello-person)
* [`rhapsody-connect-cli hello world`](#rhapsody-connect-cli-hello-world)
* [`rhapsody-connect-cli help [COMMAND]`](#rhapsody-connect-cli-help-command)
* [`rhapsody-connect-cli plugins`](#rhapsody-connect-cli-plugins)
* [`rhapsody-connect-cli plugins:install PLUGIN...`](#rhapsody-connect-cli-pluginsinstall-plugin)
* [`rhapsody-connect-cli plugins:inspect PLUGIN...`](#rhapsody-connect-cli-pluginsinspect-plugin)
* [`rhapsody-connect-cli plugins:install PLUGIN...`](#rhapsody-connect-cli-pluginsinstall-plugin-1)
* [`rhapsody-connect-cli plugins:link PLUGIN`](#rhapsody-connect-cli-pluginslink-plugin)
* [`rhapsody-connect-cli plugins:uninstall PLUGIN...`](#rhapsody-connect-cli-pluginsuninstall-plugin)
* [`rhapsody-connect-cli plugins:uninstall PLUGIN...`](#rhapsody-connect-cli-pluginsuninstall-plugin-1)
* [`rhapsody-connect-cli plugins:uninstall PLUGIN...`](#rhapsody-connect-cli-pluginsuninstall-plugin-2)
* [`rhapsody-connect-cli plugins update`](#rhapsody-connect-cli-plugins-update)

## `rhapsody-connect-cli hello PERSON`

Say hello

```
USAGE
  $ rhapsody-connect-cli hello [PERSON] -f <value>

ARGUMENTS
  PERSON  Person to say hello to

FLAGS
  -f, --from=<value>  (required) Whom is saying hello

DESCRIPTION
  Say hello

EXAMPLES
  $ oex hello friend --from oclif
  hello friend from oclif! (./src/commands/hello/index.ts)
```

_See code: [dist/commands/hello/index.ts](https://github.com/tpodom/rhapsody-connect-cli/blob/v0.0.0/dist/commands/hello/index.ts)_

## `rhapsody-connect-cli hello world`

Say hello world

```
USAGE
  $ rhapsody-connect-cli hello world

DESCRIPTION
  Say hello world

EXAMPLES
  $ oex hello world
  hello world! (./src/commands/hello/world.ts)
```

## `rhapsody-connect-cli help [COMMAND]`

Display help for rhapsody-connect-cli.

```
USAGE
  $ rhapsody-connect-cli help [COMMAND] [-n]

ARGUMENTS
  COMMAND  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for rhapsody-connect-cli.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.1.12/src/commands/help.ts)_

## `rhapsody-connect-cli plugins`

List installed plugins.

```
USAGE
  $ rhapsody-connect-cli plugins [--core]

FLAGS
  --core  Show core plugins.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ rhapsody-connect-cli plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v2.0.11/src/commands/plugins/index.ts)_

## `rhapsody-connect-cli plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ rhapsody-connect-cli plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.

  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.

ALIASES
  $ rhapsody-connect-cli plugins add

EXAMPLES
  $ rhapsody-connect-cli plugins:install myplugin 

  $ rhapsody-connect-cli plugins:install https://github.com/someuser/someplugin

  $ rhapsody-connect-cli plugins:install someuser/someplugin
```

## `rhapsody-connect-cli plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ rhapsody-connect-cli plugins:inspect PLUGIN...

ARGUMENTS
  PLUGIN  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ rhapsody-connect-cli plugins:inspect myplugin
```

## `rhapsody-connect-cli plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ rhapsody-connect-cli plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.

  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.

ALIASES
  $ rhapsody-connect-cli plugins add

EXAMPLES
  $ rhapsody-connect-cli plugins:install myplugin 

  $ rhapsody-connect-cli plugins:install https://github.com/someuser/someplugin

  $ rhapsody-connect-cli plugins:install someuser/someplugin
```

## `rhapsody-connect-cli plugins:link PLUGIN`

Links a plugin into the CLI for development.

```
USAGE
  $ rhapsody-connect-cli plugins:link PLUGIN

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Links a plugin into the CLI for development.

  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.

EXAMPLES
  $ rhapsody-connect-cli plugins:link myplugin
```

## `rhapsody-connect-cli plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ rhapsody-connect-cli plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ rhapsody-connect-cli plugins unlink
  $ rhapsody-connect-cli plugins remove
```

## `rhapsody-connect-cli plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ rhapsody-connect-cli plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ rhapsody-connect-cli plugins unlink
  $ rhapsody-connect-cli plugins remove
```

## `rhapsody-connect-cli plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ rhapsody-connect-cli plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ rhapsody-connect-cli plugins unlink
  $ rhapsody-connect-cli plugins remove
```

## `rhapsody-connect-cli plugins update`

Update installed plugins.

```
USAGE
  $ rhapsody-connect-cli plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```
<!-- commandsstop -->
