/** One marker over a screenshot, positioned as a percentage of the image. */
export type Pin = {
  x: number;
  y: number;
  /** What the reader is looking at, in the app's own words. */
  label: string;
  /** Why it matters here. One sentence, tied to something the course teaches. */
  note: string;
};


/**
 * Pins for the thirteen screenshots the course already ships.
 *
 * Every note here was written after opening the file it belongs to. That is
 * the only rule that matters: a pin which would fit any screenshot of any app
 * teaches nothing, costs attention, and makes the reader trust the next pin
 * less. Where a capture only earns two pins, it gets two.
 *
 * Coordinates are percentages of the image, so they hold at any display size.
 * Keys are the file's basename, which is how the layer matches a pin set to a
 * figure already on the page.
 */
export const PIN_SETS: Record<string, Pin[]> = {
  'hermes-desktop-overview.webp': [
    {
      x: 41.8,
      y: 91.8,
      label: 'Start with a goal',
      note: 'Not “send a message”. The prompt asks for an outcome, and that single word is the difference between a chat product and a harness: you say where you want to end up, the agent works out the steps.',
    },
    {
      x: 7.6,
      y: 42.8,
      label: 'SESSIONS 46/425',
      note: 'Sessions accumulate, they never merge. Each one opens with an empty context, which is exactly why lesson 04 spends its time on what the agent remembers and what it forgets.',
    },
    {
      x: 5.0,
      y: 14.6,
      label: 'Skills & Tools',
      note: 'Lesson 09 lives here. A skill is something the agent knows how to do; a tool is something it can reach. Two different problems, one menu.',
    },
    {
      x: 9.2,
      y: 19.7,
      label: 'Messaging',
      note: 'Lesson 05. This is the door out of this window: the agent reaches you where you already are instead of waiting for you to come back.',
    },
    {
      x: 5.0,
      y: 24.8,
      label: 'Artifacts',
      note: 'What the agent produced, kept out of the transcript. Files stay files rather than being pasted into a conversation you then have to scroll.',
    },
    {
      x: 21.2,
      y: 98.8,
      label: 'Cron',
      note: 'Lesson 11. Scheduled runs: the agent acts on its own timetable, with nobody watching. This is the point where “assistant” stops being the right word.',
    },
    {
      x: 7.6,
      y: 98.8,
      label: 'Gateway ready',
      note: 'A status, not a button. It means the agent is reachable from outside the app, which is the precondition for everything in lessons 05 and 11.',
    },
    {
      x: 83.8,
      y: 91.8,
      label: 'Minimax M3 · Max',
      note: 'The model is a setting in the corner of the screen, not the product. Swapping it changes cost and speed and leaves the rest of your setup untouched, which is the argument lesson 03 makes.',
    },
  ],

  'hermes-install-page.jpg': [
    {
      x: 13.4,
      y: 6.1,
      label: 'hermes-agent.nousresearch.com',
      note: 'Type the address, do not search for it. Installers are the most rewarding thing on the internet to impersonate, and a lookalike domain costs an attacker nothing.',
    },
    {
      x: 18.8,
      y: 84.7,
      label: 'Download for Windows',
      note: 'The course default. The button reads your system, so it says Windows here and something else on a Mac; there is no wrong version to pick.',
    },
    {
      x: 26.4,
      y: 92.5,
      label: 'Install via terminal',
      note: 'The other path, and deliberately not the one this lesson takes. Choose it only if you can already say why you would.',
    },
    {
      x: 17.0,
      y: 46.6,
      label: 'Open source, MIT license',
      note: 'You can read every line and run it anywhere. That is what makes the dedicated-machine advice in lesson 02 something you can verify rather than something you take on trust.',
    },
  ],

  'hermes-installer-progress.jpg': [
    {
      x: 27.9,
      y: 8.8,
      label: 'Subsequent launches will skip this step',
      note: 'Read the second sentence. This screen belongs to the first run only. If you ever see it again, something reset your install.',
    },
    {
      x: 4.3,
      y: 12.8,
      label: '0 of 16 steps complete',
      note: 'Sixteen named steps rather than one spinner. You can always say which step is running, which means you can always say which one failed.',
    },
    {
      x: 6.5,
      y: 34.2,
      label: 'Python, Git, Node, ripgrep, ffmpeg',
      note: 'The installer fetches its own toolchain and adds Hermes to your PATH. This is precisely why lesson 02 asks for a machine you do not mind it changing.',
    },
    {
      x: 97.0,
      y: 17.7,
      label: '10s',
      note: 'Each step shows its own elapsed time, so a stall looks different from slow progress instead of leaving you to guess.',
    },
    {
      x: 4.0,
      y: 97.7,
      label: 'Show details',
      note: 'Where to look when a step stops moving. It prints the real command output rather than a friendlier summary of it.',
    },
  ],

  'hermes-provider-setup.jpg': [
    {
      x: 41.9,
      y: 49.1,
      label: 'Nous Portal, marked Recommended',
      note: 'The paid default, and genuinely the smoothest path. This lesson still does not take it: everything in the course finishes on a free key.',
    },
    {
      x: 65.3,
      y: 58.9,
      label: 'I have an API key',
      note: 'The free path, and the least prominent thing on the screen. That placement is a business decision, not a signal about quality.',
    },
    {
      x: 49.9,
      y: 55.8,
      label: 'Other providers',
      note: 'Collapsed by default. Open it only if you already hold an account somewhere else; otherwise it is a menu of decisions you do not need yet.',
    },
    {
      x: 36.1,
      y: 58.9,
      label: 'I will choose a provider later',
      note: 'Skipping here leaves the agent with no brain. It installs, opens, and then declines to answer, which reads like a broken install and is not one.',
    },
  ],

  'opencode-api-keys.jpg': [
    {
      x: 27.6,
      y: 41.8,
      label: 'Name it after the machine',
      note: 'In six months the name is the only thing that lets you revoke the right key without breaking something else that still depends on one.',
    },
    {
      x: 32.9,
      y: 51.2,
      label: 'Create',
      note: 'The key is shown once, at creation, and never again. Copy it now; the dashboard cannot show it to you a second time.',
    },
    {
      x: 50.4,
      y: 77.6,
      label: 'The copy icon',
      note: 'Existing keys stay masked in the list. This button is the only retrieval path, which is exactly the behaviour you want from anything holding a secret.',
    },
    {
      x: 27.2,
      y: 77.5,
      label: 'One row per machine',
      note: 'Two keys here, not one shared everywhere. When a laptop goes missing you revoke its row and nothing else stops working.',
    },
  ],

  'hermes-api-keys-verify.jpg': [
    {
      x: 28.3,
      y: 25.5,
      label: 'The filled dot',
      note: 'Filled means a key is stored for that provider. Hollow means the row is empty and is only showing you an invitation to paste one.',
    },
    {
      x: 66.2,
      y: 25.5,
      label: 'The masked value',
      note: 'Stored keys show their first characters and last four. You can confirm a key is present, and confirm which one, without ever exposing it.',
    },
    {
      x: 67.4,
      y: 31.7,
      label: 'Paste Anthropic key',
      note: 'Every provider Hermes knows is listed whether you use it or not. Only the one you picked needs a key; the empty rows are the normal state, not a to-do list.',
    },
    {
      x: 31.8,
      y: 8.8,
      label: 'Local / custom endpoint',
      note: 'Where a model running on your own machine would be pointed, Ollama or llama.cpp. Nothing in this lesson needs it; it is the door the course opens later.',
    },
  ],

  'hermes-free-models.jpg': [
    {
      x: 58.1,
      y: 59.2,
      label: 'Typing free',
      note: 'There is no free tab. The word is matched against the model names, which is why the filter works and also why it is not a guarantee of anything.',
    },
    {
      x: 69.3,
      y: 76.5,
      label: 'The tick',
      note: 'Marks what is loaded right now. Changing the selection affects your next message; it does not re-answer the one above it.',
    },
    {
      x: 59.1,
      y: 83.4,
      label: 'Grouped by who serves them',
      note: 'Not by who made them. The same model can appear under two providers with different rate limits and different prices.',
    },
    {
      x: 65.9,
      y: 96.0,
      label: 'The model chip',
      note: 'The active model stays readable at the bottom of the window, so you never have to guess which brain produced an answer.',
    },
  ],

  'hermes-first-chat.jpg': [
    {
      x: 42.8,
      y: 12.5,
      label: 'The reply',
      note: 'One answer is the entire proof of this lesson. If it appears, the key, the provider and the app are all wired correctly and nothing else needs checking.',
    },
    {
      x: 39.3,
      y: 9.4,
      label: 'Thought briefly',
      note: 'A collapsed trace. Open it and you see the reasoning that preceded the answer, which is the difference between accepting an output and checking one.',
    },
    {
      x: 5.5,
      y: 33.0,
      label: 'Sessions, six minutes to forty-one days',
      note: 'The list is history, not memory. Every one of these opened with an empty context, which is the distinction lesson 04 is built on.',
    },
    {
      x: 90.9,
      y: 4.5,
      label: 'The gear, Ctrl and comma',
      note: 'Everything the next five lessons configure lives behind this one icon. Learning the shortcut now saves a great deal of hunting later.',
    },
  ],

  'hermes-pet.jpg': [
    {
      x: 79.5,
      y: 15.6,
      label: 'Tool Call Display',
      note: 'Not decoration. Product hides the raw tool payloads, Technical shows the full input and output. Switch it the first time you need to know exactly what the agent sent rather than a summary of it.',
    },
    {
      x: 75.6,
      y: 22.5,
      label: 'Inline Embeds',
      note: 'A privacy control filed under appearance. Always means every link in a transcript fetches from a third-party site on its own; Ask keeps that as your decision, one site at a time.',
    },
    {
      x: 28.7,
      y: 30.4,
      label: 'The pet',
      note: 'It runs while tools execute, celebrates on success and sulks on errors. Decorative, and also the only ambient signal that something is happening while you are not reading the transcript.',
    },
    {
      x: 34.0,
      y: 76.3,
      label: 'Showing 60 of 4516',
      note: 'Four and a half thousand mascots is a joke. It also tells you there is a plugin catalogue behind this screen, which lesson 09 comes back to.',
    },
  ],

  'hermes-manage-profiles.jpg': [
    {
      x: 10.8,
      y: 96.4,
      label: 'The three dots',
      note: 'Bottom of the sidebar, no label until you hover, and this is the only way in. Everything about profiles starts at a control most people never click.',
    },
    {
      x: 65.5,
      y: 97.6,
      label: 'The model chip',
      note: 'Worth noticing before you continue: a profile carries its own model setting, so this chip can read differently from one profile to the next.',
    },
  ],

  'hermes-new-profile.jpg': [
    {
      x: 49.6,
      y: 33.2,
      label: 'Independent Hermes environments',
      note: 'Independent means what it says: separate config, separate skills, separate SOUL.md. Two profiles cannot leak into each other, which is the entire safety argument of this lesson.',
    },
    {
      x: 40.7,
      y: 48.3,
      label: 'Clone from default',
      note: 'Cloning copies config, skills and SOUL.md from the source. Start here and edit, rather than from an empty profile you then have to furnish by hand.',
    },
    {
      x: 43.2,
      y: 54.7,
      label: 'SOUL.md, marked optional',
      note: 'Marked optional, and it is the one field that decides who the agent is. Leave it blank and you get the stock assistant under a different name.',
    },
    {
      x: 58.0,
      y: 60.2,
      label: 'The template, pasted',
      note: 'No file browsing and no path to get right. The field is the file: paste the text, press Create profile, and the agent is written to disk for you.',
    },
  ],

  'hermes-messaging-telegram.jpg': [
    {
      x: 60.0,
      y: 42.6,
      label: 'Without it, anyone can DM your bot',
      note: 'Hermes labels the allowlist recommended. Read its own warning and treat it as required: empty means any stranger who finds your bot is talking to your agent.',
    },
    {
      x: 61.6,
      y: 9.2,
      label: 'Three states, not one',
      note: 'Disabled, Needs setup, and Messaging gateway stopped all have to clear. A valid token on its own will not make the bot answer if the gateway is not running.',
    },
    {
      x: 59.5,
      y: 32.4,
      label: 'Bot token',
      note: 'It comes from BotFather, not from Hermes. It is a password for your bot, so it belongs in the vault of lesson 08 rather than in a note or a chat with yourself.',
    },
    {
      x: 14.2,
      y: 30.0,
      label: 'Twenty-six channels',
      note: 'The lesson needs exactly one. The length of the list is the point: the agent should reach you where you already are, not give you somewhere new to check.',
    },
  ],

  'hermes-approval-mode.jpg': [
    {
      x: 78.1,
      y: 13.5,
      label: 'Manual, Smart, Off',
      note: 'Three settings and no fourth. Smart is the default and what this lesson keeps. Off removes the question entirely, which is the one you never want while you are still learning what the agent will try.',
    },
    {
      x: 79.5,
      y: 28.8,
      label: 'Redact Secrets',
      note: 'Leave it on. It hides detected secrets from what the model can see, so a key pasted by mistake does not travel out with the prompt.',
    },
    {
      x: 79.5,
      y: 47.4,
      label: 'File Checkpoints',
      note: 'Rollback snapshots taken before file edits. This is the setting that makes a wrong edit recoverable instead of final, and it costs nothing to leave on.',
    },
    {
      x: 33.0,
      y: 33.9,
      label: 'Allow Private URLs',
      note: 'Off by default and worth leaving off. It stops the agent reaching addresses on your own network, which is the part of your setup a stranger cannot reach but the agent can.',
    },
    {
      x: 76.5,
      y: 23.3,
      label: 'Command Allowlist',
      note: 'Empty means nothing is pre-approved and every command still asks. Fill it only with commands you would be happy to see run while you are away from the screen.',
    },
  ],

  'hermes-vault-setup.webp': [
    {
      x: 55.5,
      y: 6.5,
      label: 'The first message',
      note: 'A goal, not a command. Nothing here names a tool or a shell; the folders, the readme and the paths are all worked out on the other side.',
    },
    {
      x: 46.7,
      y: 31.4,
      label: 'The second message',
      note: 'One sentence. The vault already exists, so filing something new costs a line rather than a procedure, and that gap is the whole return on the setup above it.',
    },
    {
      x: 42.3,
      y: 42.6,
      label: 'Read deltav.cc.md, 1.1s',
      note: 'Every tool call is listed with what it touched and how long it took. Nothing happens off the record, which is what makes the transcript auditable rather than merely readable.',
    },
    {
      x: 43.0,
      y: 67.6,
      label: 'Saved to memory, 3 entries',
      note: 'The moment the vault stops being folders and becomes memory: three entries the agent can recall in a session that has not started yet.',
    },
  ],
};
