import {
  Emitter,
  CompositeDisposable,
  Disposable,
  Point,
  TextEditor,
  Grammar,
} from "atom";
import { StatusBar } from "atom/status-bar";
import debounce from "lodash/debounce";
import { autorun } from "mobx";
import React from "react";
import InspectorPane from "./panes/inspector";
import WatchesPane from "./panes/watches";
import OutputPane from "./panes/output-area";
import KernelMonitorPane from "./panes/kernel-monitor";
import Config from "./config";
import ZMQKernel from "./zmq-kernel";
import WSKernel from "./ws-kernel";
import Kernel from "./kernel";
import KernelPicker from "./kernel-picker";
import WSKernelPicker from "./ws-kernel-picker";
import ExistingKernelPicker from "./existing-kernel-picker";
import HydronProvider from "./plugin-api/hydron-provider";
import store, { Store, StoreLike } from "./store";
import { KernelManager } from "./kernel-manager";
import services from "./services";
import * as commands from "./commands";
import * as codeManager from "./code-manager";
import * as result from "./result";
import {
  log,
  isMultilanguageGrammar,
  INSPECTOR_URI,
  WATCHES_URI,
  OUTPUT_AREA_URI,
  KERNEL_MONITOR_URI,
  hotReloadPackage,
  openOrShowDock,
  kernelSpecProvidesGrammar,
} from "./utils";
import { exportNotebook } from "./export-notebook";
import { importNotebook, ipynbOpener } from "./import-notebook";
import type { KernelspecMetadata } from "@nteract/types";

export const config = Config.schema;
let emitter: Emitter<{}, { "did-change-kernel": Kernel }> | undefined;
let kernelPicker: KernelPicker | undefined;
let existingKernelPicker: ExistingKernelPicker | undefined;
let wsKernelPicker: WSKernelPicker | undefined;
let hydronProvider: HydronProvider | undefined;
const kernelManager = new KernelManager();

