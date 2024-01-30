# Hydron <img src="https://cdn.jsdelivr.net/gh/nteract/hydron@17eda24547a2195b4a21c883af3dd12ec50bd442/static/animate-logo.svg" alt="hydron animated logo" height="50px" align="right" />

[![CI](https://github.com/nteract/hydron/actions/workflows/CI.yml/badge.svg)](https://github.com/nteract/hydron/actions/workflows/CI.yml)

Hydron is an interactive coding environment that supports Python, R, JavaScript and [other Jupyter kernels](https://github.com/jupyter/jupyter/wiki/Jupyter-kernels).

Checkout our [Documentation](https://nteract.gitbooks.io/hydron/) and [Medium blog post](https://medium.com/nteract/hydron-interactive-computing-in-atom-89d291bcc4dd) to see what you can do with Hydron.

![hero](https://cloud.githubusercontent.com/assets/13285808/20360886/7e03e524-ac03-11e6-9176-37677f226619.gif)

## Contents

1. [Background](#background)
2. [Features](#features)
3. [Plugins for Hydron](#plugins-for-hydron)
4. [Useful external packages](#useful-external-packages)
5. [How it works](#how-it-works)
6. [Why "Hydron"?](#why-hydron)
7. [Contributing](#contributing)
8. [Changelog](#changelog)
9. [License](#license)

## Background

Hydron was inspired by Bret Victor's ideas about the power of instantaneous feedback and the design of [Light Table](http://lighttable.com/). Running code inline and in real time is a more natural way to develop. By bringing the interactive style of Light Table to the rock-solid usability of Pulsar, Hydron makes it easy to write code the way you want to.

You also may be interested in our latest project – [nteract](https://github.com/nteract/nteract) – a desktop application that wraps up the best of the web based Jupyter notebook.

## Features

- execute a line, selection, or block at a time
- rich media support for plots, images, and video
- watch expressions let you keep track of variables and re-run snippets after every change
- completions from the running kernel, just like autocomplete in the Chrome dev tools
- code can be inspected to show useful information provided by the running kernel
- one kernel per language (so you can run snippets from several files, all in the same namespace)
- interrupt or restart the kernel if anything goes wrong
- use a custom kernel connection (for example to run code inside Docker), read more in the "Custom kernel connection (inside Docker)" section

## [Documentation](https://nteract.gitbooks.io/hydron/)

- [Installation](https://nteract.gitbooks.io/hydron/docs/Installation.html)
- [Usage](https://nteract.gitbooks.io/hydron/docs/Usage/GettingStarted.html)
  - [Getting started](https://nteract.gitbooks.io/hydron/docs/Usage/GettingStarted.html)
  - [Examples](https://nteract.gitbooks.io/hydron/docs/Usage/Examples.html)
  - [Notebook Import and Export](https://nteract.gitbooks.io/hydron/docs/Usage/NotebookFiles.html)
  - [Remote Kernels](https://nteract.gitbooks.io/hydron/docs/Usage/RemoteKernelConnection.html)
- [Troubleshooting Guide](https://nteract.gitbooks.io/hydron/docs/Troubleshooting.html)
- [Style Customization](https://nteract.gitbooks.io/hydron/docs/StyleCustomization.html)
- [Plugin API](https://nteract.gitbooks.io/hydron/docs/PluginAPI.html)

## Plugins for Hydron

Hydron has support for plugins. Feel free to add your own to the list:

- [Hydron Launcher](https://github.com/lgeiger/hydron-launcher): launches terminals and Jupyter consoles connected to Hydron
- [hydron-python](https://github.com/nikitakit/hydron-python): provides various Python-specific features
- [Data Explorer](https://github.com/BenRussert/data-explorer): allows you to use [nteract data-explorer](https://github.com/BenRussert/data-explorer) within Hydron

If you are interested in building a plugin take a look at our [plugin API documentation](https://nteract.gitbooks.io/hydron/docs/PluginAPI.html).

## Useful external packages

Here is a list of external packages that could be useful when using Hydron (without using Hydron plugin API, as such they're mostly only related to the UIs):

- [markdown-cell-highlight](https://github.com/aviatesk/atom-markdown-cell-highlight): highlights code cells in markdown files
- [Cell Navigation](https://github.com/hoishing/cell-navigation): enables easy jumps between Hydron code cells
- [Hydron Cell Separator](https://github.com/jhabriel/hydron-cell-separator): gives simple horizontal line decorations for Hydron code cells

If you find/create a package that you think can be useful when used in combination with Hydron, feel free to make a PR and add it.

## How it works

Hydron implements the [messaging protocol](http://jupyter-client.readthedocs.io/en/latest/messaging.html) for [Jupyter](https://jupyter.org/). Jupyter (formerly IPython) uses ZeroMQ to connect a client (like Hydron) to a running kernel (like IJulia or iTorch). The client sends code to be executed to the kernel, which runs it and sends back results.

## Why "Hydron"?

Hydron atoms make up 90% of Jupiter by volume.

Plus, it was easy to make a logo.

## Contributing

Thanks for taking the time to contribute. Take a look at our [Contributing Guide](https://github.com/nteract/hydron/blob/master/CONTRIBUTING.md) to get started.

Then, take a look at any issue labeled [good first issue](https://github.com/nteract/hydron/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) or [help wanted](https://github.com/nteract/hydron/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22) that has not been claimed. These are great starting points.

## Changelog

Every release is documented on the [GitHub Releases page](https://github.com/nteract/hydron/releases).

## License

This project is licensed under the MIT License - see the [LICENSE.md](https://github.com/nteract/hydron/blob/master/LICENSE.md) file for details

**[⬆ back to top](#contents)**
