<!-- Start lib/plugin-api/hydron-provider.js -->

## HydronProvider

Version: 1.0.0

The Plugin API allows you to make Hydron awesome.
You will be able to interact with this class in your Hydron Plugin using
Pulsar's [Service API](http://blog.atom.io/2015/03/25/new-services-API.html).

Take a look at our [Example Plugin](https://github.com/lgeiger/hydron-example-plugin)
and the [Pulsar Flight Manual](http://flight-manual.atom.io/hacking-atom/) for
learning how to interact with Hydron in your own plugin.

## onDidChangeKernel(Callback)

Calls your callback when the kernel has changed.

### Params:

- **Function** _Callback_

## getActiveKernel()

Get the `HydronKernel` of the currently active text editor.

### Return:

- **Class** `HydronKernel`

## getCellRange()

Get the `atom$Range` that will run if `hydron:run-cell` is called.
`null` is returned if no active text editor.

### Return:

- **Class** `atom$Range`

---

<!-- End lib/plugin-api/hydron-provider.js -->

<!-- Start lib/plugin-api/hydron-kernel.js -->

## HydronKernel

The `HydronKernel` class wraps Hydron's internal representation of kernels
and exposes a small set of methods that should be usable by plugins.

## language

The language of the kernel, as specified in its kernelspec

## displayName

The display name of the kernel, as specified in its kernelspec

## addMiddleware(middleware)

Add a kernel middleware, which allows intercepting and issuing commands to
the kernel.

If the methods of a `middleware` object are added/modified/deleted after
`addMiddleware` has been called, the changes will take effect immediately.

### Params:

- **HydronKernelMiddleware** _middleware_

## onDidDestroy(Callback)

Calls your callback when the kernel has been destroyed.

### Params:

- **Function** _Callback_

## getConnectionFile()

Get the [connection file](http://jupyter-notebook.readthedocs.io/en/latest/examples/Notebook/Connecting%20with%20the%20Qt%20Console.html) of the kernel.

### Return:

- **String** Path to connection file.

<!-- End lib/plugin-api/hydron-kernel.js -->