export function activate() {
  emitter = new Emitter();
  let skipLanguageMappingsChange = false;
  store.subscriptions.add(
    atom.config.onDidChange(
      "Hydron.languageMappings",
      ({ newValue, oldValue }) => {
        if (skipLanguageMappingsChange) {
          skipLanguageMappingsChange = false;
          return;
        }

        if (store.runningKernels.length != 0) {
          skipLanguageMappingsChange = true;
          atom.config.set("Hydron.languageMappings", oldValue);
          atom.notifications.addError("Hydron", {
            description:
              "`languageMappings` cannot be updated while kernels are running",
            dismissable: false,
          });
        }
      }
    )
  );
  store.subscriptions.add(
    atom.config.observe("Hydron.statusBarDisable", (newValue) => {
      store.setConfigValue("Hydron.statusBarDisable", Boolean(newValue));
    }),
    atom.config.observe("Hydron.statusBarKernelInfo", (newValue) => {
      store.setConfigValue("Hydron.statusBarKernelInfo", Boolean(newValue));
    })
  );
  store.subscriptions.add(
    atom.commands.add<"atom-text-editor:not([mini])">(
      "atom-text-editor:not([mini])",
      {
        "hydron:run": () => run(),
        "hydron:run-all": () => runAll(),
        "hydron:run-all-above": () => runAllAbove(),
        "hydron:run-and-move-down": () => run(true),
        "hydron:run-cell": () => runCell(),
        "hydron:run-cell-and-move-down": () => runCell(true),
        "hydron:toggle-watches": () => atom.workspace.toggle(WATCHES_URI),
        "hydron:toggle-output-area": () => commands.toggleOutputMode(),
        "hydron:toggle-kernel-monitor": async () => {
          const lastItem = atom.workspace.getActivePaneItem();
          const lastPane = atom.workspace.paneForItem(lastItem);
          await atom.workspace.toggle(KERNEL_MONITOR_URI);
          if (lastPane) {
            lastPane.activate();
          }
        },
        "hydron:start-local-kernel": () => startZMQKernel(),
        "hydron:connect-to-remote-kernel": () => connectToWSKernel(),
        "hydron:connect-to-existing-kernel": () => connectToExistingKernel(),
        "hydron:add-watch": () => {
          if (store.kernel) {
            store.kernel.watchesStore.addWatchFromEditor(store.editor);
            openOrShowDock(WATCHES_URI);
          }
        },
        "hydron:remove-watch": () => {
          if (store.kernel) {
            store.kernel.watchesStore.removeWatch();
            openOrShowDock(WATCHES_URI);
          }
        },
        "hydron:update-kernels": async () => {
          await kernelManager.updateKernelSpecs();
        },
        "hydron:toggle-inspector": () => commands.toggleInspector(store),
        "hydron:interrupt-kernel": () =>
          handleKernelCommand(
            {
              command: "interrupt-kernel",
            },
            store
          ),
        "hydron:restart-kernel": () =>
          handleKernelCommand(
            {
              command: "restart-kernel",
            },
            store
          ),
        "hydron:shutdown-kernel": () =>
          handleKernelCommand(
            {
              command: "shutdown-kernel",
            },
            store
          ),
        "hydron:clear-result": () => result.clearResult(store),
        "hydron:export-notebook": () => exportNotebook(),
        "hydron:fold-current-cell": () => foldCurrentCell(),
        "hydron:fold-all-but-current-cell": () => foldAllButCurrentCell(),
        "hydron:clear-results": () => result.clearResults(store),
      }
    )
  );
  store.subscriptions.add(
    atom.commands.add("atom-workspace", {
      "hydron:import-notebook": importNotebook,
    })
  );

  if (atom.inDevMode()) {
    store.subscriptions.add(
      atom.commands.add("atom-workspace", {
        "hydron:hot-reload-package": () => hotReloadPackage(),
      })
    );
  }

  store.subscriptions.add(
    atom.workspace.observeActiveTextEditor((editor) => {
      store.updateEditor(editor);
    })
  );
  store.subscriptions.add(
    atom.workspace.observeTextEditors((editor) => {
      const editorSubscriptions = new CompositeDisposable();
      editorSubscriptions.add(
        editor.onDidChangeGrammar(() => {
          store.setGrammar(editor);
        })
      );

      if (isMultilanguageGrammar(editor.getGrammar())) {
        editorSubscriptions.add(
          editor.onDidChangeCursorPosition(
            debounce(() => {
              store.setGrammar(editor);
            }, 75)
          )
        );
      }

      editorSubscriptions.add(
        editor.onDidDestroy(() => {
          editorSubscriptions.dispose();
        })
      );
      editorSubscriptions.add(
        editor.onDidChangeTitle((newTitle) => store.forceEditorUpdate())
      );
      store.subscriptions.add(editorSubscriptions);
    })
  );
  hydronProvider = null;
  store.subscriptions.add(
    atom.workspace.addOpener((uri) => {
      switch (uri) {
        case INSPECTOR_URI:
          return new InspectorPane(store);

        case WATCHES_URI:
          return new WatchesPane(store);

        case OUTPUT_AREA_URI:
          return new OutputPane(store);

        case KERNEL_MONITOR_URI:
          return new KernelMonitorPane(store);
        default: {
          return;
        }
      }
    })
  );
  store.subscriptions.add(atom.workspace.addOpener(ipynbOpener));
  store.subscriptions.add(
    // Destroy any Panes when the package is deactivated.
    new Disposable(() => {
      atom.workspace.getPaneItems().forEach((item) => {
        if (
          item instanceof InspectorPane ||
          item instanceof WatchesPane ||
          item instanceof OutputPane ||
          item instanceof KernelMonitorPane
        ) {
          item.destroy();
        }
      });
    })
  );
  autorun(() => {
    emitter.emit("did-change-kernel", store.kernel);
  });
}

export function deactivate() {
  store.dispose();
}

/*-------------- Service Providers --------------*/
export function provideHydron() {
  if (!hydronProvider) {
    hydronProvider = new HydronProvider(emitter);
  }

  return hydronProvider;
}

export function provideAutocompleteResults() {
  return services.provided.autocomplete.provideAutocompleteResults(store);
}

/*-----------------------------------------------*/

/*-------------- Service Consumers --------------*/
export function consumeAutocompleteWatchEditor(
  watchEditor: (...args: Array<any>) => any
) {
  return services.consumed.autocomplete.consume(store, watchEditor);
}

export function consumeStatusBar(statusBar: StatusBar) {
  return services.consumed.statusBar.addStatusBar(
    store,
    statusBar,
    handleKernelCommand
  );
}

