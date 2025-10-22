import importlib,traceback

try:
    importlib.import_module('app')
    print('MODULE_IMPORTED_OK')
except Exception:
    traceback.print_exc()
