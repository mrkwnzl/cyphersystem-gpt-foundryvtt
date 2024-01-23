import {cypherGPTForm, renderCypherGPTForm, setOpacity} from "./control-panel-form.js";

Hooks.on("init", async () => {
  // Register keybindings
  const {SHIFT, CONTROL, ALT} = KeyboardManager.MODIFIER_KEYS;

  game.keybindings.register("cyphersystem-gpt", "openWindow", {
    name: game.i18n.localize("CYPHERSYSTEM-GPT.OpenWindow"),
    editable: [
      {
        key: "KeyS",
        modifiers: [ALT]
      }
    ],
    onDown: async () => {
      cypherGPTForm();
    },
    repeat: false
  });

  game.settings.register("cyphersystem-gpt", "sheetOpacity", {
    name: game.i18n.localize("CYPHERSYSTEM-GPT.SheetOpacity"),
    hint: game.i18n.localize("CYPHERSYSTEM-GPT.SheetOpacityHint"),
    scope: "client",
    type: Number,
    default: 0,
    choices: {
      0: game.i18n.localize("CYPHERSYSTEM-GPT.SheetOpacityDefault"),
      1: game.i18n.localize("CYPHERSYSTEM-GPT.SheetOpacity25%"),
      2: game.i18n.localize("CYPHERSYSTEM-GPT.SheetOpacity50%"),
      3: game.i18n.localize("CYPHERSYSTEM-GPT.SheetOpacity75%"),
      4: game.i18n.localize("CYPHERSYSTEM-GPT.SheetOpacity100%")
    },
    config: true,
    requiresReload: false,
    onChange: () => {
      setOpacity();
      renderCypherGPTForm();
    },
  });
});

Hooks.on("getSceneControlButtons", function (hudButtons) {
  let tokenControls = hudButtons.find(val => {
    return val.name == "token";
  });
  if (tokenControls) {
    tokenControls.tools.push({
      name: "cypherGPT",
      title: game.i18n.localize("CYPHERSYSTEM-GPT.CypherSystemGPT"),
      icon: "fa-solid fa-robot",
      onClick: () => {
        cypherGPTForm();
      },
      button: true
    });
  }
});