/*-----------------------------------------------*/
function connectToExistingKernel() {
  if (!existingKernelPicker) {
    existingKernelPicker = new ExistingKernelPicker();
  }

  existingKernelPicker.toggle();
}

interface KernelCommand {
  command: string;
  payload?: KernelspecMetadata | null | undefined;
}

function handleKernelCommand(
  { command, payload }: KernelCommand, // TODO payload is not used!
  { kernel, markers }: Store | StoreLike
) {
  log("handleKernelCommand:", [
    { command, payload },
    { kernel, markers },
  ]);

  if (!kernel) {
    const message = "No running kernel for grammar or editor found";
    atom.notifications.addError(message);
    return;
  }

  if (command === "interrupt-kernel") {
    kernel.interrupt();
  } else if (command === "restart-kernel") {
    kernel.restart();
  } else if (command === "shutdown-kernel") {
    if (markers) {
      markers.clear();
    }
    // Note that destroy alone does not shut down a WSKernel
    kernel.shutdown();
    kernel.destroy();
  } else if (
    command === "rename-kernel" &&
    kernel.transport instanceof WSKernel
  ) {
    kernel.transport.promptRename();
  } else if (command === "disconnect-kernel") {
    if (markers) {
      markers.clear();
    }
    kernel.destroy();
  }
}

function run(moveDown: boolean = false) {
  const editor = store.editor;
  if (!editor) {
    return;
  }
  // https://github.com/nteract/hydron/issues/1452
  atom.commands.dispatch(editor.element, "autocomplete-plus:cancel");
  const codeBlock = codeManager.findCodeBlock(editor);

  if (!codeBlock) {
    return;
  }

  const codeNullable = codeBlock.code;
  if (codeNullable === null) {
    return;
  }
  const { row } = codeBlock;
  const cellType = codeManager.getMetadataForRow(editor, new Point(row, 0));
  const code =
    cellType === "markdown"
      ? codeManager.removeCommentsMarkdownCell(editor, codeNullable)
      : codeNullable;

  if (moveDown) {
    codeManager.moveDown(editor, row);
  }

  checkForKernel(store, (kernel) => {
    result.createResult(store, {
      code,
      row,
      cellType,
    });
  });
}

function runAll(breakpoints?: Array<Point> | null | undefined) {
  const { editor, kernel, grammar, filePath } = store;
  if (!editor || !grammar || !filePath) {
    return;
  }

  if (isMultilanguageGrammar(editor.getGrammar())) {
    atom.notifications.addError(
      '"Run All" is not supported for this file type!'
    );
    return;
  }

  if (editor && kernel) {
    _runAll(editor, kernel, breakpoints);

    return;
  }

  kernelManager.startKernelFor(grammar, editor, filePath, (kernel: Kernel) => {
    _runAll(editor, kernel, breakpoints);
  });
}

function _runAll(
  editor: TextEditor,
  kernel: Kernel,
  breakpoints?: Array<Point>
) {
  const cells = codeManager.getCells(editor, breakpoints);

  for (const cell of cells) {
    const { start, end } = cell;
    const codeNullable = codeManager.getTextInRange(editor, start, end);
    if (codeNullable === null) {
      continue;
    }
    const row = codeManager.escapeBlankRows(
      editor,
      start.row,
      codeManager.getEscapeBlankRowsEndRow(editor, end)
    );
    const cellType = codeManager.getMetadataForRow(editor, start);
    const code =
      cellType === "markdown"
        ? codeManager.removeCommentsMarkdownCell(editor, codeNullable)
        : codeNullable;
    checkForKernel(store, (kernel) => {
      result.createResult(store, {
        code,
        row,
        cellType,
      });
    });
  }
}

function runAllAbove() {
  const { editor, kernel, grammar, filePath } = store;
  if (!editor || !grammar || !filePath) {
    return;
  }

  if (isMultilanguageGrammar(editor.getGrammar())) {
    atom.notifications.addError(
      '"Run All Above" is not supported for this file type!'
    );
    return;
  }

  if (editor && kernel) {
    _runAllAbove(editor, kernel);

    return;
  }

  kernelManager.startKernelFor(grammar, editor, filePath, (kernel: Kernel) => {
    _runAllAbove(editor, kernel);
  });
}

