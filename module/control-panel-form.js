/**
* Extend the basic ActorSheet with some very simple modifications
* @extends {FormApplication}
*/

export class CypherGPTSheet extends FormApplication {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["cyphersystem-gpt", "sheet"],
      template: "modules/cyphersystem-gpt/templates/control-panel-form.html",
      title: game.i18n.localize("CYPHERSYSTEM-GPT.CypherSystemGPT"),
      tabs: [{
        navSelector: ".sheet-tabs", contentSelector: ".tabs-content", initial: "chat"
      }],
      closeOnSubmit: false,
      submitOnChange: false,
      submitOnClose: false,
      width: 512,
      height: 544,
      resizable: true
    });
  }

  getData() {
    // Basic data
    const data = super.getData().object;

    // Return data
    return data;
  }

  // _updateObject(event, formData) {
  //   let data = this.object;

  //   console.log(formData);

  //   data.input = formData["prompt-input"];
  //   data.output = formData["prompt-output"];

  //   console.log(data);

  //   // Render sheet
  //   this.render();
  // }

  /**
  * Event listeners for roll engine dialog sheets
  */
  activateListeners(html) {
    super.activateListeners(html);

    let data = this.object;

    // Find elements
    let promptInput = document.getElementById('prompt-input');
    let searchInput = document.getElementById('search-input');
    let randomButton = document.getElementById('prompt-random');
    let submitButton = document.getElementById('prompt-submit');
    let quickSubmitButton = document.getElementById('quick-submit');
    let outputTextElement = document.getElementById("prompt-output");
    let navChatButton = document.getElementById("nav-chat");
    let navQuickButton = document.getElementById("nav-quick");
    let navGeneratorButton = document.getElementById("nav-generator");
    let navSearchButton = document.getElementById("nav-search");
    let importGeneratorButton = document.getElementById("generator-import");
    let searchSubmitButton = document.getElementById("search-submit");

    // Chat button
    html.find('#nav-chat').click(async clickEvent => {
      // Wait a millisecond
      await new Promise(resolve => setTimeout(resolve, 1));
      promptInput.focus();
    });

    // Search button
    html.find('#nav-search').click(async clickEvent => {
      await new Promise(resolve => setTimeout(resolve, 1));
      searchInput.focus();
    });

    // Submit button
    html.find('.prompt-submit').click(async clickEvent => {
      // Find prompt
      let prompt = html.find('.prompt-input').val() || false;
      let url = (prompt) ? `https://app.lostcompanypress.com/gpt/v1/generate?q=${prompt}` : false;

      // Submit prompt
      submitPrompt(url);
    });

    // Random prompt
    html.find('.prompt-random').click(async clickEvent => {
      // Random prompts
      let randomPrompts = [
        "Provide me with some random NPCs for a fantasy setting.",
        "Provide me with five ideas for GMIs in social situations.",
        "Provide me with five ideas for GMIs in combat situations.",
        "Provide me with five ideas for GMIs in exploration situations.",
        "Give me a description of a pub in a sci-fi setting",
        "How does Effort work?",
        "What are some foci appropriate for wizards?",
        "Show me the difficulty and target level table.",
        "What are some cyphers that help with defense tasks?",
        "Provide me with some random descriptions of cyphers in a technofantasy setting."
      ];

      // Choose random prompt
      let prompt;
      do {
        prompt = randomPrompts[Math.floor(Math.random() * randomPrompts.length)];
      } while (prompt === promptInput.value);

      // Set prompt as value of prompt input
      promptInput.value = prompt;

      // Focus prompt input
      promptInput.focus();
    });

    // Submit quick button
    html.find('.quick-submit').click(async clickEvent => {
      // Find prompt
      let genre = html.find('input[name="genre-quick"]:checked').val();
      let thing = html.find('input[name="thing-quick"]:checked').val();
      let prompt = `provide some ideas for ${thing} in a ${genre} setting. include rules from the cypher system if appropriate.`;
      let url = `https://app.lostcompanypress.com/gpt/v1/generate?q=${prompt}`;

      // Submit prompt
      submitPrompt(url);
    });

    // Generate button
    html.find('.generator-submit').click(async clickEvent => {
      // Find prompt
      let genre = html.find('input[name="genre-generator"]:checked').val();
      let thing = html.find('input[name="thing-generator"]:checked').val();
      let foundryJSON = (thing == "character") ? "?foundry_json=1" : "";
      let url = `https://app.lostcompanypress.com/gpt/v1/new_random_${thing}/${genre}${foundryJSON}`;

      // Fetch data
      submitPrompt(url);
    });

    // Import button
    html.find('.generator-import').click(async clickEvent => {
      let actorData = JSON.parse(importGeneratorButton.getAttribute('data-json'));

      // Create notification for missing permission
      if (!game.settings.get("core", "permissions").ACTOR_CREATE.includes(game.user.role)) {
        ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM-GPT.NoPermissionToCreateActors"));
        return;
      }

      Actor.create(actorData)
        .then(actor => {
          actor.sheet.render(true);
        });
    });

    // Search button
    html.find('.search-submit').click(async clickEvent => {
      // Find prompt
      let prompt = html.find('.search-input').val() || false;
      let scope = html.find('input[name="search"]:checked').val();
      let url = (prompt) ? `https://app.lostcompanypress.com/gpt/v1/search?q=${prompt}&search_type=${scope}` : false;

      // Submit prompt
      submitPrompt(url);
    });

    // Ctrl+Enter to submit chat
    promptInput.addEventListener('keydown', function (event) {
      if (event.ctrlKey || event.metaKey && event.keyCode === 13) {
        if (submitButton.classList.contains('disabled')) return;
        submitButton.click();
      }
    });

    // Ctrl+Enter to submit search
    searchInput.addEventListener('keydown', function (event) {
      if (event.ctrlKey || event.metaKey && event.keyCode === 13) {
        if (searchSubmitButton.classList.contains('disabled')) return;
        searchSubmitButton.click();
      }
    });

    // Focus when label is clicked
    // Select all labels
    let labels = document.querySelectorAll('.radio-label.search');

    // Add a click event listener to each label
    labels.forEach(label => {
      label.addEventListener('click', () => {
        // Focus the searchInput
        searchInput.focus();
      });
    });

    // Helper functions
    // Submit prompt
    async function submitPrompt(url) {
      // Reset defaults
      resetDefaults();

      // Check for url
      if (!url) {
        outputTextElement.innerHTML = game.i18n.localize("CYPHERSYSTEM-GPT.PleaseEnterAPrompt");
        return;
      }

      // Disable button & input
      disableButtons();

      // Waiting message
      outputTextElement.innerHTML = game.i18n.localize("CYPHERSYSTEM-GPT.AwaitResponse");
      outputTextElement.classList.add("dot-animation");

      // Fetch & handle data
      let outputObject = await fetchData(url);

      // Display data
      if (outputObject.foundry_json) {
        // Create a new textarea element
        let textarea = document.createElement('textarea');

        // Copy the attributes and content from the outputTextElement to the textarea
        for (let i = 0; i < outputTextElement.attributes.length; i++) {
          let attr = outputTextElement.attributes[i];
          textarea.setAttribute(attr.name, attr.value);
          textarea.setAttribute('disabled', '');
        }
        textarea.textContent = outputTextElement.textContent;

        // Replace the outputTextElement with the textarea in the DOM
        outputTextElement.parentNode.replaceChild(textarea, outputTextElement);

        // Update the reference to the outputTextElement
        outputTextElement = textarea;
        outputTextElement.innerHTML = outputObject.text_character_sheet;
        importGeneratorButton.setAttribute('data-json', JSON.stringify(outputObject.foundry_json));
        importGeneratorButton.classList.remove("disabled");
      } else if (outputObject.help) {
        outputTextElement.innerHTML = outputObject.help;
      }
      outputTextElement.classList.remove("dot-animation");

      // Re-enable button & input
      enableButtons();
    }

    function resetDefaults() {
      // Reset import button
      importGeneratorButton.classList.add("disabled");
      importGeneratorButton.setAttribute('data-json', '');

      // Check if outputTextElement is a textarea
      if (outputTextElement.tagName === "TEXTAREA") {
        // Create a new div element
        let div = document.createElement('div');

        // Copy the attributes and content from the outputTextElement to the div
        for (let i = 0; i < outputTextElement.attributes.length; i++) {
          let attr = outputTextElement.attributes[i];
          div.setAttribute(attr.name, attr.value);
        }
        div.innerHTML = outputTextElement.value;

        // Replace the outputTextElement with the div in the DOM
        outputTextElement.parentNode.replaceChild(div, outputTextElement);

        // Update the reference to the outputTextElement
        outputTextElement = div;
      }
    }

    function disableButtons() {
      // Disable button & input
      submitButton.classList.add("disabled");
      quickSubmitButton.classList.add("disabled");
      randomButton.classList.add("disabled");
      promptInput.setAttribute("disabled", "");
      navChatButton.classList.add("disabled");
      navQuickButton.classList.add("disabled");
      navGeneratorButton.classList.add("disabled");
      navSearchButton.classList.add("disabled");

      // Select all labels with the class "radio-label"
      let labels = document.querySelectorAll('label.radio-label');

      // Iterate over the labels
      labels.forEach(function (label) {
        // Add the "disabled" class to the label
        label.classList.add('disabled');
      });
    }

    function enableButtons() {
      // Re-enable button & input
      submitButton.classList.remove("disabled");
      quickSubmitButton.classList.remove("disabled");
      randomButton.classList.remove("disabled");
      promptInput.removeAttribute("disabled");
      navChatButton.classList.remove("disabled");
      navQuickButton.classList.remove("disabled");
      navGeneratorButton.classList.remove("disabled");
      navSearchButton.classList.remove("disabled");

      // Select all labels with the class "radio-label"
      let labels = document.querySelectorAll('label.radio-label');

      // Iterate over the labels
      labels.forEach(function (label) {
        // Add the "disabled" class to the label
        label.classList.remove('disabled');
      });
    }
  }
}

async function fetchData(url) {
  // Fetch data
  let outputObject;
  try {
    let moduleJson = await fetch('modules/cyphersystem-gpt/module.json');
    let module = await moduleJson.json();
    let key = atob(module.flags.key);

    let fetchOutput = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${key}`
      }
    });

    // Parse data
    outputObject = await fetchOutput.json();
  } catch (error) {
    outputObject = {
      "help": game.i18n.localize("CYPHERSYSTEM-GPT.NoResponse")
    };
  }

  // Return data
  return outputObject;
}

// This is used to create a new GMI form, unless there is already one there
export async function cypherGPTForm() {
  // Create cypherGPTForm
  let cypherGPTForm = Object.values(ui.windows).find((app) => app instanceof CypherGPTSheet) || new CypherGPTSheet();

  // Render sheet
  cypherGPTForm.render(true);
}

// This is used to check whether a GMI Range for is already there and re-render it when it is
export async function renderCypherGPTForm() {
  let cypherGPTForm = Object.values(ui.windows).find((app) => app instanceof CypherGPTSheet);

  console.log(cypherGPTForm);
  if (cypherGPTForm) {
    cypherGPTForm.render(true, {focus: false});
  }
}