import {cypherGPTForm} from "./control-panel-form.js";

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