function _runAllAbove(editor: TextEditor, kernel: Kernel) {
  const cursor = editor.getCursorBufferPosition();
  cursor.column = editor.getBuffer().lineLengthForRow(cursor.row);
  const breakpoints = codeManager.getBreakpoints(editor);
  breakpoints.push(cursor);
  const cells = codeManager.getCells(editor, breakpoints);

  for (const cell of cells) {
    const { start, end } = cell;
    const codeNullable = codeManager.getTextInRange(editor, start, end);
    const row = codeManager.escapeBlankRows(
      editor,
      start.row,
      codeManager.getEscapeBlankRowsEndRow(editor, end)
    );
    const cellType = codeManager.getMetadataForRow(editor, start);

    if (codeNullable !== null) {
      const code =
        cellType === "markdown"
          ? codeManager.removeCommentsMarkdownCell(editor, codeNullable)
          : codeNullable;
      checkForKernel(store, (kernel) => {
        result.createResult(store, {
          code,
          row,
          cellType,
        });
      });
    }

    if (cell.containsPoint(cursor)) {
      break;
    }
  }
}

function runCell(moveDown: boolean = false) {
  const editor = store.editor;
  if (!editor) {
    return;
  }
  // https://github.com/nteract/hydron/issues/1452
  atom.commands.dispatch(editor.element, "autocomplete-plus:cancel");
  const { start, end } = codeManager.getCurrentCell(editor);
  const codeNullable = codeManager.getTextInRange(editor, start, end);
  if (codeNullable === null) {
    return;
  }
  const row = codeManager.escapeBlankRows(
    editor,
    start.row,
    codeManager.getEscapeBlankRowsEndRow(editor, end)
  );
  const cellType = codeManager.getMetadataForRow(editor, start);
  const code =
    cellType === "markdown"
      ? codeManager.removeCommentsMarkdownCell(editor, codeNullable)
      : codeNullable;

  if (moveDown) {
    codeManager.moveDown(editor, row);
  }

  checkForKernel(store, (kernel) => {
    result.createResult(store, {
      code,
      row,
      cellType,
    });
  });
}

function foldCurrentCell() {
  const editor = store.editor;
  if (!editor) {
    return;
  }
  codeManager.foldCurrentCell(editor);
}

function foldAllButCurrentCell() {
  const editor = store.editor;
  if (!editor) {
    return;
  }
  codeManager.foldAllButCurrentCell(editor);
}

function startZMQKernel() {
  kernelManager
    .getAllKernelSpecsForGrammar(store.grammar)
    .then((kernelSpecs) => {
      if (kernelPicker) {
        kernelPicker.kernelSpecs = kernelSpecs;
      } else {
        kernelPicker = new KernelPicker(kernelSpecs);

        kernelPicker.onConfirmed = (kernelSpec: KernelspecMetadata) => {
          const { editor, grammar, filePath, markers } = store;
          if (!editor || !grammar || !filePath || !markers) {
            return;
          }
          markers.clear();
          kernelManager.startKernel(kernelSpec, grammar, editor, filePath);
        };
      }

      kernelPicker.toggle();
    });
}

function connectToWSKernel() {
  if (!wsKernelPicker) {
    wsKernelPicker = new WSKernelPicker((transport: WSKernel) => {
      const kernel = new Kernel(transport);
      const { editor, grammar, filePath, markers } = store;
      if (!editor || !grammar || !filePath || !markers) {
        return;
      }
      markers.clear();
      if (kernel.transport instanceof ZMQKernel) {
        kernel.destroy();
      }
      store.newKernel(kernel, filePath, editor, grammar);
    });
  }

  wsKernelPicker.toggle((kernelSpec: KernelspecMetadata) =>
    kernelSpecProvidesGrammar(kernelSpec, store.grammar)
  );
}

// Accepts store as an arg
function checkForKernel(
  {
    editor,
    grammar,
    filePath,
    kernel,
  }: {
    editor: TextEditor;
    grammar: Grammar;
    filePath: string;
    kernel?: Kernel;
  },
  callback: (kernel: Kernel) => void
) {
  if (!filePath || !grammar) {
    return atom.notifications.addError(
      "The language grammar must be set in order to start a kernel. The easiest way to do this is to save the file."
    );
  }

  if (kernel) {
    callback(kernel);
    return;
  }

  kernelManager.startKernelFor(grammar, editor, filePath, (newKernel: Kernel) =>
    callback(newKernel)
  );
}
