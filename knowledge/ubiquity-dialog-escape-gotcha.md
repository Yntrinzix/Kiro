# Util.showDialog Escape Key Binding is Broken in Modern Browsers

## Discovery
Date: 2026-04-22
Repo: QT-Ubi-UbiquityBackend
Feature: database-change-alert (PR3)

## Detail

`Util.showDialog` in `mvc/mvc/Assets/Javascripts/Util.js` (~line 1533) binds the Escape key via `keypress`:

```javascript
target.unbind("keypress").keypress(function (e) {
    if (e.keyCode == /*esc*/27) {
        Util.hideDialog(target);
    }
});
```

The `keypress` event does NOT fire for Escape in modern browsers - only `keydown` does. This means the built-in Escape-to-close behavior is broken for any dialog relying solely on `Util.showDialog`.

## Impact

- Any new dialog that needs Escape-to-close MUST add its own `keydown` handler
- The design doc for database-change-alert assumes Escape handling is provided by existing `Util.showDialog()` - that assumption is wrong
- Existing dialogs (delete_column_dialog, archive_column_dialog, etc.) likely also have broken Escape handling

## Workaround

Add a `keydown` handler alongside or instead of relying on `Util.showDialog`'s built-in binding:

```javascript
dialog.on('keydown.escapeClose', function(e) {
    if (e.key === 'Escape') {
        Util.hideDialog(dialog);
        // cleanup focus trap, re-enable buttons, etc.
    }
});
```
