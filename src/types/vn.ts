export interface DialogueLine {
  id: string;
  speaker: string;
  text: string;
  portrait?: string; // Optional URL/path to a portrait
}

export interface StoryScript {
  id: string;
  title: string;
  lines: DialogueLine[];
}
